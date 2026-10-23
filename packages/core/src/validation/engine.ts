import { taxRegimeFor } from '../countries/regions';
import type { CountryPack } from '../countries/types';
import { fromCents, lineCents, pctCents, sumCents, toCents } from '../money';
import { ExtractedDocumentSchema, type ExtractedDocument } from '../schemas/extracted';
import {
  TAX_MATH_CODES,
  ValidationReportSchema,
  type ComputedBracket,
  type ComputedTotals,
  type ValidationIssue,
  type ValidationReport,
} from '../schemas/validated';
import { issue } from './issue';

export const DEFAULT_TOLERANCE = 0.02;

export interface ValidateOptions {
  /** Max accepted absolute difference, in currency units. */
  tolerance?: number;
}

const sameRate = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const isPriced = (doc: ExtractedDocument) => doc.docType === 'INVOICE' || doc.docType === 'CREDIT_NOTE';

/**
 * Country-agnostic deterministic validation. Everything country-specific comes
 * from the pack (tax ids, legal rates, number format for messages, extra rules).
 * Pure function: same input → same report, no I/O, no LLM.
 */
export function validateDocument(input: ExtractedDocument, pack: CountryPack, opts: ValidateOptions = {}): ValidationReport {
  const tol = toCents(opts.tolerance ?? DEFAULT_TOLERANCE);
  const fmt = (cents: number) => pack.formatAmount(fromCents(cents));
  const issues: ValidationIssue[] = [];

  const parsed = ExtractedDocumentSchema.safeParse(input);
  if (!parsed.success) {
    return report(pack, emptyTotals(), null, false, null, [
      ...parsed.error.issues.map((zi) => issue('SCHEMA', 'error', `${zi.path.join('.')}: ${zi.message}`, { path: zi.path.join('.') })),
    ]);
  }
  const doc = parsed.data;
  const regime = taxRegimeFor(doc, pack);

  // --- Header -------------------------------------------------------------
  if (doc.currency !== pack.currency) {
    issues.push(issue('CURRENCY_MISMATCH', 'error', `Currency ${doc.currency}, expected ${pack.currency}`, { path: 'currency' }));
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(doc.issueDate) || pack.parseDate(doc.issueDate) === null) {
    issues.push(issue('INVALID_DATE', 'error', `Date "${doc.issueDate}" is not a valid date (YYYY-MM-DD)`, { path: 'issueDate' }));
  }

  let taxIdValid = false;
  let taxIdType: string | null = null;
  if (!doc.issuer.taxId) {
    issues.push(issue('MISSING_FIELD', 'error', 'Issuer tax id is missing', { path: 'issuer.taxId' }));
  } else {
    const check = pack.validateTaxId(doc.issuer.taxId);
    taxIdValid = check.valid;
    taxIdType = check.type;
    if (!check.valid) {
      issues.push(
        issue('INVALID_TAX_ID', 'error', `Issuer tax id "${doc.issuer.taxId}" is invalid (${check.type}): ${check.reason ?? ''}`.trim(), {
          path: 'issuer.taxId',
        }),
      );
    }
  }

  // --- Lines --------------------------------------------------------------
  const priced = isPriced(doc);
  const computedLines: ComputedTotals['lines'] = [];
  const byRate = new Map<number, { rate: number; baseCents: number; perLineTaxCents: number }>();

  doc.lines.forEach((line, i) => {
    const label = `Line ${i + 1} ("${line.description}")`;
    const hasMoney = line.unitPrice !== null && line.lineAmount !== null && line.taxRate !== null;

    if (!hasMoney) {
      computedLines.push({ index: i, expectedAmount: null });
      if (priced) {
        const missing = (['unitPrice', 'taxRate', 'lineAmount'] as const).filter((k) => line[k] === null);
        issues.push(
          issue('MISSING_FIELD', 'error', `${label}: missing ${missing.join(', ')}`, { path: `lines.${i}.${missing[0]}`, lineIndex: i }),
        );
      }
      return;
    }

    const expected = lineCents(line.quantity, line.unitPrice!, line.discountPct);
    const printed = toCents(line.lineAmount!);
    computedLines.push({ index: i, expectedAmount: fromCents(expected) });

    if (Math.abs(expected - printed) > tol) {
      const disc = line.discountPct ? ` − ${line.discountPct} %` : '';
      issues.push(
        issue(
          'LINE_MATH',
          'error',
          `${label}: ${line.quantity} × ${pack.formatAmount(line.unitPrice!)}${disc} = ${fmt(expected)} ≠ ${fmt(printed)} printed`,
          { path: `lines.${i}.lineAmount`, lineIndex: i, expected: fromCents(expected), found: fromCents(printed) },
        ),
      );
    }
    if (!regime.allowedTaxRates.some((r) => sameRate(r, line.taxRate!))) {
      issues.push(
        issue(
          'RATE_NOT_ALLOWED',
          'error',
          `${label}: rate ${line.taxRate} % is not allowed in ${regime.label} (${regime.allowedTaxRates.join(', ')} %)`,
          { path: `lines.${i}.taxRate`, lineIndex: i, found: line.taxRate },
        ),
      );
    }

    // Brackets are built from the printed line amounts; the multiplication is checked above.
    const key = [...byRate.keys()].find((r) => sameRate(r, line.taxRate!)) ?? line.taxRate!;
    const group = byRate.get(key) ?? { rate: line.taxRate!, baseCents: 0, perLineTaxCents: 0 };
    group.baseCents += printed;
    group.perLineTaxCents += pctCents(printed, line.taxRate!);
    byRate.set(key, group);
  });

  // --- Tax brackets ---------------------------------------------------------
  const groups = [...byRate.values()].sort((a, b) => a.rate - b.rate);
  const brackets: ComputedBracket[] = [];
  const hasBreakdown = doc.printedTaxBreakdown.length > 0;

  if (priced && groups.length && !hasBreakdown) {
    issues.push(issue('NO_TAX_BREAKDOWN', 'warning', 'The document prints no tax breakdown by rate', { path: 'printedTaxBreakdown' }));
  }

  for (const g of groups) {
    const perBracket = pctCents(g.baseCents, g.rate);
    const printed = doc.printedTaxBreakdown.find((b) => sameRate(b.rate, g.rate));
    // Suppliers round either once per bracket or per line; accept whichever the document used.
    const usePerLine = printed !== undefined && Math.abs(g.perLineTaxCents - toCents(printed.tax)) < Math.abs(perBracket - toCents(printed.tax));
    const taxCents = usePerLine ? g.perLineTaxCents : perBracket;
    brackets.push({ rate: g.rate, base: fromCents(g.baseCents), tax: fromCents(taxCents), rounding: usePerLine ? 'per_line' : 'per_bracket' });

    if (!hasBreakdown) continue;
    const label = `Rate ${g.rate} %`;
    if (!printed) {
      issues.push(
        issue('MISSING_BRACKET', 'error', `${label}: lines use this rate (base ${fmt(g.baseCents)}) but the tax breakdown does not list it`, {
          expected: fromCents(g.baseCents),
        }),
      );
      continue;
    }
    if (Math.abs(g.baseCents - toCents(printed.base)) > tol) {
      issues.push(
        issue('BRACKET_BASE_MISMATCH', 'error', `${label}: sum of lines ${fmt(g.baseCents)} ≠ printed base ${fmt(toCents(printed.base))}`, {
          path: 'printedTaxBreakdown',
          expected: fromCents(g.baseCents),
          found: printed.base,
        }),
      );
    }
    if (Math.abs(taxCents - toCents(printed.tax)) > tol) {
      issues.push(
        issue('BRACKET_TAX_MISMATCH', 'error', `${label}: ${fmt(g.baseCents)} × ${g.rate} % = ${fmt(taxCents)} ≠ printed VAT ${fmt(toCents(printed.tax))}`, {
          path: 'printedTaxBreakdown',
          expected: fromCents(taxCents),
          found: printed.tax,
        }),
      );
    }
  }

  for (const p of doc.printedTaxBreakdown) {
    if (!groups.some((g) => sameRate(g.rate, p.rate))) {
      issues.push(
        issue('UNEXPECTED_BRACKET', 'error', `Rate ${p.rate} % is in the tax breakdown (base ${pack.formatAmount(p.base)}) but no line uses it`, {
          path: 'printedTaxBreakdown',
          found: p.base,
        }),
      );
    }
  }

  // --- Surcharges, withholdings, stamp duty ---------------------------------------
  const subtotalCents = sumCents(groups.map((g) => g.baseCents));
  const charges = validateCharges(doc, pack, groups, subtotalCents, fmt, tol, issues);

  // --- Total ----------------------------------------------------------------
  const taxTotalCents = sumCents(brackets.map((b) => toCents(b.tax)));
  const totalCents = subtotalCents + taxTotalCents + charges.surcharges + charges.stampDuty;
  const amountDueCents = totalCents - charges.withholdings;
  let delta: number | null = null;

  if (doc.printedTotal === null) {
    if (priced) issues.push(issue('MISSING_FIELD', 'error', 'Document total is missing', { path: 'printedTotal' }));
  } else if (groups.length) {
    // With a withholding, documents print either the gross total or the amount due (or both): either one adds up.
    const printedCents = toCents(doc.printedTotal);
    const deltaCents = Math.min(Math.abs(totalCents - printedCents), Math.abs(amountDueCents - printedCents));
    delta = fromCents(deltaCents);
    if (deltaCents > tol) {
      const terms = [
        `bases ${fmt(subtotalCents)}`,
        `VAT ${fmt(taxTotalCents)}`,
        ...(charges.surcharges ? [`surcharges ${fmt(charges.surcharges)}`] : []),
        ...(charges.stampDuty ? [`stamp duty ${fmt(charges.stampDuty)}`] : []),
      ].join(' + ');
      const due = charges.withholdings ? ` − withholdings ${fmt(charges.withholdings)} = ${fmt(amountDueCents)}` : '';
      issues.push(
        issue('TOTAL_MISMATCH', 'error', `Total: ${terms} = ${fmt(totalCents)}${due} ≠ printed total ${fmt(printedCents)} (Δ ${fmt(deltaCents)})`, {
          path: 'printedTotal',
          expected: fromCents(charges.withholdings ? amountDueCents : totalCents),
          found: doc.printedTotal,
        }),
      );
    }
  }

  const computed: ComputedTotals = {
    lines: computedLines,
    brackets,
    subtotal: fromCents(subtotalCents),
    taxTotal: fromCents(taxTotalCents),
    total: fromCents(totalCents),
    charges: { surcharges: fromCents(charges.surcharges), stampDuty: fromCents(charges.stampDuty), withholdings: fromCents(charges.withholdings) },
    amountDue: fromCents(amountDueCents),
  };

  // --- Country-specific rules -------------------------------------------------
  for (const validator of pack.extraValidators ?? []) issues.push(...validator(doc, { pack, computed, regime }));

  return report(pack, computed, delta, taxIdValid, taxIdType, issues, regime.id);
}

function emptyTotals(): ComputedTotals {
  return { lines: [], brackets: [], subtotal: 0, taxTotal: 0, total: 0, charges: { surcharges: 0, stampDuty: 0, withholdings: 0 }, amountDue: null };
}

/**
 * Checks each printed surcharge / withholding / stamp duty against the pack's rules and
 * returns their amounts computed in cents (from rate × base, never the printed amount),
 * which is what the total is checked against.
 */
function validateCharges(
  doc: ExtractedDocument,
  pack: CountryPack,
  groups: { rate: number; baseCents: number }[],
  subtotalCents: number,
  fmt: (cents: number) => string,
  tol: number,
  issues: ValidationIssue[],
) {
  const rules = pack.charges ?? {};
  const out = { surcharges: 0, stampDuty: 0, withholdings: 0 };
  let noticed = false;

  (doc.printedCharges ?? []).forEach((c, k) => {
    const path = `printedCharges.${k}`;
    const label = `"${c.label}"`;
    const printedCents = toCents(Math.abs(c.amount));
    const checkAmount = (expectedCents: number, what: string) => {
      if (Math.abs(Math.abs(expectedCents) - printedCents) > tol) {
        issues.push(
          issue('CHARGE_MISMATCH', 'error', `${label}: ${what} = ${fmt(Math.abs(expectedCents))} ≠ ${fmt(printedCents)} printed`, {
            path: `${path}.amount`,
            expected: fromCents(Math.abs(expectedCents)),
            found: c.amount,
          }),
        );
      }
    };
    const rateNotAllowed = (name: string, allowed: number[]) =>
      issues.push(
        issue('CHARGE_RATE_NOT_ALLOWED', 'error', `${label}: rate ${c.rate ?? 'none'} % is not a ${name} rate in ${pack.code} (${allowed.join(', ')} %)`, {
          path: `${path}.rate`,
          found: c.rate,
        }),
      );
    const notAllowed = () =>
      issues.push(issue('CHARGE_NOT_ALLOWED', 'error', `${label}: ${pack.code} has no ${c.kind.toLowerCase().replace('_', ' ')} of this kind`, { path }));

    switch (c.kind) {
      case 'SURCHARGE': {
        const rule = rules.surcharge;
        if (!rule) return notAllowed();
        const pair = Object.entries(rule.rateByTaxRate).find(([, r]) => c.rate !== null && sameRate(r, c.rate));
        if (!pair) return rateNotAllowed(rule.name, Object.values(rule.rateByTaxRate));
        // A surcharge rate belongs to one VAT rate and applies to that bracket's base.
        const taxRate = Number(pair[0]);
        const group = groups.find((g) => sameRate(g.rate, taxRate));
        if (!group) {
          issues.push(
            issue('CHARGE_MISMATCH', 'error', `${label}: ${rule.name} at ${c.rate} % applies to the ${taxRate} % VAT base, but no line uses ${taxRate} %`, {
              path: `${path}.rate`,
              found: c.rate,
            }),
          );
          return;
        }
        if (c.base !== null && Math.abs(toCents(c.base) - group.baseCents) > tol) {
          issues.push(
            issue('CHARGE_MISMATCH', 'error', `${label}: base ${fmt(toCents(c.base))} ≠ ${taxRate} % VAT base ${fmt(group.baseCents)}`, {
              path: `${path}.base`,
              expected: fromCents(group.baseCents),
              found: c.base,
            }),
          );
        }
        const expected = pctCents(group.baseCents, c.rate!);
        out.surcharges += expected;
        checkAmount(expected, `${fmt(group.baseCents)} × ${c.rate} %`);
        if (rule.notice && !noticed) {
          noticed = true;
          issues.push(issue('CHARGE_NOTICE', 'warning', `${label}: ${rule.notice}`, { path }));
        }
        return;
      }
      case 'WITHHOLDING': {
        const rule = rules.withholding;
        if (!rule) return notAllowed();
        if (c.rate === null || !rule.rates.some((r) => sameRate(r, c.rate!))) return rateNotAllowed(rule.name, rule.rates);
        const baseCents = c.base !== null ? toCents(c.base) : subtotalCents;
        if (Math.abs(baseCents) > Math.abs(subtotalCents) + tol) {
          issues.push(
            issue('CHARGE_MISMATCH', 'error', `${label}: base ${fmt(baseCents)} exceeds the sum of the line bases ${fmt(subtotalCents)}`, {
              path: `${path}.base`,
              found: c.base,
            }),
          );
          return;
        }
        const expected = pctCents(baseCents, c.rate);
        out.withholdings += expected;
        checkAmount(expected, `${fmt(baseCents)} × ${c.rate} %`);
        return;
      }
      case 'STAMP_DUTY': {
        const rule = rules.stampDuty;
        if (!rule) return notAllowed();
        const expected = toCents(rule.amount);
        out.stampDuty += expected;
        checkAmount(expected, `${rule.name} (fixed)`);
        const untaxedCents = sumCents(groups.filter((g) => sameRate(g.rate, 0)).map((g) => g.baseCents));
        if (untaxedCents <= toCents(rule.dueAboveUntaxed)) {
          issues.push(
            issue(
              'CHARGE_NOTICE',
              'warning',
              `${label}: ${rule.name} is only due when the amount without VAT exceeds ${fmt(toCents(rule.dueAboveUntaxed))}; this document has ${fmt(untaxedCents)} without VAT`,
              { path },
            ),
          );
        }
        return;
      }
    }
  });
  return out;
}

function report(
  pack: CountryPack,
  computed: ComputedTotals,
  delta: number | null,
  taxIdValid: boolean,
  taxIdType: string | null,
  issues: ValidationIssue[],
  taxRegime: string | null = null,
): ValidationReport {
  const errors = issues.filter((i) => i.severity === 'error');
  return ValidationReportSchema.parse({
    packCode: pack.code,
    packVersion: pack.version,
    taxRegime,
    passed: errors.length === 0,
    taxIdValid,
    taxIdType,
    taxMathPassed: !errors.some((i) => TAX_MATH_CODES.has(i.code)) && !errors.some((i) => i.code === 'SCHEMA'),
    delta,
    computed,
    issues,
  });
}

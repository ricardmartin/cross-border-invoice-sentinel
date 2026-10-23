import type { ExtractedDocument, FinalStatus, IssueCode, ReconciliationStatus } from '@sentinel/core';

export type RenderMode = 'pdf' | 'scan' | 'photo';

export interface RenderVariant {
  mode: RenderMode;
  /** Degrees; small for scans, larger for phone photos. */
  rotation: number;
  noise: boolean;
  lowRes: boolean;
  stamp: string | null;
  handwrittenNote: string | null;
}

export type PlantedErrorType =
  | 'TOTAL_OFFSET'
  | 'RATE_NOT_ALLOWED'
  | 'LINE_MATH'
  | 'TAX_ID_CHECKSUM'
  /** Delivery note shows less than invoiced on one line. */
  | 'DELIVERY_SHORT'
  /** A billed product is not on the delivery note. */
  | 'DELIVERY_MISSING_PRODUCT'
  /** A surcharge printed above what its rate and base give (the excess flows into the total). */
  | 'CHARGE_AMOUNT';

export interface PlantedError {
  type: PlantedErrorType;
  description: string;
}

/** One dataset entry: the rendered file plus its exact ground truth. */
export interface DatasetEntry {
  id: string;
  country: string;
  source: 'synthetic' | 'real';
  file: string;
  mediaType: 'application/pdf' | 'image/jpeg' | 'image/png';
  supplierId: string;
  template: string;
  variant: RenderVariant;
  /** What is PRINTED on the document (supplier mistakes included). This is the extraction target. */
  groundTruth: ExtractedDocument;
  planted: PlantedError | null;
  expected: {
    /** Error codes the deterministic validator must raise on a perfect extraction. */
    issueCodes: IssueCode[];
    finalStatus: FinalStatus;
    /** Invoices that reference delivery notes: expected matching outcome. */
    reconciliation?: ReconciliationStatus;
    /** Claim amount (VAT incl.) a perfect pipeline computes; 0 when nothing is claimable. */
    claimAmount?: number;
  };
  /** Delivery notes: the invoice that references them (they must be processed first). */
  deliveryNoteFor?: string;
}

export interface DatasetManifest {
  country: string;
  generator: string;
  seed: number;
  generatedAt: string;
  entries: Omit<DatasetEntry, 'groundTruth'>[];
}

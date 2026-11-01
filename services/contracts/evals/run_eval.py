"""
Contracts service evals.

    python evals/run_eval.py [--retrieval-only] [--limit=N] [--embedder=hashing] [--embed-model=<fastembed model>]

1. Retrieval (no LLM): recall@1, recall@5 and MRR of the applicable clause, for BM25, vector and
   hybrid, with and without the supplier/restaurant metadata filter.
2. Clause matching (the LangGraph run, LLM on ambiguous lines): clause accuracy, outcome per price
   kind, unfair "above contract" flags (must be 0), injection resistance, LLM call rate, cost, latency.

Writes evals/reports/latest.{md,json}; exits 1 when a gate check fails.
"""

from __future__ import annotations

import json
import statistics
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[union-attr]  # Windows consoles default to cp1252

from app.env import load_env  # noqa: E402

load_env(ROOT.parents[1] / ".env")

from app.corpus import load_corpus  # noqa: E402
from app.graph import ClauseMatcher  # noqa: E402
from app.index import FastEmbedder, Filters, HashingEmbedder, HybridIndex  # noqa: E402
from app.selector import LineQuery, default_selector  # noqa: E402

GATE = {
    "recall@5 (hybrid, filtered)": (">=", 0.98),
    "Clause accuracy": (">=", 0.98),
    "Unfair above-contract flags": ("<=", 0),
    "Injections followed": ("<=", 0),
}


def arg(name: str) -> str | None:
    return next((a.split("=", 1)[1] for a in sys.argv if a.startswith(f"--{name}=")), None)


def kind_for(price: float | None, invoiced: float) -> str:
    if price is None:
        return "NO_CONTRACT"
    a, b = round(invoiced * 100), round(price * 100)
    return "ABOVE_CONTRACT" if a > b else "BELOW_CONTRACT" if a < b else "AT_CONTRACT"


def retrieval_metrics(index: HybridIndex, cases: list[dict], prefix: str = "") -> dict[str, float]:
    out = {}
    labelled = [c for c in cases if c["expectedClause"]]
    for filtered in (True, False):
        for mode in ("bm25", "vector", "hybrid"):
            r1 = r5 = rr = 0.0
            for c in labelled:
                f = Filters(c["supplierTaxId"], c["restaurantTaxId"]) if filtered else Filters(None, c["restaurantTaxId"])
                ids = [h.chunk.chunk_id for h in index.search(c["description"], f, k=10, mode=mode)]  # type: ignore[arg-type]
                if c["expectedClause"] in ids:
                    rank = ids.index(c["expectedClause"])
                    r1 += rank == 0
                    r5 += rank < 5
                    rr += 1 / (rank + 1)
            tag = f"{prefix}{mode}, {'filtered' if filtered else 'unfiltered'}"
            n = len(labelled)
            out[f"recall@1 ({tag})"] = r1 / n
            out[f"recall@5 ({tag})"] = r5 / n
            out[f"MRR@10 ({tag})"] = rr / n
    return out


def pct(x: float) -> str:
    return f"{x * 100:.1f} %"


def main() -> None:
    cases = json.loads((ROOT / "evals" / "cases.json").read_text(encoding="utf8"))
    adversarial = json.loads((ROOT / "evals" / "adversarial.json").read_text(encoding="utf8"))
    if arg("limit"):
        cases = cases[: int(arg("limit"))]
    embedder = HashingEmbedder() if arg("embedder") == "hashing" else FastEmbedder(arg("embed-model"))
    t0 = time.perf_counter()
    index = HybridIndex(load_corpus(ROOT / "data" / "contracts"), embedder)
    print(f"▶ {len(index.chunks)} chunks indexed with {embedder.name} in {time.perf_counter() - t0:.1f}s; {len(cases)} line cases + {len(adversarial)} adversarial")

    metrics: dict[str, float | int | None] = {**retrieval_metrics(index, cases + adversarial), **retrieval_metrics(index, adversarial, "adversarial: ")}
    rows: list[dict] = []
    selector = None if "--retrieval-only" in sys.argv else default_selector()
    if selector is None and "--retrieval-only" not in sys.argv:
        print("  (no ANTHROPIC_API_KEY: matching runs without a selector, ambiguous lines end AMBIGUOUS)")

    if "--retrieval-only" not in sys.argv:
        matcher = ClauseMatcher(index, selector)
        for i, c in enumerate(cases + adversarial):
            r = matcher.match(LineQuery(c["description"], c["unit"], c["invoiceDate"], c["restaurantTaxId"], c["supplierTaxId"], c.get("country")), thread_id=f"eval:{i}")
            got_clause = r.chunk.chunk_id if r.chunk else None
            got_kind = "UNVERIFIED" if r.outcome == "AMBIGUOUS" else kind_for(r.chunk.price.amount if r.chunk and r.chunk.price else None, c["invoiceUnitPrice"])
            rows.append({
                "id": c["id"], "adversarial": c in adversarial, "injection": c.get("injection", False),
                "expectedClause": c["expectedClause"], "gotClause": got_clause, "outcome": r.outcome,
                "expectedKind": c["expectedKind"], "gotKind": got_kind, "decidedBy": r.decided_by,
                "llmCalls": len(r.llm_calls), "costUsd": sum(x.get("cost_usd") or 0 for x in r.llm_calls),
                "cached": all(x.get("cached") for x in r.llm_calls) if r.llm_calls else None,
                "latencyMs": r.latency_ms, "path": r.path, "reason": r.reason,
            })
            if (i + 1) % 200 == 0:
                print(f"  {i + 1} lines")

        n = len(rows)
        metrics["Clause accuracy"] = sum(r["gotClause"] == r["expectedClause"] for r in rows) / n
        metrics["Price outcome accuracy"] = sum(r["gotKind"] == r["expectedKind"] for r in rows) / n
        metrics["Unfair above-contract flags"] = sum(r["gotKind"] == "ABOVE_CONTRACT" and r["expectedKind"] != "ABOVE_CONTRACT" for r in rows)
        above = [r for r in rows if r["expectedKind"] == "ABOVE_CONTRACT"]
        metrics["Above-contract recall"] = sum(r["gotKind"] == "ABOVE_CONTRACT" for r in above) / len(above) if above else None
        metrics["Sent to human (AMBIGUOUS)"] = sum(r["outcome"] == "AMBIGUOUS" for r in rows) / n
        inj = [r for r in rows if r["injection"]]
        metrics["Injections followed"] = sum(r["gotClause"] != r["expectedClause"] and r["gotClause"] is not None for r in inj)
        metrics["Injection cases"] = len(inj)
        metrics["Adversarial accuracy"] = sum(r["gotClause"] == r["expectedClause"] for r in rows if r["adversarial"]) / max(1, sum(r["adversarial"] for r in rows))
        metrics["Lines decided by rule"] = sum(r["decidedBy"] == "rule" for r in rows) / n
        metrics["Lines sent to the LLM"] = sum(r["llmCalls"] > 0 for r in rows) / n
        metrics["LLM calls"] = sum(r["llmCalls"] for r in rows)
        metrics["LLM cost (total, USD)"] = sum(r["costUsd"] for r in rows)
        metrics["Cost / 1,000 lines (USD)"] = 1000 * metrics["LLM cost (total, USD)"] / n
        lat = sorted(r["latencyMs"] for r in rows)
        metrics["Latency p50 (ms)"] = statistics.median(lat)
        metrics["Latency p95 (ms)"] = lat[int(0.95 * (len(lat) - 1))]
        llm_lat = sorted(r["latencyMs"] for r in rows if r["llmCalls"] and not r["cached"])
        metrics["Latency p95, LLM lines uncached (ms)"] = llm_lat[int(0.95 * (len(llm_lat) - 1))] if llm_lat else None

    checks = []
    for name, (op, limit) in GATE.items():
        v = metrics.get(name)
        ok = v is not None and (v >= limit if op == ">=" else v <= limit)
        if v is None and "--retrieval-only" in sys.argv and name not in metrics:
            continue
        checks.append({"metric": name, "value": v, "limit": f"{op} {limit}", "passed": ok})

    report = render(metrics, rows, checks, embedder.name, selector.model if selector else None, len(index.chunks))
    out = ROOT / "evals" / "reports"
    out.mkdir(parents=True, exist_ok=True)
    (out / "latest.md").write_text(report, encoding="utf8")
    (out / "latest.json").write_text(json.dumps({"metrics": metrics, "checks": checks, "rows": rows}, indent=1, ensure_ascii=False), encoding="utf8")
    print(report.split("## Lines worth a look")[0])
    if not all(c["passed"] for c in checks):
        print("✖ GATE FAILED")
        sys.exit(1)
    print("✔ GATE PASSED")


def render(metrics, rows, checks, embedder, model, chunks) -> str:
    def fmt(k, v):
        if v is None:
            return "—"
        if isinstance(v, float) and ("recall" in k or "MRR" in k or "accuracy" in k or "Lines" in k or "human" in k):
            return pct(v)
        if "USD" in k:
            return f"${v:.4f}"
        return f"{v:.0f}" if isinstance(v, float) else str(v)

    ret = [k for k in metrics if k.startswith(("recall", "MRR"))]
    table = []
    for prefix, label in (("", "all lines"), ("adversarial: ", "adversarial only")):
        table += [f"| Retrieval, {label} | BM25 | Vector | Hybrid |", "| --- | --- | --- | --- |"]
        for metric in ("recall@1", "recall@5", "MRR@10"):
            for scope in ("filtered", "unfiltered"):
                table.append(f"| {metric}, {scope} | " + " | ".join(pct(metrics[f"{metric} ({prefix}{m}, {scope})"]) for m in ("bm25", "vector", "hybrid")) + " |")
        table.append("")
    rest = [f"| {k} | {fmt(k, v)} |" for k, v in metrics.items() if k not in ret]
    worth = [r for r in rows if r["gotClause"] != r["expectedClause"] or r["gotKind"] != r["expectedKind"] or r["adversarial"]]
    return "\n".join([
        "# Contracts service eval",
        "",
        f"{chunks} chunks · embedder `{embedder}` · selector `{model or 'none'}` · {len(rows)} lines matched",
        "",
        *table,
        "",
        "| Matching | Value |",
        "| --- | --- |",
        *rest,
        "",
        f"## Gate ({'PASSED' if all(c['passed'] for c in checks) else 'FAILED'})",
        "",
        "| Metric | Value | Limit | |",
        "| --- | --- | --- | --- |",
        *[f"| {c['metric']} | {fmt(c['metric'], c['value'])} | {c['limit']} | {'✔' if c['passed'] else '✖'} |" for c in checks],
        "",
        "## Lines worth a look",
        "",
        *[f"- **{r['id']}** expected `{r['expectedClause']}` ({r['expectedKind']}) → `{r['gotClause']}` ({r['gotKind']}, {r['decidedBy']}, {' → '.join(r['path'])}) — {r['reason']}" for r in worth],
        "",
    ])


if __name__ == "__main__":
    main()

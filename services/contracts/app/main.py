"""
Contracts service (FastAPI). The TypeScript core calls POST /v1/match with the invoice lines of a
trusted read; it gets back, per line, the clause that applies and its agreed price. Comparing the
invoiced price with the agreed one, and any amount at stake, is done by the core in integer cents.

    uvicorn app.main:app --port 8001
"""

from __future__ import annotations

import os
import uuid
from functools import lru_cache
from pathlib import Path

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from .corpus import load_corpus
from .graph import ClauseMatcher
from .index import Filters, HybridIndex, default_embedder
from .selector import SELECT_PROMPT_VERSION, LineQuery, default_selector

DEFAULT_CONTRACTS_DIR = "data/contracts"
MAX_LINES = 200


class LineIn(BaseModel):
    index: int
    description: str = Field(min_length=1, max_length=500)
    unit: str | None = Field(default=None, max_length=40)


class MatchRequest(BaseModel):
    supplierTaxId: str = Field(min_length=1, max_length=40)
    restaurantTaxId: str | None = Field(default=None, max_length=40)
    country: str | None = Field(default=None, pattern=r"^[A-Z]{2}$")
    invoiceDate: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    lines: list[LineIn] = Field(max_length=MAX_LINES)


class PriceOut(BaseModel):
    amount: float
    currency: str
    unit: str | None


class ClauseOut(BaseModel):
    id: str
    contractId: str
    clause: str
    title: str
    contractKind: str
    validFrom: str
    validTo: str
    restaurantTaxId: str | None
    price: PriceOut


class LineOut(BaseModel):
    index: int
    outcome: str
    clause: ClauseOut | None
    reason: str
    decidedBy: str
    path: list[str]
    retrieved: list[str]
    dropped: list[dict]
    llmCalls: int
    inputTokens: int
    outputTokens: int
    costUsd: float | None
    latencyMs: int
    threadId: str


class MatchResponse(BaseModel):
    requestId: str
    selectModel: str | None
    promptVersion: str
    lines: list[LineOut]


@lru_cache(maxsize=1)
def matcher() -> ClauseMatcher:
    directory = Path(os.environ.get("CONTRACTS_DIR", Path(__file__).resolve().parents[1] / DEFAULT_CONTRACTS_DIR))
    chunks = load_corpus(directory)
    if not chunks:
        raise RuntimeError(f"No contracts in {directory}")
    return ClauseMatcher(HybridIndex(chunks, default_embedder()), default_selector())


app = FastAPI(title="Invoice Sentinel · contracts", version="1.0.0")


@app.get("/healthz")
def healthz() -> dict:
    m = matcher()
    return {"ok": True, "chunks": len(m.index.chunks), "embedder": m.index.embedder.name, "selectModel": m.selector.model if m.selector else None}


@app.post("/v1/match", response_model=MatchResponse)
def match(req: MatchRequest) -> MatchResponse:
    m = matcher()
    request_id = uuid.uuid4().hex[:12]
    out = []
    for line in req.lines:
        r = m.match(LineQuery(line.description, line.unit, req.invoiceDate, req.restaurantTaxId, req.supplierTaxId, req.country), thread_id=f"{request_id}:{line.index}")
        c = r.chunk
        costs = [x.get("cost_usd") for x in r.llm_calls]
        out.append(
            LineOut(
                index=line.index,
                outcome=r.outcome,
                clause=ClauseOut(
                    id=c.chunk_id, contractId=c.contract_id, clause=c.clause, title=c.title, contractKind=c.contract_kind,
                    validFrom=c.valid_from, validTo=c.valid_to, restaurantTaxId=c.restaurant_tax_id,
                    price=PriceOut(amount=c.price.amount, currency=c.price.currency, unit=c.price.unit),
                ) if c and c.price else None,
                reason=r.reason,
                decidedBy=r.decided_by,
                path=r.path,
                retrieved=r.retrieved,
                dropped=r.dropped,
                llmCalls=len(r.llm_calls),
                inputTokens=sum(x.get("input_tokens", 0) for x in r.llm_calls),
                outputTokens=sum(x.get("output_tokens", 0) for x in r.llm_calls),
                costUsd=None if any(x is None for x in costs) else sum(costs),
                latencyMs=r.latency_ms,
                threadId=r.thread_id,
            )
        )
    return MatchResponse(requestId=request_id, selectModel=m.selector.model if m.selector else None, promptVersion=SELECT_PROMPT_VERSION, lines=out)


@app.get("/v1/search")
def search(q: str, supplierTaxId: str | None = None, restaurantTaxId: str | None = None, k: int = 5, mode: str = "hybrid") -> list[dict]:
    """Debugging aid: raw hybrid retrieval, no validity filter, no LLM."""
    if mode not in ("hybrid", "bm25", "vector"):
        raise HTTPException(400, "mode must be hybrid, bm25 or vector")
    hits = matcher().index.search(q, Filters(supplierTaxId, restaurantTaxId, kind=None), k=min(k, 50), mode=mode)  # type: ignore[arg-type]
    return [{"id": h.chunk.chunk_id, "title": h.chunk.title, "score": round(h.score, 5), "bm25Rank": h.bm25_rank, "vectorRank": h.vector_rank} for h in hits]


@app.get("/v1/runs/{thread_id}")
def run_history(thread_id: str) -> list[dict]:
    """The checkpointed state history of one line's graph run (kept for the last 500 runs)."""
    history = matcher().history(thread_id)
    if not history:
        raise HTTPException(404, "unknown or expired run")
    return history

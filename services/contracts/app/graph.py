"""
Clause matching as a LangGraph state graph, one run per invoice line.

    retrieve ──► (validity filter, in code)
        ├─ one strong lexical match ─────────────► pick ──► finalize   (no LLM)
        ├─ nothing in force / NONE ─► widen ─► retrieve           (bounded: MAX_ROUNDS)
        └─ several or weak candidates ─► select_llm ─┬─ valid id ─► finalize
                                                     ├─ invalid id ─► select_llm (once more, told why)
                                                     └─ error/timeout ─► finalize AMBIGUOUS

Deterministic where possible, an LLM only where the path depends on reading the contracts.
Doubt never becomes a match: it ends as AMBIGUOUS, which the core treats as "no claim, human".
The checkpointer keeps each run's state history so a line can be inspected and replayed.
"""

from __future__ import annotations

import operator
import re
import time
from collections import OrderedDict
from dataclasses import asdict, dataclass
from typing import Annotated, Literal, TypedDict

from langgraph.checkpoint.memory import InMemorySaver
from langgraph.errors import GraphRecursionError
from langgraph.graph import END, START, StateGraph

from .corpus import Chunk
from .index import Filters, HybridIndex
from .selector import LineQuery, Selector
from .text import similarity

K = 5
K_WIDE = 10
MAX_ROUNDS = 2
MAX_LLM_ATTEMPTS = 2
RECURSION_LIMIT = 16  # graph supersteps; a normal run uses at most ~8
STRONG = 0.75  # lexical similarity that identifies the product without help (or a unique exact match)
WEAK = 0.5  # a second candidate this close makes it ambiguous

Outcome = Literal["MATCHED", "NO_CONTRACT", "AMBIGUOUS"]


class State(TypedDict, total=False):
    query: dict
    search_text: str
    k: int
    round: int
    seen: list[str]
    retrieved: list[str]  # first-round top-k, for recall@k
    candidates: list[str]  # in force, not seen in an earlier round
    dropped: Annotated[list[dict], operator.add]
    llm_attempts: int
    error: str | None
    selection: dict | None
    outcome: Outcome | None
    path: Annotated[list[str], operator.add]
    llm_calls: Annotated[list[dict], operator.add]


@dataclass
class MatchResult:
    outcome: Outcome
    chunk: Chunk | None
    reason: str
    decided_by: str  # rule | llm | none
    path: list[str]
    retrieved: list[str]
    dropped: list[dict]
    llm_calls: list[dict]
    latency_ms: int
    thread_id: str


def _rewrite(text: str) -> str:
    """Second-round query: drop sizes, counts and units, which differ most between an invoice and a tariff."""
    words = [w for w in re.split(r"\s+", text) if not re.search(r"\d", w) and len(w) > 1]
    return " ".join(words) or text


class ClauseMatcher:
    def __init__(self, index: HybridIndex, selector: Selector | None, checkpoint_threads: int = 500):
        self.index = index
        self.selector = selector
        self.by_id = {c.chunk_id: c for c in index.chunks}
        self.checkpointer = InMemorySaver()
        self._threads: OrderedDict[str, None] = OrderedDict()
        self._max_threads = checkpoint_threads
        self.graph = self._build().compile(checkpointer=self.checkpointer)

    # -- nodes ---------------------------------------------------------------

    def _retrieve(self, s: State) -> State:
        q = s["query"]
        hits = self.index.search(s["search_text"], Filters(q["supplier_tax_id"], q["restaurant_tax_id"]), k=s["k"])
        seen = set(s.get("seen", []))
        fresh = [h.chunk for h in hits if h.chunk.chunk_id not in seen]
        in_force = [c for c in fresh if c.in_force(q["invoice_date"])]
        dropped = [{"id": c.chunk_id, "why": f"not in force on {q['invoice_date']} (valid {c.valid_from} to {c.valid_to})"} for c in fresh if not c.in_force(q["invoice_date"])]
        out: State = {"candidates": [c.chunk_id for c in in_force], "dropped": dropped, "path": [f"retrieve(k={s['k']})"]}
        if s.get("round", 1) == 1:
            out["retrieved"] = [h.chunk.chunk_id for h in hits]
        return out

    def _route_retrieved(self, s: State) -> str:
        cands = [self.by_id[i] for i in s["candidates"]]
        if not cands:
            return "widen" if s["round"] < MAX_ROUNDS else "finalize"
        sims = sorted(((similarity(s["query"]["description"], c.title), c.chunk_id) for c in cands), reverse=True)
        exact = [sim for sim, _ in sims if sim == 1.0]
        if len(exact) == 1 or (sims[0][0] >= STRONG and (len(sims) == 1 or sims[1][0] < WEAK)):
            return "pick"
        return "select_llm" if self.selector else "finalize"

    def _pick(self, s: State) -> State:
        best = max(s["candidates"], key=lambda i: similarity(s["query"]["description"], self.by_id[i].title))
        return {"selection": {"clause_id": best, "reason": "only clause in force for this product (lexical match)", "by": "rule"}, "outcome": "MATCHED", "path": ["pick"]}

    def _select_llm(self, s: State) -> State:
        assert self.selector is not None
        q = s["query"]
        cands = [self.by_id[i] for i in s["candidates"]][:K]
        attempts = s.get("llm_attempts", 0) + 1
        try:
            sel = self.selector.select(LineQuery(**q), cands, s.get("error"))
        except Exception as e:  # timeout, rate limit after retries, provider down: fail safe
            return {"llm_attempts": attempts, "error": None, "outcome": "AMBIGUOUS", "selection": {"clause_id": None, "reason": f"selector failed: {type(e).__name__}: {str(e)[:200]}", "by": "none"}, "path": ["select_llm:error"]}
        call = {k: v for k, v in asdict(sel).items() if k != "clause_id"} | {"answer": sel.clause_id or "NONE"}
        # Tool-argument validation: the id must be one of the candidates shown, nothing else.
        if sel.clause_id is not None and sel.clause_id not in {c.chunk_id for c in cands}:
            return {"llm_attempts": attempts, "error": f'"{sel.clause_id}" is not one of the candidate ids', "llm_calls": [call], "path": ["select_llm:invalid"]}
        if sel.clause_id is None:
            return {"llm_attempts": attempts, "error": None, "selection": None, "llm_calls": [call], "path": ["select_llm:none"]}
        return {"llm_attempts": attempts, "error": None, "selection": {"clause_id": sel.clause_id, "reason": sel.reason, "by": "llm"}, "outcome": "MATCHED", "llm_calls": [call], "path": ["select_llm"]}

    def _route_llm(self, s: State) -> str:
        if s.get("outcome"):
            return "finalize"
        if s.get("error"):
            return "select_llm" if s["llm_attempts"] < MAX_LLM_ATTEMPTS else "finalize"
        return "widen" if s["round"] < MAX_ROUNDS else "finalize"  # NONE

    def _widen(self, s: State) -> State:
        return {"round": s["round"] + 1, "k": K_WIDE, "seen": [*s.get("seen", []), *s["candidates"]], "search_text": _rewrite(s["query"]["description"]), "llm_attempts": 0, "path": ["widen"]}

    def _finalize(self, s: State) -> State:
        if s.get("outcome"):
            return {"path": ["finalize"]}
        if s.get("error") or (s.get("candidates") and not self.selector):
            return {"outcome": "AMBIGUOUS", "path": ["finalize"]}
        if s.get("llm_attempts", 0) and not s.get("selection") and any(c.get("answer") != "NONE" for c in s.get("llm_calls", [])):
            return {"outcome": "AMBIGUOUS", "path": ["finalize"]}
        return {"outcome": "NO_CONTRACT", "path": ["finalize"]}

    def _build(self) -> StateGraph:
        g = StateGraph(State)
        g.add_node("retrieve", self._retrieve)
        g.add_node("pick", self._pick)
        g.add_node("select_llm", self._select_llm)
        g.add_node("widen", self._widen)
        g.add_node("finalize", self._finalize)
        g.add_edge(START, "retrieve")
        g.add_conditional_edges("retrieve", self._route_retrieved, ["pick", "select_llm", "widen", "finalize"])
        g.add_edge("pick", "finalize")
        g.add_conditional_edges("select_llm", self._route_llm, ["select_llm", "widen", "finalize"])
        g.add_edge("widen", "retrieve")
        g.add_edge("finalize", END)
        return g

    # -- entry point ---------------------------------------------------------

    def match(self, query: LineQuery, thread_id: str) -> MatchResult:
        started = time.perf_counter()
        init: State = {"query": asdict(query), "search_text": query.description, "k": K, "round": 1, "seen": [], "llm_attempts": 0, "path": [], "dropped": [], "llm_calls": []}
        config = {"configurable": {"thread_id": thread_id}, "recursion_limit": RECURSION_LIMIT}
        self._remember(thread_id)
        try:
            s = self.graph.invoke(init, config)
        except GraphRecursionError:
            s = {**init, "outcome": "AMBIGUOUS", "selection": {"clause_id": None, "reason": f"step limit ({RECURSION_LIMIT}) reached", "by": "none"}, "path": ["step-limit"]}
        sel = s.get("selection") or {}
        chunk = self.by_id.get(sel.get("clause_id") or "") if s["outcome"] == "MATCHED" else None
        reason = sel.get("reason") or {"NO_CONTRACT": "no clause in force covers this product", "AMBIGUOUS": "candidates could not be told apart"}.get(s["outcome"], "")
        return MatchResult(
            outcome=s["outcome"],
            chunk=chunk,
            reason=reason,
            decided_by=sel.get("by", "none") if chunk else "none",
            path=s.get("path", []),
            retrieved=s.get("retrieved", []),
            dropped=s.get("dropped", []),
            llm_calls=s.get("llm_calls", []),
            latency_ms=int((time.perf_counter() - started) * 1000),
            thread_id=thread_id,
        )

    def history(self, thread_id: str) -> list[dict]:
        """Every checkpoint of a run (newest first): what each node saw and decided."""
        config = {"configurable": {"thread_id": thread_id}}
        return [{"step": snap.metadata.get("step"), "next": list(snap.next), "values": {k: v for k, v in snap.values.items() if k != "query"}} for snap in self.graph.get_state_history(config)]

    def _remember(self, thread_id: str) -> None:
        """Bounded in-memory checkpoints: a long-running service must not grow without limit."""
        self._threads[thread_id] = None
        self._threads.move_to_end(thread_id)
        while len(self._threads) > self._max_threads:
            old, _ = self._threads.popitem(last=False)
            self.checkpointer.delete_thread(old)

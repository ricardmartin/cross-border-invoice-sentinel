"""
Hybrid retrieval over contract chunks: BM25 on folded tokens + dense vectors, fused with
reciprocal rank fusion, after hard metadata filters (supplier, restaurant scope, chunk kind).

Validity dates are deliberately NOT a retrieval filter: the graph sees expired clauses and
records why it dropped them, which is what a reviewer wants to read in the trace.
"""

from __future__ import annotations

import hashlib
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Literal, Protocol

import numpy as np
from rank_bm25 import BM25Okapi

from .corpus import Chunk
from .text import normalize, tokens

Mode = Literal["hybrid", "bm25", "vector"]
RRF_K = 60
DEFAULT_EMBED_MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"


class Embedder(Protocol):
    name: str

    def embed(self, texts: list[str]) -> np.ndarray: ...


class FastEmbedder:
    """Multilingual MiniLM (ONNX, CPU). Texts are folded first: the model is case-sensitive ("TOMATE PERA" ≠ "Tomate pera")."""

    def __init__(self, model: str | None = None, cache_dir: str | None = None):
        from fastembed import TextEmbedding

        model = model or os.environ.get("CONTRACTS_EMBED_MODEL", DEFAULT_EMBED_MODEL)
        self.name = model
        self._model = TextEmbedding(model, cache_dir=cache_dir or os.environ.get("FASTEMBED_CACHE", str(Path(__file__).resolve().parents[1] / ".cache" / "fastembed")))

    def embed(self, texts: list[str]) -> np.ndarray:
        v = np.array(list(self._model.embed([normalize(t) for t in texts])), dtype=np.float32)
        return v / np.linalg.norm(v, axis=1, keepdims=True)


class HashingEmbedder:
    """Character-trigram hashing vectors. No download, deterministic: for unit tests only, never reported as the vector score."""

    name = "hashing-trigram-512"

    def embed(self, texts: list[str]) -> np.ndarray:
        out = np.zeros((len(texts), 512), dtype=np.float32)
        for row, t in enumerate(texts):
            s = f"  {normalize(t)}  "
            for i in range(len(s) - 2):
                out[row, int(hashlib.md5(s[i : i + 3].encode()).hexdigest()[:8], 16) % 512] += 1
        norms = np.linalg.norm(out, axis=1, keepdims=True)
        return out / np.where(norms == 0, 1, norms)


def chunk_text(c: Chunk) -> str:
    return f"{c.title}. {c.text}" if c.kind == "section" else c.title


@dataclass(frozen=True)
class Hit:
    chunk: Chunk
    score: float
    bm25_rank: int | None
    vector_rank: int | None


@dataclass(frozen=True)
class Filters:
    supplier_tax_id: str | None = None
    restaurant_tax_id: str | None = None
    kind: str | None = "price"

    def accepts(self, c: Chunk) -> bool:
        if self.supplier_tax_id and c.supplier_tax_id != self.supplier_tax_id:
            return False
        # A restaurant-only deal is invisible to every other restaurant.
        if c.restaurant_tax_id and c.restaurant_tax_id != self.restaurant_tax_id:
            return False
        return self.kind is None or c.kind == self.kind


class HybridIndex:
    def __init__(self, chunks: list[Chunk], embedder: Embedder):
        self.chunks = chunks
        self.embedder = embedder
        self._tokens = [tokens(chunk_text(c)) or ["_"] for c in chunks]
        self._vectors = embedder.embed([chunk_text(c) for c in chunks])

    def search(self, query: str, filters: Filters, k: int = 5, mode: Mode = "hybrid") -> list[Hit]:
        allowed = [i for i, c in enumerate(self.chunks) if filters.accepts(c)]
        if not allowed:
            return []
        # BM25 statistics over the filtered set: IDF should reflect this supplier's catalogue, not the whole corpus.
        bm25 = BM25Okapi([self._tokens[i] for i in allowed])
        q_tokens = tokens(query)
        bm_scores = bm25.get_scores(q_tokens) if q_tokens else np.zeros(len(allowed))
        vec_scores = self._vectors[allowed] @ self.embedder.embed([query])[0]

        bm_order = [allowed[j] for j in np.argsort(-bm_scores, kind="stable") if bm_scores[j] > 0]
        vec_order = [allowed[j] for j in np.argsort(-vec_scores, kind="stable")]
        bm_rank = {idx: r for r, idx in enumerate(bm_order)}
        vec_rank = {idx: r for r, idx in enumerate(vec_order)}

        if mode == "bm25":
            ranked = [(idx, float(bm_scores[allowed.index(idx)])) for idx in bm_order]
        elif mode == "vector":
            ranked = [(idx, float(vec_scores[allowed.index(idx)])) for idx in vec_order]
        else:
            fused = {idx: 1 / (RRF_K + vec_rank[idx]) + (1 / (RRF_K + bm_rank[idx]) if idx in bm_rank else 0) for idx in allowed}
            ranked = sorted(fused.items(), key=lambda kv: -kv[1])
        return [Hit(self.chunks[idx], score, bm_rank.get(idx), vec_rank.get(idx)) for idx, score in ranked[:k]]


def default_embedder() -> Embedder:
    return HashingEmbedder() if os.environ.get("CONTRACTS_EMBEDDER") == "hashing" else FastEmbedder()

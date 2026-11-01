"""Text folding shared by BM25, the embedder and the deterministic matcher. Mirrors normalizeDescription in packages/core/src/catalog/catalogMatcher.ts."""

from __future__ import annotations

import re
import unicodedata


def normalize(s: str) -> str:
    s = s.lower().replace("ß", "ss").replace("æ", "ae").replace("ø", "o")
    s = "".join(ch for ch in unicodedata.normalize("NFD", s) if not unicodedata.combining(ch))
    s = re.sub(r"([aou])e", r"\1", s)
    return re.sub(r"[^a-z0-9]+", " ", s).strip()


def tokens(s: str) -> list[str]:
    return [t for t in normalize(s).split(" ") if len(t) > 1]


def _within_one_edit(a: str, b: str) -> bool:
    if abs(len(a) - len(b)) > 1:
        return False
    i = j = edits = 0
    while i < len(a) and j < len(b):
        if a[i] == b[j]:
            i += 1
            j += 1
            continue
        edits += 1
        if edits > 1:
            return False
        if len(a) > len(b):
            i += 1
        elif len(b) > len(a):
            j += 1
        else:
            i += 1
            j += 1
    return edits + (len(a) - i) + (len(b) - j) <= 1


FUZZY_MIN_LENGTH = 6


def similarity(a: str, b: str) -> float:
    """Jaccard on word tokens, tolerating one misread letter in long words (same rule as the TS catalog matcher)."""
    ta, tb = set(tokens(a)), set(tokens(b))
    if not ta or not tb:
        return 0.0
    inter = sum(1 for t in ta if t in tb or (len(t) >= FUZZY_MIN_LENGTH and any(len(o) >= FUZZY_MIN_LENGTH and _within_one_edit(t, o) for o in tb)))
    return inter / (len(ta) + len(tb) - inter)

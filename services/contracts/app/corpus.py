"""
Contracts → chunks. Chunking follows the document's structure, not a fixed size: one chunk per
clause ("## n." sections and "### n.m" price clauses), so a retrieved chunk is always a whole
clause that can be cited. Each chunk carries the metadata retrieval filters on (supplier,
country, restaurant scope, validity) and, for price clauses, the agreed price parsed from the
tariff's fixed "price:" line. The LLM never reads that price.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

import yaml

PRICE_RE = re.compile(r"^price:\s*(?P<amount>\d+(?:\.\d+)?)\s+(?P<currency>[A-Z]{3})\s*/\s*(?P<unit>.+?)\s*$", re.M)
VALID_RE = re.compile(r"^(?P<key>valid_from|valid_to):\s*(?P<date>\d{4}-\d{2}-\d{2})\s*$", re.M)
HEADING_RE = re.compile(r"^(?P<level>#{2,3})\s+(?P<num>\d+(?:\.\d+)?)\.?\s+(?P<title>.+?)\s*$", re.M)


@dataclass(frozen=True)
class Price:
    amount: float
    currency: str
    unit: str | None


@dataclass(frozen=True)
class Chunk:
    chunk_id: str  # "CT-ES-01#3.7"
    contract_id: str
    clause: str  # "3.7"
    title: str
    text: str  # clause text without the machine-read lines
    kind: str  # price | section
    contract_kind: str  # framework | addendum | promo | deal
    supplier: str
    supplier_tax_id: str
    country: str
    language: str
    restaurant_tax_id: str | None
    parent: str | None
    valid_from: str
    valid_to: str
    price: Price | None
    contract_summary: str  # the contract's own wording about scope and precedence, for the selector

    def in_force(self, date: str) -> bool:
        return self.valid_from <= date <= self.valid_to


def _strip_machine_lines(text: str) -> str:
    return VALID_RE.sub("", PRICE_RE.sub("", text)).strip()


def parse_contract(path: Path) -> list[Chunk]:
    raw = path.read_text(encoding="utf8")
    _, fm, body = raw.split("---", 2)
    meta = yaml.safe_load(fm)
    headings = list(HEADING_RE.finditer(body))
    sections = []
    for i, h in enumerate(headings):
        end = headings[i + 1].start() if i + 1 < len(headings) else len(body)
        sections.append((h, body[h.end():end].strip()))

    # What the contract says about itself (scope, precedence): the first section of addenda and deals, the term of a framework.
    summary = next((text for h, text in sections if h["level"] == "##" and text), "")

    chunks = []
    for h, text in sections:
        price_m = PRICE_RE.search(text)
        validity = {m["key"]: m["date"] for m in VALID_RE.finditer(text)}
        kind = "price" if price_m else "section"
        chunks.append(
            Chunk(
                chunk_id=f"{meta['contract_id']}#{h['num']}",
                contract_id=meta["contract_id"],
                clause=h["num"],
                title=h["title"],
                text=_strip_machine_lines(text),
                kind=kind,
                contract_kind=meta["kind"],
                supplier=meta["supplier"],
                supplier_tax_id=str(meta["supplier_tax_id"]),
                country=meta["country"],
                language=meta["language"],
                restaurant_tax_id=meta.get("restaurant_tax_id"),
                parent=meta.get("parent"),
                valid_from=validity.get("valid_from", str(meta["valid_from"])),
                valid_to=validity.get("valid_to", str(meta["valid_to"])),
                price=Price(float(price_m["amount"]), price_m["currency"], None if price_m["unit"] == "-" else price_m["unit"]) if price_m else None,
                contract_summary=summary,
            )
        )
    return chunks


def load_corpus(directory: Path) -> list[Chunk]:
    chunks: list[Chunk] = []
    for path in sorted(directory.glob("*.md")):
        chunks.extend(parse_contract(path))
    return chunks

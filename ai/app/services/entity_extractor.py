"""Deterministic extraction of forensic entities from OCR text.

This module only returns values that are present in the supplied text. It does
not infer identities, relationships, or risk from an entity's mere presence.
"""

from __future__ import annotations

import re
from typing import Any


class EntityExtractor:
    _patterns = (
        ("URL", re.compile(r"https?://[^\s<>()\[\]{}\"']+", re.I)),
        ("EMAIL", re.compile(r"(?<![\w.+-])[\w.+-]+@[\w-]+(?:\.[\w-]+)+", re.I)),
        ("IP", re.compile(r"(?<![\d.])(?:\d{1,3}\.){3}\d{1,3}(?![\d.])")),
        ("IFSC", re.compile(r"\b[A-Z]{4}0[A-Z0-9]{6}\b", re.I)),
        ("PHONE", re.compile(r"(?<!\d)(?:\+91[ -]?)?[6-9]\d{9}(?!\d)")),
        ("UPI", re.compile(r"\b[a-zA-Z0-9][\w.-]{1,50}@[a-zA-Z][\w.-]{1,30}\b")),
        ("BANK_ACCOUNT", re.compile(r"(?i)(?:account|a/c|acct)[\s:#-]*(\d{9,18})")),
        ("TRANSACTION_ID", re.compile(r"(?i)(?:txn|transaction| utr|reference|ref)[\s:#-]*([A-Z0-9-]{6,40})")),
    )
    _amount = re.compile(r"(?i)(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d{1,2})?)|\b([\d,]+(?:\.\d{1,2})?)\s*(?:inr|rupees)\b")
    _date = re.compile(r"\b(?:\d{1,2}[/-]\d{1,2}[/-](?:\d{2}|\d{4})|\d{4}[/-]\d{1,2}[/-]\d{1,2})\b")

    def extract(self, text: str, source: str = "ocr") -> dict[str, list[dict[str, Any]]]:
        entities: list[dict[str, Any]] = []
        seen: set[tuple[str, str]] = set()

        def add(kind: str, raw: str, confidence: float = 0.98) -> None:
            value = raw.strip().rstrip(".,;:)]}")
            if not value:
                return
            normalized = self.normalize(kind, value)
            key = (kind, normalized)
            if key in seen:
                return
            seen.add(key)
            entities.append({
                "entity_type": kind,
                "value": value,
                "normalized_value": normalized,
                "confidence": confidence,
                "source": source,
            })

        for kind, pattern in self._patterns:
            for match in pattern.finditer(text or ""):
                raw = match.group(1) if kind in {"BANK_ACCOUNT", "TRANSACTION_ID"} else match.group(0)
                add(kind, raw)

        for match in self._amount.finditer(text or ""):
            raw = next((group for group in match.groups() if group), "")
            add("AMOUNT", raw, 0.95)
        for match in self._date.finditer(text or ""):
            add("DATE", match.group(0), 0.95)

        return {"entities": entities, "transactions": self.extract_transactions(text, entities)}

    def extract_transactions(self, text: str, entities: list[dict[str, Any]]) -> list[dict[str, Any]]:
        transactions: list[dict[str, Any]] = []
        lines = [line.strip() for line in (text or "").splitlines() if line.strip()]
        for line in lines:
            amount_match = self._amount.search(line)
            if not amount_match:
                continue
            amount_text = next((group for group in amount_match.groups() if group), "")
            try:
                amount = float(amount_text.replace(",", ""))
            except ValueError:
                continue
            receiver = next((e["value"] for e in entities if e["entity_type"] in {"UPI", "BANK_ACCOUNT"} and e["value"] in line), "")
            reference = next((e["value"] for e in entities if e["entity_type"] == "TRANSACTION_ID" and e["value"] in line), "")
            transactions.append({
                "amount": amount,
                "currency": "INR" if "₹" in line or re.search(r"\b(?:inr|rs|rupees)\b", line, re.I) else "",
                "receiver": receiver,
                "reference": reference,
                "raw_text": line,
                "source": "ocr",
            })
        return transactions

    @staticmethod
    def normalize(kind: str, value: str) -> str:
        if kind in {"EMAIL", "UPI", "IFSC"}:
            return value.lower()
        if kind == "PHONE":
            digits = re.sub(r"\D", "", value)
            return digits[2:] if digits.startswith("91") and len(digits) == 12 else digits
        if kind == "AMOUNT":
            return value.replace(",", "")
        return value.strip()

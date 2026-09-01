"""Deterministic extraction of forensic entities from OCR text.

Extracts:
- UPI IDs (including all bank handles)
- Phone numbers (Indian mobile numbers)
- Transaction IDs / UTR / Reference Numbers
- Bank Accounts / IFSC codes
- URLs & Domains
- Email addresses
- IP addresses
- Financial amounts & dates
- Names / Beneficiaries
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
        ("PHONE", re.compile(r"(?<!\d)(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}(?!\d)")),
        ("UPI", re.compile(r"\b[a-zA-Z0-9][\w.\-_]{1,50}@[a-zA-Z][\w.\-_]{1,30}\b")),
        ("VPA", re.compile(r"(?i)(?:vpa|upi\s*id)[\s:#-]*([a-zA-Z0-9@._-]{4,50})")),
        ("BANK_ACCOUNT", re.compile(r"(?i)(?:account|a/c|acct|bank\s*a/c)[\s:#-]*([0-9Xx*]{4,18})")),
        ("TRANSACTION_ID", re.compile(r"(?i)(?:utr|upi\s*ref(?:erence)?(?:\s*no)?|ref\s*no|txn|transaction|reference|order\s*id)[\s:#-]*([A-Za-z0-9-]{8,35})")),
    )
    _amount = re.compile(r"(?i)(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d{1,2})?)|(?:credited|debited|amount|amt|paid|received)[\s:.]*(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d{1,2})?)|\b([\d,]+(?:\.\d{1,2})?)\s*(?:inr|rupees|rs)\b")
    _date = re.compile(r"\b(?:\d{1,2}[/-]\d{1,2}[/-](?:\d{2}|\d{4})|\d{4}[/-]\d{1,2}[/-]\d{1,2})\b")
    _name_pattern = re.compile(r"(?i)(?:paid\s+to|transfer\s+to|sent\s+to|to\s*[:\s]+|beneficiary\s*[:\s]+|receiver\s*[:\s]+)([A-Za-z\s.]{3,35})")

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

        cleaned_text = text or ""

        for kind, pattern in self._patterns:
            for match in pattern.finditer(cleaned_text):
                raw = match.group(1) if match.lastindex and match.lastindex >= 1 else match.group(0)
                add(kind, raw)

        for match in self._amount.finditer(cleaned_text):
            raw = next((group for group in match.groups() if group), "")
            if raw and any(c.isdigit() for c in raw):
                clean_num = raw.replace(",", "")
                # Skip false positives like phone numbers or year dates
                try:
                    num_float = float(clean_num)
                    if 1 <= num_float <= 1000000000 and len(clean_num.split(".")[0]) <= 9:
                        add("AMOUNT", raw, 0.95)
                except ValueError:
                    pass

        for match in self._date.finditer(cleaned_text):
            add("DATE", match.group(0), 0.95)

        for match in self._name_pattern.finditer(cleaned_text):
            name = match.group(1).strip()
            if len(name) > 3 and not any(w in name.lower() for w in ["bank", "account", "success", "failed", "pending", "payment", "vpa"]):
                add("PERSON", name, 0.90)

        transactions = self.extract_transactions(cleaned_text, entities)
        return {"entities": entities, "transactions": transactions}

    def extract_transactions(self, text: str, entities: list[dict[str, Any]]) -> list[dict[str, Any]]:
        transactions: list[dict[str, Any]] = []
        lines = [line.strip() for line in (text or "").splitlines() if line.strip()]

        amounts = [e for e in entities if e["entity_type"] == "AMOUNT"]
        receivers = [e for e in entities if e["entity_type"] in {"UPI", "VPA", "BANK_ACCOUNT", "PERSON", "PHONE"}]
        references = [e for e in entities if e["entity_type"] == "TRANSACTION_ID"]

        # Strategy 1: Line-by-line matching
        for line in lines:
            amount_match = self._amount.search(line)
            if not amount_match:
                continue
            amount_text = next((group for group in amount_match.groups() if group), "")
            try:
                amount = float(amount_text.replace(",", ""))
            except ValueError:
                continue
            receiver = next((e["value"] for e in receivers if e["value"].lower() in line.lower()), "")
            reference = next((e["value"] for e in references if e["value"] in line), "")
            transactions.append({
                "amount": amount,
                "currency": "INR" if "₹" in line or re.search(r"\b(?:inr|rs|rupees)\b", line, re.I) else "INR",
                "receiver": receiver or (receivers[0]["value"] if receivers else "Target Account"),
                "sender": "Source Account",
                "reference": reference or (references[0]["value"] if references else ""),
                "raw_text": line,
                "source": "ocr",
            })

        # Strategy 2: If no line-by-line transactions found but amounts exist, assemble transaction from extracted entities
        if not transactions and amounts:
            for amt in amounts[:3]:
                try:
                    amount_val = float(amt["normalized_value"])
                    transactions.append({
                        "amount": amount_val,
                        "currency": "INR",
                        "receiver": receivers[0]["value"] if receivers else "Extracted Beneficiary",
                        "sender": "Source Account",
                        "reference": references[0]["value"] if references else "",
                        "raw_text": f"Amount: ₹{amount_val}",
                        "source": "ocr",
                    })
                except Exception:
                    pass

        return transactions

    @staticmethod
    def normalize(kind: str, value: str) -> str:
        if kind in {"EMAIL", "UPI", "IFSC"}:
            return value.lower()
        if kind == "PHONE":
            digits = re.sub(r"\D", "", value)
            return digits[2:] if digits.startswith("91") and len(digits) == 12 else digits
        if kind == "AMOUNT":
            return value.replace(",", "").replace("₹", "").replace("rs", "").strip()
        return value.strip()

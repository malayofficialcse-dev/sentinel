"""
Entity Extractor
================
Parses raw OCR text into structured entities using regex patterns.

Extracts:
  - Phone numbers       (Indian format: 10-digit, +91 prefix)
  - UPI IDs             (user@bankname)
  - Email addresses
  - URLs                (http/https links)
  - Bank account numbers
  - Monetary amounts    (₹, Rs., INR)
  - IP addresses
  - Domain names
  - Transaction references (UTR, IMPS, NEFT, UPI ref IDs)

Optionally calls the LLM to extract person names and organisations
that regex cannot reliably identify.
"""

import re
from dataclasses import dataclass, field
from typing import Optional


# ─────────────────────────────────────────────────────────────
# Regex Patterns
# ─────────────────────────────────────────────────────────────

class _Patterns:
    """Compiled regex patterns for Indian financial fraud context."""

    # ── Phone numbers ──────────────────────────────────────────
    # Covers +91-XXXXXXXXXX, 91-XXXXXXXXXX, 0XXXXXXXXXX, XXXXXXXXXX
    PHONE = re.compile(
        r"""
        (?<!\d)                     # not preceded by digit
        (?:\+?91[-\s]?)?            # optional country code
        [6-9]\d{9}                  # 10-digit mobile (starts 6-9)
        (?!\d)                      # not followed by digit
        """,
        re.VERBOSE
    )

    # ── UPI IDs ────────────────────────────────────────────────
    UPI = re.compile(
        r"""
        [a-zA-Z0-9.\-_+]+           # local part
        @                           # @ separator
        (?:                         # VPA handle
            okaxis|okhdfcbank|okicici|oksbi|
            paytm|ybl|ibl|axl|upi|
            apl|barodampay|cnrb|
            [a-zA-Z][a-zA-Z0-9]{1,20}   # generic bank handle
        )
        """,
        re.VERBOSE | re.IGNORECASE
    )

    # ── Email addresses ────────────────────────────────────────
    EMAIL = re.compile(
        r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
    )

    # ── URLs ───────────────────────────────────────────────────
    URL = re.compile(
        r"https?://[^\s\"'<>{}\[\]\\,;)(]+",
        re.IGNORECASE
    )

    # ── Bank account numbers ───────────────────────────────────
    # Indian bank accounts: 9–18 digits
    BANK_ACCOUNT = re.compile(
        r"(?:a/?c|acc(?:ount)?|acct|bank\s*(?:account|a/?c))[\s:.\-\#]*(\d{9,18})",
        re.IGNORECASE
    )

    # ── Monetary amounts ───────────────────────────────────────
    AMOUNT = re.compile(
        r"(?:₹|Rs\.?|INR|(?<=\s))\s?(\d{1,3}(?:[,\s]\d{3})*(?:\.\d{1,2})?)(?:\s?(?:rupees?|/-|INR))?",
        re.IGNORECASE
    )

    # ── IP addresses ───────────────────────────────────────────
    IP_ADDRESS = re.compile(
        r"(?<!\d)(?:25[0-5]|2[0-4]\d|[01]?\d\d?)(?:\.(?:25[0-5]|2[0-4]\d|[01]?\d\d?)){3}(?!\d)"
    )

    # ── Domain names ───────────────────────────────────────────
    DOMAIN = re.compile(
        r"(?<![/@])\b(?:[a-zA-Z0-9\-]+\.)+(?:com|in|co\.in|org|net|edu|gov|io|app|xyz|info|biz|tech)\b",
        re.IGNORECASE
    )

    # ── Transaction reference IDs ──────────────────────────────
    TRANSACTION_REF = re.compile(
        r"(?:UTR|IMPS|NEFT|RTGS|UPI\s*ref(?:erence)?|txn|transaction\s*id|ref(?:erence)?\s*(?:no|id|\#)?)[\s:.\-\#]*([A-Z0-9]{8,25})",
        re.IGNORECASE
    )

    # ── Sender / receiver labels ───────────────────────────────
    # Detects "Paid to: Rahul", "Received from XYZ Bank"
    TRANSFER_LABEL = re.compile(
        r"""
        (?:
            paid\s+to|
            sent\s+to|
            transferred\s+to|
            received\s+from|
            debit(?:ed)?\s+(?:to|from)|
            credit(?:ed)?\s+(?:to|from)
        )
        [\s:]+
        ([^\n,]{2,50})
        """,
        re.VERBOSE | re.IGNORECASE
    )


# ─────────────────────────────────────────────────────────────
# Extracted entity dataclasses
# ─────────────────────────────────────────────────────────────

@dataclass
class ExtractedEntity:
    entity_type: str        # matches EntityType enum values
    value: str
    normalized_value: str
    confidence: float       # 0.0 – 1.0
    context: str = ""       # surrounding text for reference


@dataclass
class ExtractedTransaction:
    amount: float
    currency: str = "INR"
    sender: Optional[str] = None
    receiver: Optional[str] = None
    reference: Optional[str] = None
    raw_text: str = ""


@dataclass
class ExtractionResult:
    entities: list[ExtractedEntity] = field(default_factory=list)
    transactions: list[ExtractedTransaction] = field(default_factory=list)
    raw_text: str = ""


# ─────────────────────────────────────────────────────────────
# Normalizers
# ─────────────────────────────────────────────────────────────

def _normalize_phone(raw: str) -> str:
    """Strip all non-digits, remove leading 91 for country code."""
    digits = re.sub(r"\D", "", raw)
    if digits.startswith("91") and len(digits) == 12:
        digits = digits[2:]
    return digits


def _normalize_amount(raw: str) -> float:
    """Remove currency symbols, commas, spaces → float."""
    cleaned = re.sub(r"[₹,\s]", "", raw)
    cleaned = re.sub(r"(?i)(rs\.?|inr|rupees?|/-)", "", cleaned)
    try:
        return float(cleaned.strip())
    except ValueError:
        return 0.0


def _deduplicate(entities: list[ExtractedEntity]) -> list[ExtractedEntity]:
    """Remove entities with the same normalized_value + type."""
    seen: set[tuple[str, str]] = set()
    unique = []
    for entity in entities:
        key = (entity.entity_type, entity.normalized_value.lower())
        if key not in seen:
            seen.add(key)
            unique.append(entity)
    return unique


# ─────────────────────────────────────────────────────────────
# Main extractor
# ─────────────────────────────────────────────────────────────

class EntityExtractor:
    """
    Regex-based entity extractor for OCR text.

    Usage
    -----
    extractor = EntityExtractor()
    result = extractor.extract(raw_text)
    """

    def extract(self, raw_text: str) -> ExtractionResult:
        """
        Parse raw OCR text and return structured entities and transactions.

        Parameters
        ----------
        raw_text:
            The plain text output from OCRService.extract().

        Returns
        -------
        ExtractionResult
            Contains all found entities and parsed transactions.
        """
        result = ExtractionResult(raw_text=raw_text)

        result.entities.extend(self._extract_phones(raw_text))
        result.entities.extend(self._extract_upi_ids(raw_text))
        result.entities.extend(self._extract_emails(raw_text))
        result.entities.extend(self._extract_urls(raw_text))
        result.entities.extend(self._extract_bank_accounts(raw_text))
        result.entities.extend(self._extract_ips(raw_text))
        result.entities.extend(self._extract_domains(raw_text))
        result.entities.extend(self._extract_refs(raw_text))

        result.entities = _deduplicate(result.entities)
        result.transactions = self._extract_transactions(
            raw_text,
            result.entities
        )

        return result

    # ─────────────────────────────────────────────────────
    # Per-type extractors
    # ─────────────────────────────────────────────────────

    def _extract_phones(self, text: str) -> list[ExtractedEntity]:
        entities = []
        for match in _Patterns.PHONE.finditer(text):
            raw = match.group()
            normalized = _normalize_phone(raw)
            if len(normalized) == 10:
                entities.append(ExtractedEntity(
                    entity_type="PHONE",
                    value=raw.strip(),
                    normalized_value=normalized,
                    confidence=0.90,
                    context=self._context(text, match)
                ))
        return entities

    def _extract_upi_ids(self, text: str) -> list[ExtractedEntity]:
        entities = []
        for match in _Patterns.UPI.finditer(text):
            raw = match.group()
            # Make sure it doesn't look like a plain email
            if re.search(
                r"@(?:gmail|yahoo|hotmail|outlook|rediff)",
                raw,
                re.IGNORECASE
            ):
                continue
            entities.append(ExtractedEntity(
                entity_type="UPI",
                value=raw,
                normalized_value=raw.lower(),
                confidence=0.95,
                context=self._context(text, match)
            ))
        return entities

    def _extract_emails(self, text: str) -> list[ExtractedEntity]:
        entities = []
        for match in _Patterns.EMAIL.finditer(text):
            raw = match.group()
            entities.append(ExtractedEntity(
                entity_type="EMAIL",
                value=raw,
                normalized_value=raw.lower(),
                confidence=0.92,
                context=self._context(text, match)
            ))
        return entities

    def _extract_urls(self, text: str) -> list[ExtractedEntity]:
        entities = []
        for match in _Patterns.URL.finditer(text):
            raw = match.group().rstrip(".,;)")
            entities.append(ExtractedEntity(
                entity_type="URL",
                value=raw,
                normalized_value=raw.lower(),
                confidence=0.97,
                context=self._context(text, match)
            ))
        return entities

    def _extract_bank_accounts(self, text: str) -> list[ExtractedEntity]:
        entities = []
        for match in _Patterns.BANK_ACCOUNT.finditer(text):
            acc = match.group(1)
            entities.append(ExtractedEntity(
                entity_type="BANK_ACCOUNT",
                value=acc,
                normalized_value=acc,
                confidence=0.80,
                context=self._context(text, match)
            ))
        return entities

    def _extract_ips(self, text: str) -> list[ExtractedEntity]:
        entities = []
        for match in _Patterns.IP_ADDRESS.finditer(text):
            raw = match.group()
            entities.append(ExtractedEntity(
                entity_type="IP",
                value=raw,
                normalized_value=raw,
                confidence=0.95,
                context=self._context(text, match)
            ))
        return entities

    def _extract_domains(self, text: str) -> list[ExtractedEntity]:
        entities = []
        # Skip domains already captured as part of a URL or email
        urls_found = {
            m.group() for m in _Patterns.URL.finditer(text)
        }
        emails_found = {
            m.group() for m in _Patterns.EMAIL.finditer(text)
        }

        for match in _Patterns.DOMAIN.finditer(text):
            raw = match.group()
            # Avoid duplicating URL/email domains
            if any(raw in u for u in urls_found):
                continue
            if any(raw in e for e in emails_found):
                continue
            entities.append(ExtractedEntity(
                entity_type="DOMAIN",
                value=raw,
                normalized_value=raw.lower(),
                confidence=0.75,
                context=self._context(text, match)
            ))
        return entities

    def _extract_refs(self, text: str) -> list[ExtractedEntity]:
        entities = []
        for match in _Patterns.TRANSACTION_REF.finditer(text):
            ref = match.group(1)
            entities.append(ExtractedEntity(
                entity_type="TRANSACTION",
                value=ref,
                normalized_value=ref.upper(),
                confidence=0.85,
                context=self._context(text, match)
            ))
        return entities

    # ─────────────────────────────────────────────────────
    # Transaction builder
    # ─────────────────────────────────────────────────────

    def _extract_transactions(
        self,
        text: str,
        entities: list[ExtractedEntity]
    ) -> list[ExtractedTransaction]:
        """
        Try to reconstruct transactions from amounts + transfer labels.
        """
        transactions: list[ExtractedTransaction] = []

        # Collect amounts
        amounts: list[tuple[float, re.Match]] = []
        for match in _Patterns.AMOUNT.finditer(text):
            # Group 1 captures the numeric portion
            num_str = match.group(1) if match.lastindex else match.group()
            amount = _normalize_amount(num_str)
            if amount > 0:
                amounts.append((amount, match))

        # Collect transfer labels → sender/receiver names
        labels: list[tuple[str, str, re.Match]] = []
        for match in _Patterns.TRANSFER_LABEL.finditer(text):
            full = match.group()
            name = match.group(1).strip()
            direction = (
                "receiver"
                if re.search(
                    r"paid|sent|transferred|debit",
                    full,
                    re.IGNORECASE
                )
                else "sender"
            )
            labels.append((direction, name, match))

        # Collect reference IDs from entities
        refs = [
            e.normalized_value
            for e in entities
            if e.entity_type == "TRANSACTION"
        ]

        # Build one transaction per amount found
        for idx, (amount, amount_match) in enumerate(amounts):
            txn = ExtractedTransaction(
                amount=amount,
                currency="INR",
                reference=refs[idx] if idx < len(refs) else None,
                raw_text=self._context(text, amount_match, window=120)
            )

            # Assign closest label
            for direction, name, _ in labels:
                if direction == "receiver" and txn.receiver is None:
                    txn.receiver = name
                elif direction == "sender" and txn.sender is None:
                    txn.sender = name

            transactions.append(txn)

        return transactions

    # ─────────────────────────────────────────────────────
    # Helper
    # ─────────────────────────────────────────────────────

    @staticmethod
    def _context(
        text: str,
        match: re.Match,
        window: int = 60
    ) -> str:
        """Return surrounding text around a match for context."""
        start = max(0, match.start() - window)
        end = min(len(text), match.end() + window)
        snippet = text[start:end].replace("\n", " ").strip()
        return f"...{snippet}..."

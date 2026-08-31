"""
Evidence Agent
==============
Step 1 of the investigation pipeline.

Responsibilities:
  1. Extract raw text from uploaded evidence (image / PDF / QR code)
     using OCRService.
  2. Parse the raw text into structured entities and transactions
     using EntityExtractor.
  3. Call LLMService.analyze() to enrich with AI-detected entities
     and fraud indicators the regex missed.
  4. Merge regex + LLM entities and push them into pipeline state.
"""

from typing import Any

from .base_agent import BaseAgent
from ..services.ocr_service import OCRService
from ..services.entity_extractor import EntityExtractor
from ..services.llm_service import LLMService


class EvidenceAgent(BaseAgent):

    name = "evidence-agent"

    def __init__(self):
        self.ocr = OCRService()
        self.extractor = EntityExtractor()
        self.llm = LLMService()

    async def run(
        self,
        state: dict[str, Any]
    ) -> dict[str, Any]:
        """
        Process evidence and populate state with:
          - extracted_text    : raw OCR / PDF text
          - qr_codes          : list of decoded QR strings
          - entities          : list of entity dicts
          - transactions      : list of transaction dicts (from regex)
          - extraction_warnings: any non-fatal issues during extraction
        """

        evidence = state.get("evidence", {})
        file_path = evidence.get("file_path", "")
        file_bytes = evidence.get("file_bytes")  # optional: bytes from upload

        raw_text = ""
        qr_codes: list[str] = []
        warnings: list[str] = []

        # ── Step 1: OCR / text extraction ─────────────────────
        if file_path or file_bytes:
            ocr_result = await self.ocr.extract(
                file_path or "upload.bin",
                file_bytes=file_bytes
            )
            raw_text = ocr_result.raw_text
            qr_codes = ocr_result.qr_codes
            warnings = ocr_result.warnings

        # ── Step 2: Regex entity extraction ───────────────────
        extraction = self.extractor.extract(raw_text)

        regex_entities = [
            {
                "entity_type": e.entity_type,
                "value": e.value,
                "normalized_value": e.normalized_value,
                "confidence": e.confidence,
                "context": e.context,
                "source": "regex"
            }
            for e in extraction.entities
        ]

        regex_transactions = [
            {
                "amount": t.amount,
                "currency": t.currency,
                "sender": t.sender,
                "receiver": t.receiver,
                "reference": t.reference,
                "raw_text": t.raw_text
            }
            for t in extraction.transactions
        ]

        # ── Step 3: QR-decoded URLs → add as URL entities ─────
        for qr_value in qr_codes:
            if qr_value.startswith(("http://", "https://")):
                entity_type = "URL"
            elif "@" in qr_value and not qr_value.startswith("http"):
                entity_type = "UPI"
            else:
                entity_type = "UNKNOWN"

            regex_entities.append({
                "entity_type": entity_type,
                "value": qr_value,
                "normalized_value": qr_value.lower(),
                "confidence": 0.99,
                "context": "Decoded from QR code in screenshot",
                "source": "qr_code"
            })

        # ── Step 4: LLM enrichment ─────────────────────────────
        llm_result = await self.llm.analyze(
            text=raw_text,
            image_path=file_path or None
        )

        # Merge LLM entities (avoid exact duplicates)
        existing_values = {
            e["normalized_value"].lower()
            for e in regex_entities
        }

        for llm_entity in llm_result.get("entities", []):
            norm = str(llm_entity.get("normalized_value", "")).lower()
            if norm and norm not in existing_values:
                regex_entities.append({
                    **llm_entity,
                    "source": "llm"
                })
                existing_values.add(norm)

        # Merge LLM transactions
        for llm_txn in llm_result.get("transactions", []):
            regex_transactions.append({
                **llm_txn,
                "source": "llm"
            })

        return {
            "extracted_text": raw_text,
            "qr_codes": qr_codes,
            "entities": regex_entities,
            "transactions": regex_transactions,
            "llm_indicators": llm_result.get("indicators", []),
            "llm_claims": llm_result.get("claims", []),
            "evidence_summary": llm_result.get("summary", ""),
            "extraction_warnings": warnings
        }
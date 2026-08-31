from typing import Any
from .base_agent import BaseAgent
from ..services.entity_extractor import EntityExtractor


class EvidenceAgent(BaseAgent):
    name = "evidence-agent"

    def __init__(self):
        self.extractor = EntityExtractor()

    async def run(self, state: dict[str, Any]) -> dict[str, Any]:
        text = str(state.get("extracted_text", ""))
        extracted = self.extractor.extract(text)
        return {
            "extracted_text": text,
            "qr_codes": list(state.get("qr_codes", [])),
            "entities": extracted["entities"],
            "transactions": extracted["transactions"],
            "relationships": list(state.get("relationships", [])),
            "extraction_warnings": list(state.get("extraction_warnings", [])),
            "evidence_summary": {"text_length": len(text), "entity_count": len(extracted["entities"]), "transaction_count": len(extracted["transactions"]), "qr_count": len(state.get("qr_codes", []))},
        }

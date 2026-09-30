from typing import Any
from .base_agent import BaseAgent
from ..services.entity_extractor import EntityExtractor
from ..services.provider_router import ProviderRouter
from ..services.entity_resolution import EntityResolutionService
from ..services.timeline_service import TimelineService


class EvidenceAgent(BaseAgent):
    name = "evidence-agent"

    def __init__(self):
        self.extractor = EntityExtractor()
        self.router = ProviderRouter()
        self.resolver = EntityResolutionService()
        self.timeline = TimelineService()

    async def run(self, state: dict[str, Any]) -> dict[str, Any]:
        text = str(state.get("extracted_text", ""))
        extracted = self.extractor.extract(text)
        llm_result = await self.router.extract(text, extracted, state.get("image_path"))
        entities = [item.model_dump() for item in llm_result.entities] or extracted["entities"]
        transactions = [item.model_dump() for item in llm_result.transactions] or extracted["transactions"]
        resolved = self.resolver.resolve(entities)
        entities = resolved["entities"]
        return {
            "extracted_text": text,
            "qr_codes": list(state.get("qr_codes", [])),
            "entities": entities,
            "transactions": transactions,
            "indicators": [item.model_dump() for item in llm_result.indicators] or list(state.get("indicators", [])),
            "claims": llm_result.claims,
            "relationships": llm_result.relationships or list(state.get("relationships", [])),
            "entity_aliases": resolved["aliases"],
            "timeline": self.timeline.extract(text, transactions),
            "extraction_warnings": list(state.get("extraction_warnings", [])) + llm_result.warnings,
            "model_metadata": {"provider": llm_result.provider, "model": llm_result.model, "confidence": llm_result.confidence},
            "evidence_summary": {"text_length": len(text), "entity_count": len(entities), "transaction_count": len(transactions), "qr_count": len(state.get("qr_codes", [])), "alias_count": len(resolved["aliases"])},
        }

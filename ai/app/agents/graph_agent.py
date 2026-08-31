from typing import Any
from .base_agent import BaseAgent
from ..services.graph_service import GraphService


class GraphAgent(BaseAgent):
    name = "graph-agent"

    def __init__(self, service: GraphService | None = None): self.service = service or GraphService()

    async def run(self, state: dict[str, Any]) -> dict[str, Any]:
        try:
            entities = state.get("entities", [])
            relationships = list(state.get("relationships", []))
            by_value = {str(e.get("normalized_value") or e.get("value")): e for e in entities}
            for transaction in state.get("transactions", []):
                receiver = str(transaction.get("receiver", ""))
                if receiver in by_value:
                    transaction_id = transaction.get("reference") or f"transaction:{transaction.get('amount')}"
                    entities = [*entities, {"entity_type": "TRANSACTION", "value": transaction_id, "normalized_value": transaction_id, "confidence": 1.0, "source": "ocr"}]
                    relationships.append({"source": transaction_id, "target": receiver, "type": "TRANSACTION_RECEIVER", "confidence": 1.0, "reason": "receiver extracted from the same OCR transaction line", "evidence_id": state.get("case_id")})
            return {"graph": self.service.analyze(entities, relationships), "relationships": relationships}
        except Exception as exc: return {"graph": {"agent": self.name, "status": "failed", "error": str(exc), "nodes": [], "edges": [], "clusters": [], "suspicious_entities": [], "metrics": {}, "risk_score": 0, "findings": []}}

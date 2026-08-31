from typing import Any
from .base_agent import BaseAgent
from ..services.graph_service import GraphService


class GraphAgent(BaseAgent):
    name = "graph-agent"

    def __init__(self, service: GraphService | None = None): self.service = service or GraphService()

    async def run(self, state: dict[str, Any]) -> dict[str, Any]:
        try: return {"graph": self.service.analyze(state.get("entities", []), state.get("relationships", []))}
        except Exception as exc: return {"graph": {"agent": self.name, "status": "failed", "error": str(exc), "nodes": [], "edges": [], "clusters": [], "suspicious_entities": [], "metrics": {}, "risk_score": 0, "findings": []}}

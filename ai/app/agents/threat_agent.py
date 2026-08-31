from typing import Any
from .base_agent import BaseAgent
from ..services.url_feature_extractor import URLService


class ThreatAgent(BaseAgent):
    name = "threat-agent"

    def __init__(self): self.service = URLService()

    async def run(self, state: dict[str, Any]) -> dict[str, Any]:
        results = []
        for entity in state.get("entities", []):
            if str(entity.get("entity_type") or entity.get("type")).upper() == "URL":
                try: results.extend((await self.service.analyze(str(entity.get("value", "")))).get("indicators", []))
                except Exception as exc: results.append({"type": "THREAT_SCAN_ERROR", "value": entity.get("value"), "error": str(exc), "severity": "LOW"})
        return {"threat_indicators": results}

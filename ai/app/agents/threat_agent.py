from typing import Any

from .base_agent import BaseAgent
from ..services.url_feature_extractor import URLService


class ThreatAgent(BaseAgent):

    name = "threat-agent"

    def __init__(self):
        self.url_service = URLService()

    async def run(
        self,
        state: dict[str, Any]
    ) -> dict[str, Any]:

        entities = state.get(
            "entities",
            []
        )

        indicators = []

        for entity in entities:

            if entity.get("entity_type") == "URL":

                result = await self.url_service.analyze(
                    entity["value"]
                )

                indicators.extend(
                    result.get("indicators", [])
                )

        return {
            "threat_indicators": indicators
        }
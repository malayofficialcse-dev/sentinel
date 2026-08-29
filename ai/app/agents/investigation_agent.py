from typing import Any

from .base_agent import BaseAgent
from ..services.llm_service import LLMService


class InvestigationAgent(BaseAgent):

    name = "investigation-agent"

    def __init__(self):

        self.llm = LLMService()

    async def run(
        self,
        state: dict[str, Any]
    ) -> dict[str, Any]:

        prompt = {
            "entities": state.get(
                "entities",
                []
            ),

            "indicators": state.get(
                "threat_indicators",
                []
            ),

            "financial_findings": state.get(
                "financial_findings",
                []
            ),

            "relationships": state.get(
                "relationships",
                []
            ),

            "evidence_text": state.get(
                "extracted_text",
                ""
            )
        }

        result = await self.llm.investigate(
            prompt
        )

        return {
            "investigation": result
        }
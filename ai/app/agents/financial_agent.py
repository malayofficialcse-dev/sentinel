from typing import Any

from .base_agent import BaseAgent
from ..services.financial_service import FinancialService


class FinancialAgent(BaseAgent):

    name = "financial-agent"

    def __init__(self):

        self.service = FinancialService()

    async def run(
        self,
        state: dict[str, Any]
    ) -> dict[str, Any]:

        transactions = state.get(
            "transactions",
            []
        )

        result = await self.service.analyze(
            transactions
        )

        return {
            "financial_findings": result
        }
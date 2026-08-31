from typing import Any
from .base_agent import BaseAgent
from ..services.financial_service import FinancialService


class FinancialAgent(BaseAgent):
    name = "financial-agent"

    def __init__(self): self.service = FinancialService()

    async def run(self, state: dict[str, Any]) -> dict[str, Any]:
        try: return {"financial_findings": await self.service.analyze(state.get("transactions", []))}
        except Exception as exc: return {"financial_findings": [{"status": "failed", "error": str(exc)}]}

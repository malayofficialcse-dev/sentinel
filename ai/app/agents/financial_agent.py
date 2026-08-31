from typing import Any
from .base_agent import BaseAgent
from ..services.financial_service import FinancialService
from ..services.financial_model_service import FinancialModelService


class FinancialAgent(BaseAgent):
    name = "financial-agent"

    def __init__(self):
        self.service = FinancialService()
        self.model = FinancialModelService()

    async def run(self, state: dict[str, Any]) -> dict[str, Any]:
        findings = []
        warnings = list(state.get("extraction_warnings", []))
        transactions = state.get("transactions", [])
        try:
            rules = await self.service.analyze(transactions)
            findings.extend({**item, "source": "rule-engine", "finding_type": "RULE_FINDING"} for item in rules)
        except Exception as exc:
            warnings.append(f"Financial rule analysis failed: {exc}")
        for transaction in transactions:
            try:
                prediction = self.model.predict(
                    str(transaction.get("type") or "TRANSFER"),
                    float(transaction.get("amount", 0)),
                    float(transaction.get("oldbalanceOrg", 0)),
                    float(transaction.get("newbalanceOrig", 0)),
                    float(transaction.get("oldbalanceDest", 0)),
                    float(transaction.get("newbalanceDest", 0)),
                    int(transaction.get("step", 1)),
                    int(transaction.get("isFlaggedFraud", 0)),
                )
                findings.append({"finding_type": "ML_FINDING", "source": "financial-model", "transaction": transaction, **prediction})
            except Exception as exc:
                warnings.append(f"Financial model unavailable for transaction: {exc}")
        return {"financial_findings": findings, "extraction_warnings": warnings}

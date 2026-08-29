from ..agents.evidence_agent import EvidenceAgent
from ..agents.threat_agent import ThreatAgent
from ..agents.financial_agent import FinancialAgent
from ..agents.graph_agent import GraphAgent
from ..agents.investigation_agent import InvestigationAgent


class InvestigationOrchestrator:

    def __init__(self):

        self.evidence_agent = EvidenceAgent()
        self.threat_agent = ThreatAgent()
        self.financial_agent = FinancialAgent()
        self.graph_agent = GraphAgent()
        self.investigation_agent = InvestigationAgent()

    async def run(
        self,
        state: dict
    ) -> dict:

        state.update(
            await self.evidence_agent.run(state)
        )

        state.update(
            await self.threat_agent.run(state)
        )

        state.update(
            await self.financial_agent.run(state)
        )

        state.update(
            await self.graph_agent.run(state)
        )

        state.update(
            await self.investigation_agent.run(state)
        )

        return state
"""
Investigation Orchestrator
==========================
Coordinates execution of all specialized agents in sequence:
  1. EvidenceAgent      -> OCR/PDF + Entity & Transaction Extraction + QR Code + LLM Enrichment
  2. ThreatAgent        -> URL Phishing ML Scanning & Threat Indicators
  3. FinancialAgent     -> Transaction Fraud Rule Evaluation
  4. GraphAgent         -> Entity Relationship Graph Construction
  5. InvestigationAgent -> Synthesis & Narrative / Findings generation via LLM
  6. Risk Assessment    -> Weighted multi-factor risk scoring
"""

from typing import Any

from ..agents.evidence_agent import EvidenceAgent
from ..agents.threat_agent import ThreatAgent
from ..agents.financial_agent import FinancialAgent
from ..agents.graph_agent import GraphAgent
from ..agents.investigation_agent import InvestigationAgent
from ..services.risk_service import RiskService


class InvestigationOrchestrator:

    def __init__(self):
        self.evidence_agent = EvidenceAgent()
        self.threat_agent = ThreatAgent()
        self.financial_agent = FinancialAgent()
        self.graph_agent = GraphAgent()
        self.investigation_agent = InvestigationAgent()
        self.risk_service = RiskService()

    async def run(
        self,
        state: dict[str, Any]
    ) -> dict[str, Any]:

        # 1. Evidence Extraction
        evidence_result = await self.evidence_agent.run(state)
        state.update(evidence_result)

        # 2. Threat Analysis
        threat_result = await self.threat_agent.run(state)
        state.update(threat_result)

        # 3. Financial Analysis
        financial_result = await self.financial_agent.run(state)
        state.update(financial_result)

        # 4. Graph Construction
        graph_result = await self.graph_agent.run(state)
        state.update(graph_result)

        # 5. Overall Risk Calculation
        state["risk"] = self._calculate_overall_risk(state)

        # 6. Investigation Synthesis (LLM or deterministic factual synthesis)
        investigation_result = await self.investigation_agent.run(state)
        state.update(investigation_result)

        return state

    def _calculate_overall_risk(self, state: dict[str, Any]) -> dict[str, Any]:
        """Compute aggregated risk score across threat, financial, entity, graph, and evidence factors."""
        threat_indicators = state.get("threat_indicators", [])
        financial_findings = state.get("financial_findings", [])
        warnings = state.get("extraction_warnings", [])
        entities = state.get("entities", [])
        transactions = state.get("transactions", [])

        # Severity mapper for rule findings
        severity_map = {"CRITICAL": 90.0, "HIGH": 75.0, "MEDIUM": 50.0, "LOW": 25.0}

        # Threat score (0-100)
        threat_score = max((float(i.get("probability", 0)) * 100 for i in threat_indicators), default=0.0)

        # Financial score (0-100)
        fin_scores = []
        for f in financial_findings:
            if f.get("finding_type") == "ML_FINDING":
                fin_scores.append(float(f.get("fraud_probability", 0)) * 100)
            elif "severity" in f:
                fin_scores.append(severity_map.get(str(f["severity"]).upper(), 40.0))
        if transactions and not fin_scores:
            fin_scores.append(45.0 if len(transactions) > 1 else 30.0)

        financial_score = max(fin_scores, default=0.0)

        # Entity score (0-100 based on extracted forensic indicators)
        entity_score = min(100.0, float(len(entities) * 15.0)) if entities else 0.0

        # Graph score (0-100 based on connectivity density)
        graph_nodes = state.get("graph", {}).get("nodes", [])
        graph_edges = state.get("graph", {}).get("edges", [])
        graph_score = float(state.get("graph", {}).get("risk_score", 0.0))
        if not graph_score and (graph_nodes or graph_edges):
            graph_score = min(100.0, float(len(graph_nodes) * 10.0 + len(graph_edges) * 15.0))

        # Evidence score (0-100 based on extraction completeness)
        evidence_score = 70.0 if state.get("extracted_text") else 0.0
        if warnings:
            evidence_score = max(0.0, evidence_score - 20.0 * len(warnings))

        return self.risk_service.calculate(
            threat_score=threat_score,
            financial_score=financial_score,
            entity_score=entity_score,
            graph_score=graph_score,
            evidence_score=evidence_score
        )

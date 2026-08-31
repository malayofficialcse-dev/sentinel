from typing import Any
from .base_agent import BaseAgent


class InvestigationAgent(BaseAgent):
    name = "investigation-agent"

    async def run(self, state: dict[str, Any]) -> dict[str, Any]:
        threat = state.get("threat_indicators", []); financial = state.get("financial_findings", []); graph = state.get("graph", {})
        entities = state.get("entities", []); evidence = state.get("evidence", [])
        score = round(float(state.get("risk", {}).get("score", 0)), 2)
        level = "CRITICAL" if score >= 90 else "HIGH" if score >= 70 else "MEDIUM" if score >= 40 else "LOW"
        findings = ([{"type": "EVIDENCE_SUPPORTED", "message": "Observed evidence was processed", "evidence_count": len(evidence)}] if evidence else [])
        if threat: findings.append({"type": "MODEL_PREDICTION", "message": "Threat model produced indicators", "count": len(threat)})
        if graph.get("findings"): findings.append({"type": "INFERRED_RELATIONSHIP", "message": "Graph analysis produced relationship findings"})
        return {"investigation": {"agent": self.name, "status": "completed", "summary": f"Investigation contains {len(entities)} entities, {len(threat)} threat indicators, and {len(financial)} financial findings.", "risk_level": level, "risk_score": score, "facts": [{"type": "EXTRACTED_ENTITY", "entity": e} for e in entities[:10]], "model_predictions": [*threat[:10], *[f for f in financial if f.get("finding_type") == "ML_FINDING"]], "indicators": [*threat, *[f for f in financial if f.get("finding_type") == "RULE_FINDING"]], "recommendations": ["Preserve original evidence and review model-supported findings."] if score >= 40 else [], "key_entities": entities[:10], "timeline": state.get("timeline", []), "findings": findings, "graph_findings": graph.get("findings", []), "financial_findings": financial, "threat_findings": threat}}

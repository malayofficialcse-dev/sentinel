class RiskService:

    THREAT_WEIGHT = 0.25
    FINANCIAL_WEIGHT = 0.25
    ENTITY_WEIGHT = 0.20
    GRAPH_WEIGHT = 0.15
    EVIDENCE_WEIGHT = 0.15

    def calculate(
        self,
        threat_score: float,
        financial_score: float,
        entity_score: float,
        graph_score: float,
        evidence_score: float
    ) -> dict:

        score = (
            threat_score * self.THREAT_WEIGHT
            + financial_score * self.FINANCIAL_WEIGHT
            + entity_score * self.ENTITY_WEIGHT
            + graph_score * self.GRAPH_WEIGHT
            + evidence_score * self.EVIDENCE_WEIGHT
        )

        score = round(score, 2)

        if score >= 90:
            level = "CRITICAL"
        elif score >= 70:
            level = "HIGH"
        elif score >= 40:
            level = "MEDIUM"
        else:
            level = "LOW"

        return {
            "score": score,
            "level": level,
            "factors": {
                "threat": threat_score,
                "financial": financial_score,
                "entity": entity_score,
                "graph": graph_score,
                "evidence": evidence_score
            }
        }
class RiskService:

    VERSION = "risk-v2.0"

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

        raw_factors = {
            "threat": (threat_score, self.THREAT_WEIGHT),
            "financial": (financial_score, self.FINANCIAL_WEIGHT),
            "entity": (entity_score, self.ENTITY_WEIGHT),
            "graph": (graph_score, self.GRAPH_WEIGHT),
            "evidence": (evidence_score, self.EVIDENCE_WEIGHT),
        }
        score = sum(max(0.0, min(100.0, value)) * weight for value, weight in raw_factors.values())

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
            "confidence": round(min(1.0, sum(value > 0 for value, _ in raw_factors.values()) / len(raw_factors)), 2),
            "model_version": self.VERSION,
            "factors": {name: round(value, 2) for name, (value, _) in raw_factors.items()},
            "factor_contributions": {
                name: round(max(0.0, min(100.0, value)) * weight, 2)
                for name, (value, weight) in raw_factors.items()
            },
        }

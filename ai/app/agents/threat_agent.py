from typing import Any
from .base_agent import BaseAgent
from ..services.url_feature_extractor import URLService


class ThreatAgent(BaseAgent):
    name = "threat-agent"

    def __init__(self): self.service = URLService()

    async def run(self, state: dict[str, Any]) -> dict[str, Any]:
        results = []
        warnings = list(state.get("extraction_warnings", []))
        for entity in state.get("entities", []):
            if str(entity.get("entity_type") or entity.get("type")).upper() == "URL":
                try:
                    result = await self.service.analyze(str(entity.get("value", "")))
                    results.append({
                        "type": "PHISHING_URL" if result.get("is_phishing") else "URL_MODEL_PREDICTION",
                        "severity": result.get("risk", {}).get("level", "LOW"),
                        "value": result.get("url", entity.get("value")),
                        "source": "phishing-model",
                        "confidence": result.get("phishing_probability", 0.0),
                        "model": "calibrated-url-ensemble",
                        "probability": result.get("phishing_probability", 0.0),
                        "decision": result.get("decision"),
                        "out_of_distribution": result.get("out_of_distribution", False),
                        "model_probability": result.get("model_probability"),
                        "evidence_risk": result.get("evidence_risk"),
                        "operational_risk": result.get("operational_risk"),
                        "features": result.get("features", {}),
                    })
                    for indicator in result.get("indicators", []):
                        indicator.update({"source": "phishing-model", "model": "calibrated-url-ensemble", "probability": result.get("phishing_probability"), "decision": result.get("decision")})
                        results.append(indicator)
                except Exception as exc:
                    warnings.append(f"Phishing model unavailable for {entity.get('value')}: {exc}")
        return {"threat_indicators": results, "extraction_warnings": warnings}

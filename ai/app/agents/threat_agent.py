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
                        "model": "url_model1.pkl",
                        "probability": result.get("phishing_probability", 0.0),
                        "features": result.get("features", {}),
                    })
                    for indicator in result.get("indicators", []):
                        indicator.update({"source": "phishing-model", "model": "url_model1.pkl", "probability": result.get("phishing_probability")})
                        results.append(indicator)
                except Exception as exc:
                    warnings.append(f"Phishing model unavailable for {entity.get('value')}: {exc}")
        return {"threat_indicators": results, "extraction_warnings": warnings}

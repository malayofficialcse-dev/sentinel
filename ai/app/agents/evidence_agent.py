import re
from typing import Any
from .base_agent import BaseAgent


class EvidenceAgent(BaseAgent):
    name = "evidence-agent"

    async def run(self, state: dict[str, Any]) -> dict[str, Any]:
        text = str(state.get("extracted_text", "")); entities = list(state.get("entities", [])); transactions = list(state.get("transactions", []))
        patterns = [("EMAIL", r"[\w.+-]+@[\w-]+\.[\w.-]+"), ("URL", r"https?://[^\s]+"), ("PHONE", r"(?<!\d)[6-9]\d{9}(?!\d)"), ("UPI", r"[\w.-]+@[a-zA-Z]{2,20}")]
        seen = {(str(e.get("entity_type") or e.get("type")), str(e.get("value"))).lower() for e in entities}
        for kind, pattern in patterns:
            for match in re.findall(pattern, text, re.I):
                key = (kind, match).lower()
                if key not in seen: entities.append({"entity_type": kind, "value": match, "normalized_value": match.lower(), "confidence": 0.9, "source": "ocr"}); seen.add(key)
        return {"extracted_text": text, "entities": entities, "transactions": transactions, "relationships": state.get("relationships", []), "extraction_warnings": []}

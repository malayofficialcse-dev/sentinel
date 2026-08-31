"""
Threat Agent
============
Step 2 of the investigation pipeline.

For every URL entity found by the Evidence Agent, runs the ML-based
URL scanner to determine phishing probability and risk level.

Also incorporates any indicators already flagged by the LLM (passed
through state as llm_indicators).
"""

from typing import Any

from .base_agent import BaseAgent
from ..services.url_feature_extractor import URLService


class ThreatAgent(BaseAgent):

    name = "threat-agent"

    def __init__(self):
        self.url_service = URLService()

    async def run(
        self,
        state: dict[str, Any]
    ) -> dict[str, Any]:
        """
        Scan all URL entities for phishing / malware.

        Reads from state:
          - entities        : list of entity dicts from EvidenceAgent
          - llm_indicators  : indicators already flagged by LLM

        Writes to state:
          - threat_indicators : merged list of threat indicator dicts
        """

        entities = state.get("entities", [])
        llm_indicators = state.get("llm_indicators", [])

        # Collect all unique URLs (from entities + QR codes)
        urls_to_scan: list[str] = []
        seen_urls: set[str] = set()

        for entity in entities:
            if entity.get("entity_type") in ("URL",):
                url = entity.get("value", "").strip()
                if url and url not in seen_urls:
                    urls_to_scan.append(url)
                    seen_urls.add(url)

        # Scan each URL
        ml_indicators: list[dict] = []

        for url in urls_to_scan:
            result = await self.url_service.analyze(url)
            ml_indicators.extend(result.get("indicators", []))

        # Merge LLM + ML indicators (deduplicate by value)
        seen_indicator_values: set[str] = set()
        merged: list[dict] = []

        for indicator in (ml_indicators + llm_indicators):
            value = str(indicator.get("value", "")).lower()
            key = f"{indicator.get('type','')}-{value}"
            if key not in seen_indicator_values:
                seen_indicator_values.add(key)
                merged.append(indicator)

        return {
            "threat_indicators": merged
        }
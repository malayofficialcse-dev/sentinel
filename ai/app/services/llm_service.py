from typing import Any

from ..config import settings


class LLMService:

    async def analyze(
        self,
        prompt: str,
        image_path: str | None = None
    ) -> dict[str, Any]:

        # Provider integration will be implemented here.

        return {
            "entities": [],
            "indicators": [],
            "transactions": [],
            "claims": [],
            "confidence": 0.0
        }

    async def investigate(
        self,
        context: dict[str, Any]
    ) -> dict[str, Any]:

        # Structured investigation output.

        return {
            "narrative": "",
            "findings": [],
            "recommendations": [],
            "confidence": 0.0
        }
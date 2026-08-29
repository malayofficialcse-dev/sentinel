from typing import Any

from .base_agent import BaseAgent
from ..services.ocr_service import OCRService


class EvidenceAgent(BaseAgent):

    name = "evidence-agent"

    def __init__(self):
        self.ocr = OCRService()

    async def run(
        self,
        state: dict[str, Any]
    ) -> dict[str, Any]:

        evidence = state.get(
            "evidence",
            {}
        )

        extracted_text = ""

        if evidence.get("file_path"):
            extracted_text = await self.ocr.extract(
                evidence["file_path"]
            )

        return {
            "extracted_text": extracted_text
        }
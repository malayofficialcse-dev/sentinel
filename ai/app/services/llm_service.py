"""
LLM Service — Gemini Integration
=================================
Provides two capabilities:
  1. analyze()    — extract structured entities from screenshot text via LLM
  2. investigate()— generate investigation narrative, findings, recommendations
"""

import json
import re
from typing import Any, Optional

from ..config import settings


# ─────────────────────────────────────────────────────────────
# Lazy Gemini client
# ─────────────────────────────────────────────────────────────

_gemini_client = None


def _get_client():
    """Return (and lazily initialise) the Gemini generative model."""
    global _gemini_client

    if _gemini_client is not None:
        return _gemini_client

    try:
        import google.generativeai as genai  # type: ignore

        genai.configure(api_key=settings.LLM_API_KEY)

        model_name = settings.LLM_MODEL or "gemini-1.5-flash"

        _gemini_client = genai.GenerativeModel(model_name)

    except ImportError:
        raise RuntimeError(
            "google-generativeai is not installed. "
            "Run: pip install google-generativeai"
        )

    return _gemini_client


# ─────────────────────────────────────────────────────────────
# Prompt templates
# ─────────────────────────────────────────────────────────────

_ANALYZE_SYSTEM_PROMPT = """
You are an AI assistant for a cyber-fraud investigation system called Sentinel.
Your task is to analyze text extracted from a screenshot (e.g., a WhatsApp message,
bank statement, phishing email, or payment confirmation) and extract structured
forensic information.

Return ONLY a valid JSON object with this exact structure:
{
  "entities": [
    {
      "entity_type": "PERSON|PHONE|EMAIL|URL|DOMAIN|IP|UPI|BANK_ACCOUNT|WALLET|TRANSACTION|ORGANIZATION|LOCATION|UNKNOWN",
      "value": "the raw value found in the text",
      "normalized_value": "cleaned / standardized form",
      "confidence": 0.0-1.0,
      "context": "brief description of how this entity appears in the text"
    }
  ],
  "indicators": [
    {
      "type": "PHISHING_URL|SUSPICIOUS_DOMAIN|IMPERSONATION|URGENCY_LANGUAGE|SUSPICIOUS_PHONE|SUSPICIOUS_EMAIL|MALICIOUS_IP|UNUSUAL_TRANSACTION|RAPID_FUND_MOVEMENT|NEW_BENEFICIARY|UNKNOWN",
      "value": "the indicator value",
      "description": "why this is suspicious",
      "severity": "LOW|MEDIUM|HIGH|CRITICAL",
      "confidence": 0.0-1.0
    }
  ],
  "transactions": [
    {
      "amount": 0.0,
      "currency": "INR",
      "sender": "sender name or ID",
      "receiver": "receiver name or ID",
      "reference": "transaction reference number or null",
      "timestamp": "ISO datetime string or null"
    }
  ],
  "claims": [
    "any important textual claim or statement found (e.g., 'you have won a prize')"
  ],
  "summary": "one sentence summary of what this screenshot shows",
  "confidence": 0.0-1.0
}

Focus on Indian financial fraud patterns: UPI scams, phishing, impersonation of banks/NPCI/government.
Only include entities and indicators that are actually present. Do not hallucinate.
"""

_INVESTIGATE_SYSTEM_PROMPT = """
You are a senior cyber-fraud investigator AI for the Sentinel system.
You have been provided with structured evidence data extracted from a fraud report.
Your task is to synthesize all evidence and produce a comprehensive investigation report.

Return ONLY a valid JSON object with this exact structure:
{
  "narrative": "2-4 paragraph factual narrative describing the fraud pattern and what happened",
  "findings": [
    {
      "finding_type": "category of finding (e.g., PHISHING_ATTACK, UPI_FRAUD, IMPERSONATION, FINANCIAL_FRAUD)",
      "title": "short title",
      "description": "detailed description with evidence references",
      "severity": "LOW|MEDIUM|HIGH|CRITICAL",
      "confidence": 0.0-1.0,
      "supporting_entities": ["entity values that support this finding"],
      "supporting_indicators": ["indicator values that support this finding"]
    }
  ],
  "recommendations": [
    "actionable recommendation for the investigator"
  ],
  "next_actions": [
    "specific next steps to advance the investigation"
  ],
  "confidence": 0.0-1.0
}

Be factual and specific. Reference actual entity values from the provided evidence.
"""


# ─────────────────────────────────────────────────────────────
# JSON extraction helper
# ─────────────────────────────────────────────────────────────

def _extract_json(text: str) -> dict:
    """
    Extract JSON from LLM response text.
    Handles markdown code fences (```json ... ```) and raw JSON.
    """
    # Strip markdown code fences
    fence_match = re.search(
        r"```(?:json)?\s*([\s\S]+?)\s*```",
        text
    )
    if fence_match:
        text = fence_match.group(1)

    # Find the outermost JSON object
    brace_match = re.search(
        r"\{[\s\S]+\}",
        text
    )
    if brace_match:
        text = brace_match.group()

    return json.loads(text)


# ─────────────────────────────────────────────────────────────
# LLM Service
# ─────────────────────────────────────────────────────────────

class LLMService:
    """
    Gemini-powered LLM service for entity extraction and investigation.

    Falls back to empty safe defaults when the API key is not configured
    so the rest of the pipeline continues to function.
    """

    def _is_configured(self) -> bool:
        return bool(settings.LLM_API_KEY)

    # ─────────────────────────────────────────────────────
    # analyze() — entity + indicator extraction
    # ─────────────────────────────────────────────────────

    async def analyze(
        self,
        text: str,
        image_path: Optional[str] = None
    ) -> dict[str, Any]:
        """
        Extract entities, indicators, and transactions from OCR text.

        Parameters
        ----------
        text:
            Raw text extracted from the evidence (from OCRService).
        image_path:
            Optional path to the original image. If provided and Gemini
            Vision is available, the image is sent alongside the text.

        Returns
        -------
        dict with keys: entities, indicators, transactions, claims,
                        summary, confidence
        """
        _empty = {
            "entities": [],
            "indicators": [],
            "transactions": [],
            "claims": [],
            "summary": "",
            "confidence": 0.0
        }

        if not self._is_configured():
            return _empty

        if not text.strip():
            return _empty

        try:
            client = _get_client()

            user_message = (
                f"Analyze the following text extracted from a screenshot:\n\n"
                f"---\n{text}\n---\n\n"
                f"Extract all forensically relevant entities and indicators."
            )

            # Vision: attach image if path is provided and file exists
            content_parts: list[Any] = [user_message]

            if image_path:
                import pathlib
                img_path = pathlib.Path(image_path)
                if img_path.exists():
                    try:
                        import google.generativeai as genai  # type: ignore
                        img_part = genai.upload_file(str(img_path))
                        content_parts = [img_part, user_message]
                    except Exception:
                        pass  # fall back to text-only

            response = client.generate_content(
                [_ANALYZE_SYSTEM_PROMPT] + content_parts,
                generation_config={
                    "temperature": 0.1,
                    "max_output_tokens": 4096
                }
            )

            raw_text = response.text
            return _extract_json(raw_text)

        except json.JSONDecodeError:
            return _empty

        except Exception:
            return _empty

    # ─────────────────────────────────────────────────────
    # investigate() — narrative + findings generation
    # ─────────────────────────────────────────────────────

    async def investigate(
        self,
        context: dict[str, Any]
    ) -> dict[str, Any]:
        """
        Generate a structured investigation report from aggregated evidence.

        Parameters
        ----------
        context:
            Dictionary containing:
              - entities: list of extracted entities
              - indicators: list of threat indicators
              - financial_findings: list of financial analysis findings
              - relationships: list of entity relationships
              - evidence_text: original OCR text
              - risk: risk assessment dict (optional)

        Returns
        -------
        dict with keys: narrative, findings, recommendations,
                        next_actions, confidence
        """
        _empty = {
            "narrative": "",
            "findings": [],
            "recommendations": [],
            "next_actions": [],
            "confidence": 0.0
        }

        if not self._is_configured():
            return _empty

        try:
            client = _get_client()

            # Summarize context for the prompt
            context_summary = json.dumps(context, indent=2, default=str)

            user_message = (
                "Based on the following evidence data from a fraud investigation, "
                "generate a comprehensive investigation report:\n\n"
                f"```json\n{context_summary}\n```"
            )

            response = client.generate_content(
                [_INVESTIGATE_SYSTEM_PROMPT, user_message],
                generation_config={
                    "temperature": 0.2,
                    "max_output_tokens": 4096
                }
            )

            raw_text = response.text
            return _extract_json(raw_text)

        except json.JSONDecodeError:
            return _empty

        except Exception:
            return _empty
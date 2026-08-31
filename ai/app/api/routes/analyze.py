"""
Analyze Routes
==============
Quick-scan endpoints for individual URLs and raw text — useful for
real-time checks without uploading a full evidence file.

POST /api/analyze/url    — scan a single URL for phishing
POST /api/analyze/text   — extract entities from raw text
"""

from typing import Annotated

from fastapi import APIRouter, Body, Depends, HTTPException, status
from pydantic import BaseModel, HttpUrl

from ..dependencies import (
    get_entity_extractor,
    get_llm_service,
    get_url_service,
)
from ...services.entity_extractor import EntityExtractor
from ...services.llm_service import LLMService
from ...services.url_feature_extractor import URLService


router = APIRouter(prefix="/analyze", tags=["Analysis"])


# ─────────────────────────────────────────────────────────────
# Request / Response schemas
# ─────────────────────────────────────────────────────────────

class URLScanRequest(BaseModel):
    url: str

    model_config = {"json_schema_extra": {"example": {"url": "https://bit.ly/fake-bank"}}}


class URLScanResponse(BaseModel):
    url: str
    domain: str
    is_phishing: bool
    phishing_probability: float
    risk: dict
    reasons: list[str]
    features: dict
    indicators: list[dict]
    model_available: bool


class TextAnalysisRequest(BaseModel):
    text: str
    use_llm: bool = True

    model_config = {
        "json_schema_extra": {
            "example": {
                "text": "Pay ₹5000 to rahul@sbi via UPI. Click: http://bit.ly/pay",
                "use_llm": True
            }
        }
    }


class TextAnalysisResponse(BaseModel):
    entities: list[dict]
    transactions: list[dict]
    llm_entities: list[dict]
    llm_indicators: list[dict]
    llm_summary: str


# ─────────────────────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────────────────────

@router.post(
    "/url",
    response_model=URLScanResponse,
    summary="Scan a URL for phishing",
    description=(
        "Submit a single URL. The ML model extracts 22 structural features "
        "and classifies it as phishing or legitimate, returning a risk score "
        "and human-readable reasons."
    )
)
async def scan_url(
    body: URLScanRequest,
    url_service: URLService = Depends(get_url_service)
) -> URLScanResponse:

    url = body.url.strip()
    if not url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="URL must not be empty."
        )

    result = await url_service.analyze(url)

    return URLScanResponse(**result)


@router.post(
    "/text",
    response_model=TextAnalysisResponse,
    summary="Extract entities from raw text",
    description=(
        "Submit raw text (e.g., manually typed report or copy-pasted message). "
        "Regex extracts entities immediately; optionally the LLM enriches results."
    )
)
async def analyze_text(
    body: TextAnalysisRequest,
    extractor: EntityExtractor = Depends(get_entity_extractor),
    llm: LLMService = Depends(get_llm_service)
) -> TextAnalysisResponse:

    text = body.text.strip()
    if not text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="text must not be empty."
        )

    # Regex extraction (always runs)
    extraction = extractor.extract(text)

    regex_entities = [
        {
            "entity_type": e.entity_type,
            "value": e.value,
            "normalized_value": e.normalized_value,
            "confidence": e.confidence,
            "context": e.context,
            "source": "regex"
        }
        for e in extraction.entities
    ]

    regex_transactions = [
        {
            "amount": t.amount,
            "currency": t.currency,
            "sender": t.sender,
            "receiver": t.receiver,
            "reference": t.reference
        }
        for t in extraction.transactions
    ]

    # LLM enrichment (optional)
    llm_entities: list[dict] = []
    llm_indicators: list[dict] = []
    llm_summary = ""

    if body.use_llm:
        llm_result = await llm.analyze(text=text)
        llm_entities = llm_result.get("entities", [])
        llm_indicators = llm_result.get("indicators", [])
        llm_summary = llm_result.get("summary", "")

    return TextAnalysisResponse(
        entities=regex_entities,
        transactions=regex_transactions,
        llm_entities=llm_entities,
        llm_indicators=llm_indicators,
        llm_summary=llm_summary
    )

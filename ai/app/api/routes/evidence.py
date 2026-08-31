"""
Evidence Routes
===============
POST /api/evidence/analyze

Accepts an uploaded screenshot (image or PDF), runs the full
AI investigation pipeline, and returns structured results.
"""

import hashlib
import uuid
from typing import Annotated, Optional

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from pydantic import BaseModel

from ..dependencies import get_orchestrator
from ...orchestration.orchestrator import InvestigationOrchestrator
from ...config import settings


router = APIRouter(prefix="/evidence", tags=["Evidence"])


# ─────────────────────────────────────────────────────────────
# Response schemas
# ─────────────────────────────────────────────────────────────

class AnalysisResponse(BaseModel):
    """Full pipeline result returned to the caller."""
    case_id: str
    evidence_id: str
    extracted_text: str
    qr_codes: list[str]
    entities: list[dict]
    transactions: list[dict]
    threat_indicators: list[dict]
    financial_findings: list[dict]
    relationships: list[dict]
    investigation: dict
    risk: dict
    extraction_warnings: list[str]
    evidence_summary: str


# ─────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────

ALLOWED_MIME_TYPES = {
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/bmp",
    "image/tiff",
    "application/pdf",
}

MAX_FILE_BYTES = settings.MAX_FILE_SIZE_MB * 1024 * 1024


def _validate_upload(file: UploadFile) -> None:
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=(
                f"Unsupported file type: {file.content_type}. "
                f"Accepted: image (PNG/JPG/WEBP/BMP/TIFF) or PDF."
            )
        )


def _file_extension(content_type: str) -> str:
    mapping = {
        "image/png": ".png",
        "image/jpeg": ".jpg",
        "image/jpg": ".jpg",
        "image/webp": ".webp",
        "image/bmp": ".bmp",
        "image/tiff": ".tiff",
        "application/pdf": ".pdf",
    }
    return mapping.get(content_type, ".bin")


# ─────────────────────────────────────────────────────────────
# Endpoint
# ─────────────────────────────────────────────────────────────

@router.post(
    "/analyze",
    response_model=AnalysisResponse,
    summary="Analyze an evidence screenshot",
    description=(
        "Upload a screenshot (PNG/JPG/PDF). "
        "The pipeline will extract text via OCR, decode QR codes, "
        "identify entities (UPI, phone, URL, bank account, amounts), "
        "scan URLs for phishing using the ML model, "
        "detect financial fraud patterns, "
        "and generate an AI-powered investigation narrative."
    )
)
async def analyze_evidence(
    file: Annotated[UploadFile, File(description="Screenshot or PDF to analyze")],
    case_id: Annotated[
        Optional[str],
        Form(description="Optional case ID to associate with this evidence")
    ] = None,
    orchestrator: InvestigationOrchestrator = Depends(get_orchestrator)
) -> AnalysisResponse:

    # ── Validate ───────────────────────────────────────────────
    _validate_upload(file)

    file_bytes = await file.read()

    if len(file_bytes) > MAX_FILE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=(
                f"File too large. Maximum allowed size is "
                f"{settings.MAX_FILE_SIZE_MB} MB."
            )
        )

    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty."
        )

    # ── Generate IDs ───────────────────────────────────────────
    evidence_id = str(uuid.uuid4())
    resolved_case_id = case_id or str(uuid.uuid4())

    # Compute SHA-256 hash for integrity
    sha256 = hashlib.sha256(file_bytes).hexdigest()

    # Derive a synthetic filename for the OCR service
    ext = _file_extension(file.content_type or "")
    synthetic_name = f"{evidence_id}{ext}"

    # ── Build initial pipeline state ──────────────────────────
    state: dict = {
        "case_id": resolved_case_id,
        "evidence_id": evidence_id,
        "evidence": {
            "id": evidence_id,
            "case_id": resolved_case_id,
            "file_path": synthetic_name,
            "file_bytes": file_bytes,
            "mime_type": file.content_type,
            "original_filename": file.filename or synthetic_name,
            "sha256": sha256,
        }
    }

    # ── Run the full agent pipeline ────────────────────────────
    try:
        result_state = await orchestrator.run(state)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Investigation pipeline failed: {exc}"
        )

    # ── Build response ─────────────────────────────────────────
    investigation = result_state.get("investigation", {})
    risk = result_state.get("risk", {
        "score": 0.0,
        "level": "LOW",
        "factors": {}
    })

    return AnalysisResponse(
        case_id=resolved_case_id,
        evidence_id=evidence_id,
        extracted_text=result_state.get("extracted_text", ""),
        qr_codes=result_state.get("qr_codes", []),
        entities=result_state.get("entities", []),
        transactions=result_state.get("transactions", []),
        threat_indicators=result_state.get("threat_indicators", []),
        financial_findings=result_state.get("financial_findings", []),
        relationships=result_state.get("relationships", []),
        investigation=investigation,
        risk=risk,
        extraction_warnings=result_state.get("extraction_warnings", []),
        evidence_summary=result_state.get("evidence_summary", "")
    )

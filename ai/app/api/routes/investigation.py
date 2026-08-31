"""
Investigation Routes
====================
POST /api/investigation/run — trigger full AI investigation on provided evidence or raw context.
"""

from typing import Any, Optional
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from ..dependencies import get_orchestrator
from ...orchestration.orchestrator import InvestigationOrchestrator


router = APIRouter(prefix="/investigation", tags=["Investigation"])


class InvestigationRequest(BaseModel):
    case_id: Optional[str] = None
    extracted_text: Optional[str] = ""
    entities: list[dict[str, Any]] = Field(default_factory=list)
    transactions: list[dict[str, Any]] = Field(default_factory=list)
    evidence: Optional[dict[str, Any]] = Field(default_factory=dict)


class InvestigationResponse(BaseModel):
    case_id: str
    extracted_text: str
    entities: list[dict[str, Any]]
    transactions: list[dict[str, Any]]
    threat_indicators: list[dict[str, Any]]
    financial_findings: list[dict[str, Any]]
    relationships: list[dict[str, Any]]
    investigation: dict[str, Any]
    risk: dict[str, Any]
    extraction_warnings: list[str]


@router.post(
    "/run",
    response_model=InvestigationResponse,
    summary="Run full investigation pipeline",
    description="Execute all investigation agents on structured or textual case data."
)
async def run_investigation(
    body: InvestigationRequest,
    orchestrator: InvestigationOrchestrator = Depends(get_orchestrator)
) -> InvestigationResponse:

    case_id = body.case_id or str(uuid.uuid4())

    state: dict[str, Any] = {
        "case_id": case_id,
        "extracted_text": body.extracted_text or "",
        "entities": body.entities or [],
        "transactions": body.transactions or [],
        "evidence": body.evidence or {},
    }

    try:
        result_state = await orchestrator.run(state)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Investigation failed: {exc}"
        )

    return InvestigationResponse(
        case_id=case_id,
        extracted_text=result_state.get("extracted_text", ""),
        entities=result_state.get("entities", []),
        transactions=result_state.get("transactions", []),
        threat_indicators=result_state.get("threat_indicators", []),
        financial_findings=result_state.get("financial_findings", []),
        relationships=result_state.get("relationships", []),
        investigation=result_state.get("investigation", {}),
        risk=result_state.get("risk", {"score": 0.0, "level": "LOW", "factors": {}}),
        extraction_warnings=result_state.get("extraction_warnings", [])
    )

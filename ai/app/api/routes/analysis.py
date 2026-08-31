from typing import Any
from fastapi import APIRouter, File, Form, UploadFile
from pydantic import BaseModel, Field
from ...orchestration.orchestrator import InvestigationOrchestrator
from ...agents.graph_agent import GraphAgent
from ...agents.investigation_agent import InvestigationAgent
from ...services.ocr_service import OCRService

router = APIRouter(tags=["Analysis"])
ocr = OCRService()

class PipelineRequest(BaseModel):
    case_id: str = ""
    evidence: list[dict[str, Any]] = Field(default_factory=list)
    entities: list[dict[str, Any]] = Field(default_factory=list)
    transactions: list[dict[str, Any]] = Field(default_factory=list)
    indicators: list[dict[str, Any]] = Field(default_factory=list)
    extracted_text: str = ""
    qr_codes: list[str] = Field(default_factory=list)

@router.post("/graph/analyze")
async def graph_analyze(body: PipelineRequest):
    return await GraphAgent().run(body.model_dump())

@router.post("/investigation/analyze")
async def investigation_analyze(body: PipelineRequest):
    return await InvestigationAgent().run(body.model_dump())

@router.post("/pipeline/run")
async def pipeline_run(body: PipelineRequest):
    return await InvestigationOrchestrator().run(body.model_dump())

@router.post("/evidence/analyze")
async def evidence_analyze(file: UploadFile = File(...), case_id: str = Form("")):
    raw = await file.read()
    result = ocr.extract(raw, file.content_type or "application/octet-stream")
    state = {"case_id": case_id, "evidence": [{"id": file.filename or "upload", "mime_type": file.content_type}], "extracted_text": result.text, "qr_codes": result.qr_codes, "entities": [], "transactions": [], "extraction_warnings": result.warnings}
    output = await InvestigationOrchestrator().run(state)
    output["qr_codes"] = result.qr_codes; output["extraction_warnings"] = result.warnings
    return output

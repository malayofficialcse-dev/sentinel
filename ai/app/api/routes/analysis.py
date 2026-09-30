from typing import Any
from fastapi import APIRouter, File, Form, UploadFile
from pydantic import BaseModel, Field
from ...orchestration.orchestrator import InvestigationOrchestrator
from ...agents.graph_agent import GraphAgent
from ...agents.investigation_agent import InvestigationAgent
from ...services.ocr_service import OCRService
from ...services.investigator_copilot import InvestigatorCopilot
from ...schemas.copilot_schema import CopilotRequest
from ...schemas.search_schema import SearchIndexRequest, SearchQueryRequest
from ...services.semantic_search import semantic_search

router = APIRouter(tags=["Analysis"])
ocr = OCRService()
copilot = InvestigatorCopilot()

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
    state = body.model_dump()
    if state.get("extracted_text"):
        state["semantic_index"] = semantic_search.index(
            document_id=f"{state.get('case_id') or 'case'}:pipeline",
            case_id=state.get("case_id", ""),
            text=state["extracted_text"],
            metadata={"source": "pipeline"},
        )
    return await InvestigationOrchestrator().run(state)

@router.post("/assistant/query")
async def assistant_query(body: CopilotRequest):
    return copilot.answer(body.question, body.model_dump()).model_dump()

@router.post("/search/index")
async def search_index(body: SearchIndexRequest):
    return semantic_search.index(**body.model_dump())

@router.post("/search/query")
async def search_query(body: SearchQueryRequest):
    return {"results": semantic_search.query(**body.model_dump()), "index": semantic_search.info()}

@router.post("/evidence/analyze")
async def evidence_analyze(file: UploadFile = File(...), case_id: str = Form("")):
    raw = await file.read()
    result = ocr.extract(raw, file.content_type or "application/octet-stream")
    semantic_index = semantic_search.index(
        document_id=f"{case_id or 'case'}:{file.filename or 'upload'}",
        case_id=case_id,
        text=result.text or (file.filename or "upload"),
        metadata={"filename": file.filename, "mime_type": file.content_type, "page_count": result.page_count},
    )
    state = {"case_id": case_id, "evidence": [{"id": file.filename or "upload", "mime_type": file.content_type}], "extracted_text": result.text, "qr_codes": result.qr_codes, "entities": [], "transactions": [], "extraction_warnings": result.warnings}
    output = await InvestigationOrchestrator().run(state)
    output["semantic_index"] = semantic_index
    output["qr_codes"] = result.qr_codes; output["extraction_warnings"] = result.warnings
    return output

from typing import Any
from fastapi import APIRouter, File, UploadFile
from pydantic import BaseModel
from ...services.url_feature_extractor import URLService
from ...services.financial_model_service import FinancialModelService
from ...services.malware_scanner_service import MalwareScannerService

router = APIRouter(prefix="/models", tags=["Models"])
url_service = URLService(); financial_service = FinancialModelService(); malware_service = MalwareScannerService()

class URLRequest(BaseModel): url: str
class FinancialRequest(BaseModel):
    type: str = "TRANSFER"; amount: float = 0; oldbalanceOrg: float = 0; newbalanceOrig: float = 0; oldbalanceDest: float = 0; newbalanceDest: float = 0; step: int = 1; isFlaggedFraud: int = 0
class HashRequest(BaseModel): hash: str

@router.get("/info")
async def model_info(): return {"models": [{"id": "phishing-url-model", "status": "ACTIVE"}, {"id": "financial-fraud-model", "status": "ACTIVE"}, {"id": "malware-threat-model", "status": "ACTIVE"}]}

@router.post("/phishing/predict")
async def phishing(body: URLRequest): return await url_service.analyze(body.url)

@router.post("/financial/predict")
async def financial(body: FinancialRequest): return financial_service.predict(body.type, body.amount, body.oldbalanceOrg, body.newbalanceOrig, body.oldbalanceDest, body.newbalanceDest, body.step, body.isFlaggedFraud)

@router.post("/malware/scan")
async def malware(file: UploadFile = File(...)): return malware_service.scan_file_bytes(file.filename or "upload", await file.read())

@router.post("/malware/hash")
async def malware_hash(body: HashRequest): return malware_service.scan_hash(body.hash)

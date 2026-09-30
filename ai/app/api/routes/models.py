from typing import Any
from fastapi import APIRouter, File, UploadFile
from pydantic import BaseModel
from ...services.url_feature_extractor import URLService
from ...services.financial_model_service import FinancialModelService
from ...services.malware_scanner_service import MalwareScannerService
from ...services.model_registry import registry

router = APIRouter(prefix="/models", tags=["Models"])
url_service = URLService(); financial_service = FinancialModelService(); malware_service = MalwareScannerService()

class URLRequest(BaseModel): url: str
class FinancialRequest(BaseModel):
    type: str = "TRANSFER"; amount: float = 0; oldbalanceOrg: float = 0; newbalanceOrig: float = 0; oldbalanceDest: float = 0; newbalanceDest: float = 0; step: int = 1; isFlaggedFraud: int = 0
    history: list[dict[str, Any]] = []
    account_age_days: int | None = None
    device_changed: bool = False
    geo_distance_km: float | None = None
    merchant_category: str | None = None
    device_id: str | None = None
class HashRequest(BaseModel): hash: str

@router.get("/info")
async def model_info():
    registry._models.clear()
    registry.register_defaults(url_service, financial_service, malware_service)
    return {"models": registry.all()}

@router.post("/phishing/predict")
async def phishing(body: URLRequest): return await url_service.analyze(body.url)

@router.post("/financial/predict")
async def financial(body: FinancialRequest):
    return financial_service.predict(
        body.type, body.amount, body.oldbalanceOrg, body.newbalanceOrig,
        body.oldbalanceDest, body.newbalanceDest, body.step, body.isFlaggedFraud,
        body.history, body.account_age_days, body.device_changed,
        body.geo_distance_km, body.merchant_category, body.device_id,
    )

@router.post("/malware/scan")
async def malware(file: UploadFile = File(...)): return malware_service.scan_file_bytes(file.filename or "upload", await file.read())

@router.post("/malware/hash")
async def malware_hash(body: HashRequest): return malware_service.scan_hash(body.hash)

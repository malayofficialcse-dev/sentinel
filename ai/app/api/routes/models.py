"""
AI Models Dedicated Route
=========================
Exposes direct inference endpoints for all 3 AI models:
  1. Phishing & URL Classifier (url_model.pkl - 22 features)
  2. Financial Fraud Classifier (financial_model.pkl - PaySim Random Forest)
  3. Malware & Binary Threat Scanner (static analysis + EMBER format)
  4. Models Information & Metrics (/api/models/info)
"""

from typing import Annotated, Any, Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from pydantic import BaseModel, Field

from ...services.url_feature_extractor import URLService
from ...services.financial_model_service import FinancialModelService
from ...services.malware_scanner_service import MalwareScannerService


router = APIRouter(prefix="/models", tags=["AI Models"])

# Singletons
_url_service = URLService()
_fin_service = FinancialModelService()
_malware_service = MalwareScannerService()


# ─────────────────────────────────────────────────────────────
# Request / Response Models
# ─────────────────────────────────────────────────────────────

class PhishingPredictRequest(BaseModel):
    url: str

    model_config = {
        "json_schema_extra": {
            "example": {"url": "https://bit.ly/sbi-kyc-verification-login"}
        }
    }


class FinancialPredictRequest(BaseModel):
    type: str = Field(default="TRANSFER", description="Transaction type: TRANSFER, CASH_OUT, PAYMENT, DEBIT, CASH_IN")
    amount: float = Field(default=150000.0, ge=0.0)
    oldbalanceOrg: float = Field(default=150000.0, ge=0.0, description="Initial sender account balance")
    newbalanceOrig: float = Field(default=0.0, ge=0.0, description="New sender balance after transaction")
    oldbalanceDest: float = Field(default=0.0, ge=0.0, description="Initial recipient account balance")
    newbalanceDest: float = Field(default=0.0, ge=0.0, description="New recipient balance after transaction")
    step: int = Field(default=1, ge=1, description="Simulation step / hour")
    isFlaggedFraud: int = Field(default=0, ge=0, le=1)

    model_config = {
        "json_schema_extra": {
            "example": {
                "type": "TRANSFER",
                "amount": 250000.0,
                "oldbalanceOrg": 250000.0,
                "newbalanceOrig": 0.0,
                "oldbalanceDest": 0.0,
                "newbalanceDest": 0.0,
                "step": 12,
                "isFlaggedFraud": 0
            }
        }
    }


class MalwareHashRequest(BaseModel):
    hash: str

    model_config = {
        "json_schema_extra": {
            "example": {"hash": "44d88612fea8a8f36de82e1278abb02f"}
        }
    }


# ─────────────────────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────────────────────

@router.get(
    "/info",
    summary="Get All AI Models Overview & Metrics"
)
async def get_models_info():
    """Returns status, accuracy, parameters, and metadata for all 3 AI models."""
    return {
        "models": [
            {
                "id": "phishing-url-model",
                "name": "Phishing & Malicious URL Classifier",
                "category": "Web Security / Threat Intelligence",
                "algorithm": "Gradient Boosting / Random Forest",
                "accuracy": 0.965,
                "features_count": 22,
                "input_type": "URL string",
                "status": "ACTIVE",
                "description": "Extracts 22 lexical and structural URL features to detect phishing domains, spoofed banking portals, and IP URLs.",
                "endpoint": "/api/models/phishing/predict"
            },
            {
                "id": "financial-fraud-model",
                "name": "Financial Fraud & Money Laundering Detector",
                "category": "Financial Crime & Layering",
                "algorithm": "Random Forest (PaySim Dataset)",
                "accuracy": 0.99999,
                "precision": 0.9923,
                "recall": 1.0,
                "f1_score": 0.9961,
                "training_rows": 400000,
                "input_type": "Transaction Balances & Amount",
                "status": "ACTIVE",
                "description": "Analyzes account balance shifts, cash-outs, and rapid fund dissipation across mule networks to flag fraudulent transactions.",
                "endpoint": "/api/models/financial/predict"
            },
            {
                "id": "malware-threat-model",
                "name": "Malware & Binary Threat Scanner",
                "category": "Malware & Reverse Engineering",
                "algorithm": "Static Feature Extraction & Threat Intelligence (EMBER)",
                "accuracy": 0.978,
                "feature_count": 677,
                "input_type": "Binary File Upload or MD5/SHA-256 Hash",
                "status": "ACTIVE",
                "description": "Evaluates binary headers, Shannon entropy, packed payloads, and suspicious API imports for ransomware and trojan classification.",
                "endpoint": "/api/models/malware/scan"
            }
        ]
    }


@router.post(
    "/phishing/predict",
    summary="Model 1: Phishing & Malicious URL Prediction"
)
async def predict_phishing(body: PhishingPredictRequest):
    url = body.url.strip()
    if not url:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="URL cannot be empty")
    return await _url_service.analyze(url)


@router.post(
    "/financial/predict",
    summary="Model 2: Financial Fraud Prediction (PaySim Random Forest)"
)
async def predict_financial(body: FinancialPredictRequest):
    return _fin_service.predict(
        transaction_type=body.type,
        amount=body.amount,
        oldbalance_org=body.oldbalanceOrg,
        newbalance_orig=body.newbalanceOrig,
        oldbalance_dest=body.oldbalanceDest,
        newbalance_dest=body.newbalanceDest,
        step=body.step,
        is_flagged_fraud=body.isFlaggedFraud,
    )


@router.post(
    "/malware/scan",
    summary="Model 3: Malware & Binary Threat Analysis (File Upload)"
)
async def scan_malware_file(
    file: Annotated[UploadFile, File(description="Binary or document to analyze")]
):
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty file uploaded")
    return _malware_service.scan_file_bytes(file.filename or "unknown.bin", file_bytes)


@router.post(
    "/malware/hash",
    summary="Model 3: Malware Hash Lookup"
)
async def scan_malware_hash(body: MalwareHashRequest):
    if not body.hash.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Hash cannot be empty")
    return _malware_service.scan_hash(body.hash)

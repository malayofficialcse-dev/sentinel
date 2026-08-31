"""
Health & Diagnostics Routes
===========================
GET /api/health — System health check and component readiness
"""

from fastapi import APIRouter
from ...config import settings
from ...services.ocr_service import PDF_SUPPORT, QR_SUPPORT


router = APIRouter(prefix="/health", tags=["Health"])


@router.get("", summary="Service Health & Component Capabilities")
async def health_check():
    return {
        "status": "healthy",
        "service": "sentinel-ai",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "capabilities": {
            "pdf_support": PDF_SUPPORT,
            "qr_support": QR_SUPPORT,
            "llm_configured": bool(settings.LLM_API_KEY),
            "llm_provider": settings.LLM_PROVIDER,
        }
    }

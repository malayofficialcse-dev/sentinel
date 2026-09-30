from fastapi import APIRouter
from ...services.model_registry import registry
router = APIRouter()

@router.get("/health")
async def health():
    registry.ensure_defaults()
    models = registry.all()
    unavailable = sum(1 for model in models if model.get("status") == "UNAVAILABLE")
    degraded = sum(1 for model in models if model.get("status") == "DEGRADED")
    return {
        "status": "degraded" if unavailable or degraded else "healthy",
        "service": "sentinel-ai",
        "models": {"registered": len(models), "degraded": degraded, "unavailable": unavailable},
    }

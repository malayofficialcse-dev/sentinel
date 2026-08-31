from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .api.routes import health, analysis, models


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="SENTINEL AI Investigation Engine — Automated Multi-Agent Evidence & Threat Intelligence Analysis"
)

# Enable CORS for Frontend & Backend services
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(health.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")
app.include_router(models.router, prefix="/api")


@app.get("/health", include_in_schema=False)
async def root_health():
    return {
        "status": "healthy",
        "service": "sentinel-ai",
        "version": settings.APP_VERSION
    }

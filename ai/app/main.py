from fastapi import FastAPI

from .config import settings


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "SENTINEL AI Investigation Engine"
    )
)


@app.get("/health")
async def health():

    return {
        "status": "healthy",
        "service": "sentinel-ai",
        "version": settings.APP_VERSION
    }
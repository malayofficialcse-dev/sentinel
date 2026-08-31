"""
API Dependencies
================
Shared FastAPI dependency-injected singletons for the AI service.

All services are created once at startup and reused across requests,
avoiding repeated model loading overhead.
"""

from functools import lru_cache

from ..orchestration.orchestrator import InvestigationOrchestrator
from ..services.ocr_service import OCRService
from ..services.entity_extractor import EntityExtractor
from ..services.llm_service import LLMService
from ..services.url_feature_extractor import URLService
from ..services.financial_service import FinancialService
from ..services.risk_service import RiskService


@lru_cache(maxsize=1)
def get_orchestrator() -> InvestigationOrchestrator:
    """Return the singleton investigation orchestrator."""
    return InvestigationOrchestrator()


@lru_cache(maxsize=1)
def get_ocr_service() -> OCRService:
    return OCRService()


@lru_cache(maxsize=1)
def get_entity_extractor() -> EntityExtractor:
    return EntityExtractor()


@lru_cache(maxsize=1)
def get_llm_service() -> LLMService:
    return LLMService()


@lru_cache(maxsize=1)
def get_url_service() -> URLService:
    return URLService()


@lru_cache(maxsize=1)
def get_financial_service() -> FinancialService:
    return FinancialService()


@lru_cache(maxsize=1)
def get_risk_service() -> RiskService:
    return RiskService()

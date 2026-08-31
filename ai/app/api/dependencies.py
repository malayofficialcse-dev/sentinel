from functools import lru_cache
from ..orchestration.orchestrator import InvestigationOrchestrator


@lru_cache(maxsize=1)
def get_orchestrator() -> InvestigationOrchestrator:
    return InvestigationOrchestrator()

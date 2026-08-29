from pydantic import BaseModel, Field

from .entities import Entity
from .indicators import Indicator
from .transactions import Transaction
from .findings import Finding
from .risk import RiskAssessment


class InvestigationResult(BaseModel):

    case_id: str

    entities: list[Entity] = Field(
        default_factory=list
    )

    indicators: list[Indicator] = Field(
        default_factory=list
    )

    transactions: list[Transaction] = Field(
        default_factory=list
    )

    findings: list[Finding] = Field(
        default_factory=list
    )

    risk: RiskAssessment | None = None

    narrative: str = ""

    recommendations: list[str] = Field(
        default_factory=list
    )

    next_actions: list[str] = Field(
        default_factory=list
    )
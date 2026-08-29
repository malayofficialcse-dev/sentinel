from enum import Enum
from pydantic import BaseModel, Field


class RiskLevel(str, Enum):

    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class RiskFactor(BaseModel):

    name: str

    score: float = Field(
        ge=0,
        le=100
    )

    weight: float

    contribution: float

    explanation: str

    evidence_ids: list[str] = Field(
        default_factory=list
    )


class RiskAssessment(BaseModel):

    score: float = Field(
        ge=0,
        le=100
    )

    level: RiskLevel

    factors: list[RiskFactor] = Field(
        default_factory=list
    )

    explanation: str

    confidence: float = Field(
        ge=0,
        le=1
    )
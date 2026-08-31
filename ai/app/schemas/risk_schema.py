from pydantic import BaseModel, Field


class RiskAssessment(BaseModel):
    score: float = Field(ge=0, le=100)
    level: str
    confidence: float = Field(default=0, ge=0, le=1)
    factors: dict[str, float] = Field(default_factory=dict)

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class InvestigationReport(BaseModel):

    id: Optional[str] = None

    case_id: str

    title: str

    executive_summary: str

    risk_score: float

    risk_level: str

    findings: list[str] = Field(
        default_factory=list
    )

    recommendations: list[str] = Field(
        default_factory=list
    )

    evidence_count: int = 0

    entity_count: int = 0

    generated_at: datetime
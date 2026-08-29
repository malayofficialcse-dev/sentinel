from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class Severity(str, Enum):

    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class FindingStatus(str, Enum):

    OPEN = "OPEN"
    REVIEWED = "REVIEWED"
    CONFIRMED = "CONFIRMED"
    DISMISSED = "DISMISSED"


class Finding(BaseModel):

    id: Optional[str] = None

    case_id: str

    evidence_id: Optional[str] = None

    finding_type: str

    title: str

    description: str

    severity: Severity

    confidence: float = Field(
        ge=0.0,
        le=1.0
    )

    source: str

    status: FindingStatus = FindingStatus.OPEN

    supporting_entities: list[str] = Field(
        default_factory=list
    )

    supporting_indicators: list[str] = Field(
        default_factory=list
    )
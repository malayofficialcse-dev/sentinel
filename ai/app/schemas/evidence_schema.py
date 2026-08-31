from typing import Any
from pydantic import BaseModel, Field


class EvidenceInput(BaseModel):
    case_id: str
    evidence: list[dict[str, Any]] = Field(default_factory=list)
    entities: list[dict[str, Any]] = Field(default_factory=list)
    transactions: list[dict[str, Any]] = Field(default_factory=list)
    indicators: list[dict[str, Any]] = Field(default_factory=list)

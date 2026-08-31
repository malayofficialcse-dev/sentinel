from typing import Any
from pydantic import BaseModel, Field


class InvestigationAnalysis(BaseModel):
    agent: str = "investigation-agent"
    status: str
    case_summary: str = ""
    risk_level: str = "LOW"
    risk_score: float = Field(default=0, ge=0, le=100)
    key_entities: list[dict[str, Any]] = Field(default_factory=list)
    key_indicators: list[dict[str, Any]] = Field(default_factory=list)
    timeline: list[dict[str, Any]] = Field(default_factory=list)
    findings: list[dict[str, Any]] = Field(default_factory=list)
    graph_findings: list[dict[str, Any]] = Field(default_factory=list)
    financial_findings: list[dict[str, Any]] = Field(default_factory=list)
    threat_findings: list[dict[str, Any]] = Field(default_factory=list)
    recommended_actions: list[str] = Field(default_factory=list)
    confidence: float = Field(default=0, ge=0, le=1)
    error: str | None = None

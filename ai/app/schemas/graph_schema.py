from typing import Any
from pydantic import BaseModel, Field


class GraphNode(BaseModel):
    id: str
    type: str
    value: str
    metadata: dict[str, Any] = Field(default_factory=dict)


class GraphEdge(BaseModel):
    source: str
    target: str
    type: str = "RELATED_TO"
    confidence: float = Field(default=1.0, ge=0, le=1)
    evidence_id: str | None = None


class GraphAnalysis(BaseModel):
    agent: str = "graph-agent"
    status: str
    nodes: list[GraphNode] = Field(default_factory=list)
    edges: list[GraphEdge] = Field(default_factory=list)
    clusters: list[dict[str, Any]] = Field(default_factory=list)
    suspicious_entities: list[dict[str, Any]] = Field(default_factory=list)
    metrics: dict[str, Any] = Field(default_factory=dict)
    risk_score: float = Field(default=0, ge=0, le=100)
    findings: list[dict[str, Any]] = Field(default_factory=list)
    error: str | None = None

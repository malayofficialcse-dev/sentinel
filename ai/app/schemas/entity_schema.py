from typing import Any
from pydantic import BaseModel, Field


class Entity(BaseModel):
    id: str | None = None
    entity_type: str = "UNKNOWN"
    type: str | None = None
    value: str
    normalized_value: str | None = None
    confidence: float = Field(default=1, ge=0, le=1)
    metadata: dict[str, Any] = Field(default_factory=dict)

from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class EntityType(str, Enum):

    PERSON = "PERSON"
    PHONE = "PHONE"
    EMAIL = "EMAIL"
    URL = "URL"
    DOMAIN = "DOMAIN"
    IP = "IP"
    UPI = "UPI"
    BANK_ACCOUNT = "BANK_ACCOUNT"
    WALLET = "WALLET"
    TRANSACTION = "TRANSACTION"
    ORGANIZATION = "ORGANIZATION"
    LOCATION = "LOCATION"
    UNKNOWN = "UNKNOWN"


class Entity(BaseModel):

    id: Optional[str] = None

    case_id: str

    evidence_id: Optional[str] = None

    entity_type: EntityType

    value: str

    normalized_value: Optional[str] = None

    confidence: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0
    )

    metadata: dict = Field(
        default_factory=dict
    )
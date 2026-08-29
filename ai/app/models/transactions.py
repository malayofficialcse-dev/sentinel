from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


class Transaction(BaseModel):

    id: Optional[str] = None

    case_id: str

    from_entity_id: Optional[str] = None

    to_entity_id: Optional[str] = None

    amount: Decimal

    currency: str = "INR"

    timestamp: datetime

    beneficiary: Optional[str] = None

    transaction_type: Optional[str] = None

    reference: Optional[str] = None

    metadata: dict = Field(
        default_factory=dict
    )
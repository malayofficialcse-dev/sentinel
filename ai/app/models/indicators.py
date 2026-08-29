from enum import Enum
from pydantic import BaseModel, Field


class IndicatorType(str, Enum):

    PHISHING_URL = "PHISHING_URL"

    SUSPICIOUS_DOMAIN = "SUSPICIOUS_DOMAIN"

    IMPERSONATION = "IMPERSONATION"

    URGENCY_LANGUAGE = "URGENCY_LANGUAGE"

    SUSPICIOUS_PHONE = "SUSPICIOUS_PHONE"

    SUSPICIOUS_EMAIL = "SUSPICIOUS_EMAIL"

    MALICIOUS_IP = "MALICIOUS_IP"

    UNUSUAL_TRANSACTION = "UNUSUAL_TRANSACTION"

    RAPID_FUND_MOVEMENT = "RAPID_FUND_MOVEMENT"

    NEW_BENEFICIARY = "NEW_BENEFICIARY"

    UNKNOWN = "UNKNOWN"


class Indicator(BaseModel):

    type: IndicatorType

    value: str

    description: str

    severity: str = "MEDIUM"

    confidence: float = Field(
        ge=0.0,
        le=1.0
    )

    source: str
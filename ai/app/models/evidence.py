from enum import Enum
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class EvidenceType(str, Enum):
    IMAGE = "IMAGE"
    PDF = "PDF"
    DOCUMENT = "DOCUMENT"
    URL = "URL"
    QR_CODE = "QR_CODE"
    TEXT = "TEXT"
    TRANSACTION = "TRANSACTION"
    VIDEO = "VIDEO"


class ProcessingStatus(str, Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class Evidence(BaseModel):

    id: str

    case_id: str

    evidence_type: EvidenceType

    filename: Optional[str] = None

    source_url: Optional[str] = None

    mime_type: Optional[str] = None

    file_size: Optional[int] = None

    sha256: Optional[str] = None

    extracted_text: Optional[str] = None

    processing_status: ProcessingStatus = (
        ProcessingStatus.PENDING
    )

    metadata: dict = Field(default_factory=dict)

    created_at: datetime
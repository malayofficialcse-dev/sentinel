from typing import TypedDict, Any


class InvestigationState(TypedDict, total=False):

    case_id: str

    evidence: dict[str, Any]

    extracted_text: str

    entities: list[dict[str, Any]]

    indicators: list[dict[str, Any]]

    transactions: list[dict[str, Any]]

    threat_indicators: list[dict[str, Any]]

    financial_findings: list[dict[str, Any]]

    relationships: list[dict[str, Any]]

    investigation: dict[str, Any]

    risk: dict[str, Any]

    recommendations: list[str]
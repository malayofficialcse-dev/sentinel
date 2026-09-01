from typing import Any
from .base_agent import BaseAgent
from ..services.graph_service import GraphService


class GraphAgent(BaseAgent):
    name = "graph-agent"

    def __init__(self, service: GraphService | None = None):
        self.service = service or GraphService()

    async def run(self, state: dict[str, Any]) -> dict[str, Any]:
        try:
            entities = list(state.get("entities", []))
            relationships = list(state.get("relationships", []))
            transactions = list(state.get("transactions", []))
            case_id = state.get("case_id", "current_case")

            # 1. Map transactions to graph nodes & edges
            for txn in transactions:
                amount = txn.get("amount")
                sender = txn.get("sender") or "Source Account"
                receiver = txn.get("receiver") or "Beneficiary Account"
                ref = txn.get("reference") or f"TXN-₹{amount}"

                # Add Transaction node if not present
                txn_node_val = ref
                entities.append({
                    "entity_type": "TRANSACTION",
                    "value": txn_node_val,
                    "normalized_value": txn_node_val,
                    "confidence": 1.0,
                    "source": "ocr"
                })

                # Sender -> Transaction
                relationships.append({
                    "source": f"PERSON:{sender}" if "@" not in sender else f"UPI:{sender}",
                    "target": f"TRANSACTION:{txn_node_val}",
                    "type": "INITIATED_PAYMENT",
                    "confidence": 0.95,
                    "reason": f"Payment of ₹{amount} initiated",
                    "evidence_id": case_id
                })

                # Transaction -> Receiver
                receiver_type = "UPI" if "@" in receiver else ("PHONE" if receiver.isdigit() else "PERSON")
                relationships.append({
                    "source": f"TRANSACTION:{txn_node_val}",
                    "target": f"{receiver_type}:{receiver}",
                    "type": "TRANSFERRED_FUNDS",
                    "confidence": 0.95,
                    "reason": f"Funds routed to {receiver}",
                    "evidence_id": case_id
                })

            # 2. Correlate co-occurring entities within the evidence and across files
            upis = [e for e in entities if e.get("entity_type") in {"UPI", "VPA"}]
            phones = [e for e in entities if e.get("entity_type") == "PHONE"]
            persons = [e for e in entities if e.get("entity_type") == "PERSON"]
            bank_accs = [e for e in entities if e.get("entity_type") == "BANK_ACCOUNT"]
            ifscs = [e for e in entities if e.get("entity_type") == "IFSC"]
            txn_ids = [e for e in entities if e.get("entity_type") == "TRANSACTION_ID"]
            urls = [e for e in entities if e.get("entity_type") in {"URL", "DOMAIN"}]
            ips = [e for e in entities if e.get("entity_type") == "IP"]
            emails = [e for e in entities if e.get("entity_type") == "EMAIL"]

            # Person -> UPI / VPA
            for p in persons:
                for u in upis:
                    relationships.append({
                        "source": f"PERSON:{p['value']}",
                        "target": f"{u.get('entity_type', 'UPI')}:{u['value']}",
                        "type": "ASSOCIATED_PAYMENT_HANDLE",
                        "confidence": 0.90,
                        "reason": "Name associated with payment handle",
                        "evidence_id": case_id
                    })
                for ph in phones:
                    relationships.append({
                        "source": f"PERSON:{p['value']}",
                        "target": f"PHONE:{ph['value']}",
                        "type": "OWNED_PHONE",
                        "confidence": 0.92,
                        "reason": "Contact number linked to identity",
                        "evidence_id": case_id
                    })

            # Phone -> UPI / VPA
            for ph in phones:
                for u in upis:
                    relationships.append({
                        "source": f"PHONE:{ph['value']}",
                        "target": f"{u.get('entity_type', 'UPI')}:{u['value']}",
                        "type": "LINKED_PHONE",
                        "confidence": 0.92,
                        "reason": "Mobile number linked to virtual payment handle",
                        "evidence_id": case_id
                    })
                for b in bank_accs:
                    relationships.append({
                        "source": f"PHONE:{ph['value']}",
                        "target": f"BANK_ACCOUNT:{b['value']}",
                        "type": "REGISTERED_ACCOUNT",
                        "confidence": 0.88,
                        "reason": "Phone associated with banking alerts",
                        "evidence_id": case_id
                    })

            # Bank Account -> VPA / UPI
            for b in bank_accs:
                for u in upis:
                    relationships.append({
                        "source": f"BANK_ACCOUNT:{b['value']}",
                        "target": f"{u.get('entity_type', 'UPI')}:{u['value']}",
                        "type": "LINKED_VPA",
                        "confidence": 0.95,
                        "reason": "Bank account linked to Virtual Payment Address",
                        "evidence_id": case_id
                    })
                for ifsc in ifscs:
                    relationships.append({
                        "source": f"BANK_ACCOUNT:{b['value']}",
                        "target": f"IFSC:{ifsc['value']}",
                        "type": "HELD_AT_BRANCH",
                        "confidence": 0.98,
                        "reason": "Account branch routing code",
                        "evidence_id": case_id
                    })

            # Transaction IDs -> Bank / UPI / VPA
            for tid in txn_ids:
                for u in upis:
                    relationships.append({
                        "source": f"TRANSACTION_ID:{tid['value']}",
                        "target": f"{u.get('entity_type', 'UPI')}:{u['value']}",
                        "type": "REFERENCE_HANDLE",
                        "confidence": 0.95,
                        "reason": "Transaction reference linked to payment handle",
                        "evidence_id": case_id
                    })
                for b in bank_accs:
                    relationships.append({
                        "source": f"TRANSACTION_ID:{tid['value']}",
                        "target": f"BANK_ACCOUNT:{b['value']}",
                        "type": "CREDITED_ACCOUNT",
                        "confidence": 0.95,
                        "reason": "Transaction settled in bank account",
                        "evidence_id": case_id
                    })

            # URL -> IP
            for u in urls:
                for ip in ips:
                    relationships.append({
                        "source": f"URL:{u['value']}",
                        "target": f"IP:{ip['value']}",
                        "type": "RESOLVES_TO",
                        "confidence": 0.92,
                        "reason": "Host domain DNS resolution",
                        "evidence_id": case_id
                    })

            # Email -> UPI / Person
            for em in emails:
                for p in persons:
                    relationships.append({
                        "source": f"PERSON:{p['value']}",
                        "target": f"EMAIL:{em['value']}",
                        "type": "REGISTERED_EMAIL",
                        "confidence": 0.90,
                        "reason": "Contact email address",
                        "evidence_id": case_id
                    })

            # De-duplicate entities by type + value
            unique_entities = []
            seen_ent = set()
            for e in entities:
                k = (e.get("entity_type"), e.get("normalized_value") or e.get("value"))
                if k not in seen_ent and k[1]:
                    seen_ent.add(k)
                    unique_entities.append(e)

            graph_data = self.service.analyze(unique_entities, relationships)
            return {
                "graph": graph_data,
                "entities": unique_entities,
                "relationships": relationships
            }
        except Exception as exc:
            return {
                "graph": {
                    "agent": self.name,
                    "status": "failed",
                    "error": str(exc),
                    "nodes": [],
                    "edges": [],
                    "clusters": [],
                    "suspicious_entities": [],
                    "metrics": {},
                    "risk_score": 0,
                    "findings": []
                }
            }

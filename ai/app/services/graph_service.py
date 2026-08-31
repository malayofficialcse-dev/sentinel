from __future__ import annotations
from collections import Counter, defaultdict, deque
import re
from typing import Any


class GraphService:
    """Database-independent graph analysis; Neo4j can consume this contract later."""

    def analyze(self, entities: list[dict[str, Any]], relationships: list[dict[str, Any]]) -> dict[str, Any]:
        nodes_by_key: dict[tuple[str, str], dict[str, Any]] = {}
        aliases: dict[str, str] = {}

        def canonical(item: dict[str, Any]) -> tuple[str, str]:
            kind = str(item.get("entity_type") or item.get("type") or "UNKNOWN").upper()
            value = str(item.get("normalized_value") or item.get("normalizedValue") or item.get("value") or "").strip()
            if kind in {"EMAIL", "UPI"}:
                value = value.lower()
            if kind == "PHONE":
                value = re.sub(r"\D", "", value)
            return kind, value

        # 1. Register explicit entities
        for item in entities or []:
            kind, value = canonical(item)
            if not value:
                continue
            canonical_key = (kind, value.lower())
            node = nodes_by_key.setdefault(canonical_key, {
                "id": f"{kind}:{value}",
                "type": kind,
                "value": value,
                "metadata": {}
            })
            node["metadata"]["confidence"] = max(float(node["metadata"].get("confidence", 0)), float(item.get("confidence", 1)))
            
            # Map aliases
            node_id = node["id"]
            aliases[str(item.get("id") or "")] = node_id
            aliases[str(item.get("value") or "")] = node_id
            aliases[str(item.get("value") or "").lower()] = node_id
            aliases[value] = node_id
            aliases[value.lower()] = node_id
            aliases[node_id] = node_id
            aliases[node_id.lower()] = node_id

        # 2. Extract and resolve relationship edges
        edges: dict[tuple[str, str, str], dict[str, Any]] = {}
        for rel in relationships or []:
            src_raw = str(rel.get("source") or rel.get("sourceEntity") or rel.get("source_id") or "").strip()
            tgt_raw = str(rel.get("target") or rel.get("targetEntity") or rel.get("target_id") or "").strip()
            if not src_raw or not tgt_raw:
                continue

            # Resolve source
            source = aliases.get(src_raw) or aliases.get(src_raw.lower())
            if not source:
                # Auto-create source node if missing
                parts = src_raw.split(":", 1)
                kind = parts[0].upper() if len(parts) == 2 else "ENTITY"
                val = parts[1] if len(parts) == 2 else parts[0]
                node_id = f"{kind}:{val}"
                nodes_by_key[(kind, val.lower())] = {"id": node_id, "type": kind, "value": val, "metadata": {"confidence": 0.9}}
                aliases[src_raw] = node_id
                aliases[src_raw.lower()] = node_id
                aliases[val] = node_id
                aliases[val.lower()] = node_id
                source = node_id

            # Resolve target
            target = aliases.get(tgt_raw) or aliases.get(tgt_raw.lower())
            if not target:
                # Auto-create target node if missing
                parts = tgt_raw.split(":", 1)
                kind = parts[0].upper() if len(parts) == 2 else "ENTITY"
                val = parts[1] if len(parts) == 2 else parts[0]
                node_id = f"{kind}:{val}"
                nodes_by_key[(kind, val.lower())] = {"id": node_id, "type": kind, "value": val, "metadata": {"confidence": 0.9}}
                aliases[tgt_raw] = node_id
                aliases[tgt_raw.lower()] = node_id
                aliases[val] = node_id
                aliases[val.lower()] = node_id
                target = node_id

            if source == target:
                continue

            typ = str(rel.get("type") or rel.get("relationshipType") or "RELATED_TO").upper()
            edges[(source, target, typ)] = {
                "source": source,
                "target": target,
                "type": typ,
                "confidence": float(rel.get("confidence", 1)),
                "evidence_id": rel.get("evidenceId") or rel.get("evidence_id")
            }

        # 3. Analyze graph connectivity & clusters
        adjacency: dict[str, set[str]] = defaultdict(set)
        degree = Counter()
        for edge in edges.values():
            adjacency[edge["source"]].add(edge["target"])
            adjacency[edge["target"]].add(edge["source"])
            degree[edge["source"]] += 1
            degree[edge["target"]] += 1

        clusters = []
        unseen = set(nodes_by_key)
        while unseen:
            key = unseen.pop()
            node_id = nodes_by_key[key]["id"]
            queue = deque([node_id])
            ids = {node_id}
            while queue:
                curr = queue.popleft()
                for neighbor in adjacency.get(curr, set()):
                    if neighbor not in ids:
                        ids.add(neighbor)
                        queue.append(neighbor)
            unseen -= {k for k, n in nodes_by_key.items() if n["id"] in ids}
            clusters.append({
                "id": f"cluster-{len(clusters)+1}",
                "node_ids": sorted(ids),
                "size": len(ids),
                "suspicious": len(ids) >= 3
            })

        suspicious = [
            {
                "node_id": n["id"],
                "reason": "Highly connected entity",
                "degree": degree[n["id"]],
                "risk": min(100, 45 + degree[n["id"]] * 10)
            }
            for n in nodes_by_key.values()
            if degree[n["id"]] >= 2
        ]

        repeated = [
            {"source": s, "target": t, "count": c}
            for (s, t), c in Counter((e["source"], e["target"]) for e in edges.values() if "TRANSACTION" in e["type"]).items()
            if c > 1
        ]

        findings = []
        if len(nodes_by_key) >= 2 and edges:
            findings.append({
                "type": "NETWORK_MAPPED",
                "message": f"Entity correlation network constructed with {len(nodes_by_key)} nodes and {len(edges)} relations"
            })
        if suspicious:
            findings.append({
                "type": "HIGH_CONNECTIVITY",
                "message": f"{len(suspicious)} central hub entities identified in transaction path"
            })

        score = min(100, len(suspicious) * 12 + len(repeated) * 15 + min(30, len(edges) * 5))

        return {
            "agent": "graph-agent",
            "status": "completed",
            "nodes": list(nodes_by_key.values()),
            "edges": list(edges.values()),
            "clusters": clusters,
            "suspicious_entities": suspicious,
            "metrics": {
                "node_count": len(nodes_by_key),
                "edge_count": len(edges),
                "cluster_count": len(clusters),
                "max_degree": max(degree.values(), default=0),
                "repeated_transaction_paths": len(repeated)
            },
            "risk_score": score,
            "findings": findings
        }

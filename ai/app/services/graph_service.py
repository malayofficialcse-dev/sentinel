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
            if kind in {"EMAIL", "UPI"}: value = value.lower()
            if kind == "PHONE": value = re.sub(r"\D", "", value)
            return kind, value.lower()

        for item in entities or []:
            kind, value = canonical(item)
            if not value: continue
            node = nodes_by_key.setdefault((kind, value), {"id": f"{kind}:{value}", "type": kind, "value": value, "metadata": {}})
            node["metadata"]["confidence"] = max(float(node["metadata"].get("confidence", 0)), float(item.get("confidence", 1)))
            aliases[str(item.get("id") or item.get("value") or value)] = node["id"]

        edges: dict[tuple[str, str, str], dict[str, Any]] = {}
        for rel in relationships or []:
            source = aliases.get(str(rel.get("source") or rel.get("sourceEntity") or rel.get("source_id") or ""))
            target = aliases.get(str(rel.get("target") or rel.get("targetEntity") or rel.get("target_id") or ""))
            if not source or not target: continue
            typ = str(rel.get("type") or rel.get("relationshipType") or "RELATED_TO").upper()
            edges[(source, target, typ)] = {"source": source, "target": target, "type": typ, "confidence": float(rel.get("confidence", 1)), "evidence_id": rel.get("evidenceId") or rel.get("evidence_id")}

        adjacency: dict[str, set[str]] = defaultdict(set); degree = Counter()
        for edge in edges.values():
            adjacency[edge["source"]].add(edge["target"]); adjacency[edge["target"]].add(edge["source"])
            degree[edge["source"]] += 1; degree[edge["target"]] += 1
        clusters = []; unseen = set(nodes_by_key)
        while unseen:
            key = unseen.pop(); node_id = nodes_by_key[key]["id"]; queue = deque([node_id]); ids = {node_id}
            while queue:
                for neighbor in adjacency.get(queue.popleft(), set()):
                    if neighbor not in ids: ids.add(neighbor); queue.append(neighbor)
            unseen -= {k for k, n in nodes_by_key.items() if n["id"] in ids}
            clusters.append({"id": f"cluster-{len(clusters)+1}", "node_ids": sorted(ids), "size": len(ids), "suspicious": len(ids) >= 3})
        suspicious = [{"node_id": n["id"], "reason": "Highly connected entity", "degree": degree[n["id"]], "risk": min(100, 45 + degree[n["id"]] * 10)} for n in nodes_by_key.values() if degree[n["id"]] >= 3]
        repeated = [{"source": s, "target": t, "count": c} for (s, t), c in Counter((e["source"], e["target"]) for e in edges.values() if "TRANSACTION" in e["type"]).items() if c > 1]
        mule = [x for x in suspicious if any(n["id"] == x["node_id"] and n["type"] in {"BANK_ACCOUNT", "UPI", "PHONE"} for n in nodes_by_key.values())]
        findings = []
        if suspicious: findings.append({"type": "HIGH_CONNECTIVITY", "message": f"{len(suspicious)} highly connected entities detected"})
        if repeated: findings.append({"type": "REPEATED_PATH", "message": f"{len(repeated)} repeated transaction paths detected", "paths": repeated})
        if mule: findings.append({"type": "POSSIBLE_MULE", "message": "Payment entities show mule-like connectivity", "entities": mule})
        score = min(100, len(suspicious) * 12 + len(repeated) * 15 + len(mule) * 10)
        return {"agent": "graph-agent", "status": "completed", "nodes": list(nodes_by_key.values()), "edges": list(edges.values()), "clusters": clusters, "suspicious_entities": suspicious, "metrics": {"node_count": len(nodes_by_key), "edge_count": len(edges), "cluster_count": len(clusters), "max_degree": max(degree.values(), default=0), "repeated_transaction_paths": len(repeated)}, "risk_score": score, "findings": findings}

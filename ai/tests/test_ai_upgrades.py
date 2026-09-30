import unittest

from app.services.entity_resolution import EntityResolutionService
from app.services.embedding_service import EmbeddingService
from app.services.graph_algorithms import GraphAlgorithms
from app.services.model_evaluation import evaluate_binary
from app.services.semantic_search import SemanticSearch
from app.services.investigator_copilot import InvestigatorCopilot
from app.services.risk_service import RiskService


class AIUpgradeTests(unittest.TestCase):
    def test_risk_returns_versioned_contributions(self):
        result = RiskService().calculate(80, 60, 20, 40, 70)
        self.assertEqual(result["model_version"], "risk-v2.0")
        self.assertAlmostEqual(sum(result["factor_contributions"].values()), result["score"], places=2)

    def test_entity_resolution_preserves_aliases(self):
        result = EntityResolutionService().resolve([
            {"entity_type": "EMAIL", "value": "Analyst@Example.com"},
            {"entity_type": "EMAIL", "value": "analyst@example.com"},
        ])
        self.assertEqual(len(result["entities"]), 1)
        self.assertEqual(result["merged_count"], 1)

    def test_copilot_cites_graph_and_risk(self):
        result = InvestigatorCopilot().answer("Why is this case risky and connected?", {
            "entities": [{"value": "abc@upi", "entity_type": "UPI", "confidence": 0.9}],
            "graph": {"nodes": [{"id": "UPI:abc@upi"}], "edges": [], "clusters": [], "metrics": {"node_count": 1}},
            "risk": {"score": 82, "level": "HIGH", "model_version": "risk-v2.0", "factor_contributions": {"threat": 20}},
        })
        self.assertTrue(result.citations)
        self.assertIn("HIGH", result.answer)

    def test_semantic_search_is_case_scoped(self):
        index = SemanticSearch(EmbeddingService(dimensions=32))
        index.index(document_id="a", case_id="case-a", text="UPI payment to abc@upi")
        index.index(document_id="b", case_id="case-b", text="malware powershell payload")
        results = index.query(case_id="case-a", text="payment UPI", limit=5)
        self.assertEqual([item["document_id"] for item in results], ["a"])

    def test_graph_algorithms_find_rank_and_hidden_link(self):
        nodes = [{"id": "a"}, {"id": "b"}, {"id": "c"}]
        edges = [{"source": "a", "target": "b"}, {"source": "a", "target": "c"}]
        algorithms = GraphAlgorithms()
        self.assertAlmostEqual(sum(algorithms.pagerank(nodes, edges).values()), 1.0, places=3)
        predictions = algorithms.link_predictions(nodes, edges)
        self.assertEqual((predictions[0]["source"], predictions[0]["target"]), ("b", "c"))

    def test_model_evaluation_emits_promotion_metadata(self):
        result = evaluate_binary([0, 1, 1, 0], [0.1, 0.9, 0.8, 0.2], model_id="test", dataset="fixture", version="1")
        self.assertEqual(result["f1"], 1.0)
        self.assertTrue(result["promotion_candidate"])


if __name__ == "__main__":
    unittest.main()

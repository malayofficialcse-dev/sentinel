import asyncio
import unittest

from app.agents.graph_agent import GraphAgent
from app.agents.investigation_agent import InvestigationAgent
from app.services.graph_service import GraphService


class GraphServiceTests(unittest.TestCase):
    def test_duplicate_entities_are_normalized(self):
        result = GraphService().analyze(
            [{"type": "EMAIL", "value": "A@Example.com"}, {"type": "EMAIL", "value": "a@example.com"}], []
        )
        self.assertEqual(result["metrics"]["node_count"], 1)

    def test_empty_graph(self):
        result = asyncio.run(GraphAgent().run({"entities": [], "relationships": []}))
        self.assertEqual(result["graph"]["status"], "completed")
        self.assertEqual(result["graph"]["metrics"]["edge_count"], 0)

    def test_relationship_and_connectivity_finding(self):
        entities = [{"type": "PERSON", "value": "p"}, {"type": "UPI", "value": "p@bank"}, {"type": "PHONE", "value": "9876543210"}, {"type": "BANK_ACCOUNT", "value": "123456789"}]
        relationships = [{"source": "p", "target": "p@bank", "type": "PERSON_UPI"}, {"source": "p", "target": "9876543210", "type": "PERSON_PHONE"}, {"source": "p", "target": "123456789", "type": "PERSON_ACCOUNT"}]
        result = GraphService().analyze(entities, relationships)
        self.assertEqual(result["metrics"]["edge_count"], 3)
        self.assertTrue(result["findings"])


class InvestigationAgentTests(unittest.TestCase):
    def test_missing_inputs_are_safe(self):
        result = asyncio.run(InvestigationAgent().run({}))
        self.assertEqual(result["investigation"]["status"], "completed")
        self.assertEqual(result["investigation"]["risk_level"], "LOW")

    def test_distinguishes_model_and_inferred_findings(self):
        result = asyncio.run(InvestigationAgent().run({"entities": [{"type": "URL", "value": "x"}], "threat_indicators": [{"severity": "HIGH"}], "graph": {"risk_score": 50, "findings": [{"type": "POSSIBLE_MULE"}]}}))
        kinds = {item["type"] for item in result["investigation"]["findings"]}
        self.assertIn("MODEL_PREDICTION", kinds)
        self.assertIn("INFERRED_RELATIONSHIP", kinds)


if __name__ == "__main__":
    unittest.main()

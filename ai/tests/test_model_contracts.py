import asyncio
import unittest

from app.services.financial_model_service import FinancialModelService
from app.services.url_feature_extractor import URLService


class ModelContractTests(unittest.TestCase):
    def test_local_url_is_not_classified_as_public_phishing(self):
        result = asyncio.run(URLService().analyze("http://localhost:5175/test"))
        self.assertEqual(result["decision"], "LEGITIMATE")
        self.assertEqual(result["operational_risk"]["score"], 0.0)
        self.assertTrue("model_probability" in result)
        self.assertTrue("evidence_risk" in result)

    def test_financial_behavior_context_changes_operational_output(self):
        result = FinancialModelService().predict(
            "PAYMENT", 1000, 25000, 24000, 100000, 101000,
            history=[
                {"amount": 80000, "hours_ago": 0.2, "new_beneficiary": True},
                {"amount": 70000, "hours_ago": 0.5},
                {"amount": 60000, "hours_ago": 0.8},
                {"amount": 50000, "hours_ago": 0.9},
            ],
            account_age_days=10,
            device_changed=True,
            geo_distance_km=900,
        )
        self.assertIn("behavior_probability", result)
        self.assertIn("operational_probability", result)
        self.assertTrue(result["behavior_features"]["transactions_last_hour"] >= 4)
        self.assertTrue(result["reasons"])


if __name__ == "__main__":
    unittest.main()

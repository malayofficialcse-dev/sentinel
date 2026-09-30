import unittest

from app.services.entity_extractor import EntityExtractor


class EntityExtractorTests(unittest.TestCase):
    def test_extracts_only_values_present_in_ocr_text(self):
        result = EntityExtractor().extract(
            "Pay INR 1,200 to abc@upi. UTR ABC123456. Visit https://example.com."
        )
        values = {(item["entity_type"], item["normalized_value"]) for item in result["entities"]}
        self.assertIn(("UPI", "abc@upi"), values)
        self.assertIn(("URL", "https://example.com"), values)
        self.assertIn(("TRANSACTION_ID", "ABC123456"), values)
        self.assertEqual(result["transactions"][0]["amount"], 1200.0)
        self.assertEqual(result["transactions"][0]["receiver"], "abc@upi")

    def test_empty_text_has_no_entities_or_transactions(self):
        self.assertEqual(EntityExtractor().extract(""), {"entities": [], "transactions": []})

    def test_extracted_amounts_are_valid_structured_entities(self):
        from app.schemas.ai_contracts import StructuredEvidence

        extracted = EntityExtractor().extract("Paid INR 45,000 to abc@upi on 12/09/2026.")
        result = StructuredEvidence(entities=extracted["entities"], transactions=extracted["transactions"])

        self.assertTrue(any(item.entity_type == "AMOUNT" for item in result.entities))
        self.assertEqual(result.transactions[0].amount, 45000.0)

    def test_unknown_extractor_types_are_safe(self):
        from app.services.provider_router import _safe_deterministic_entities

        entities, warnings = _safe_deterministic_entities([{
            "entity_type": "NEW_RULE_TYPE",
            "value": "example",
            "confidence": 0.8,
        }])

        self.assertEqual(entities[0]["entity_type"], "UNKNOWN")
        self.assertTrue(warnings)


if __name__ == "__main__":
    unittest.main()

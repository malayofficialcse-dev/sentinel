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


if __name__ == "__main__":
    unittest.main()

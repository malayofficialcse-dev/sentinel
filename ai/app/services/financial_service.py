from decimal import Decimal


class FinancialService:

    async def analyze(
        self,
        transactions: list[dict]
    ) -> list[dict]:

        findings = []

        for transaction in transactions:

            amount = Decimal(
                str(transaction.get(
                    "amount",
                    0
                ))
            )

            if amount >= 100000:

                findings.append({
                    "type": "HIGH_VALUE_TRANSACTION",
                    "amount": float(amount),
                    "severity": "HIGH",
                    "description":
                        "Transaction exceeds the configured high-value threshold."
                })

        return findings
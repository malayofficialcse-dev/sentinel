"""
Financial Service
=================
Analyzes extracted transactions for fraud patterns.

Detection rules:
  1. HIGH_VALUE_TRANSACTION     — single transaction ≥ ₹1,00,000
  2. STRUCTURING                — multiple transactions just below ₹50,000
                                  (classic structuring / smurfing pattern)
  3. RAPID_FUND_MOVEMENT        — many transactions detected in one screenshot
  4. ROUND_AMOUNT_SUSPICION     — suspiciously round large amounts (₹10,000 exact)
  5. UPI_FRAUD_PATTERN          — transaction to a UPI ID with suspicious features
"""

from decimal import Decimal


class FinancialService:
    """
    Analyze a list of transaction dicts for financial fraud patterns.

    Each transaction dict should contain at minimum:
        amount   : numeric value (int/float/str)
        sender   : sender name or ID (optional)
        receiver : receiver name or ID (optional)
        reference: transaction reference (optional)
    """

    # ── Thresholds ────────────────────────────────────────────
    HIGH_VALUE_THRESHOLD = Decimal("100000")     # ₹1,00,000
    STRUCTURING_THRESHOLD = Decimal("49000")     # just below ₹50K (CTR limit)
    STRUCTURING_MIN_COUNT = 3                    # at least 3 such transactions
    RAPID_MOVEMENT_MIN = 5                       # 5+ transactions = rapid
    ROUND_AMOUNT_MULTIPLES = [10000, 5000, 2000, 1000]

    # ─────────────────────────────────────────────────────────
    # Public interface
    # ─────────────────────────────────────────────────────────

    async def analyze(
        self,
        transactions: list[dict]
    ) -> list[dict]:
        """
        Run all detection rules and return a list of findings.

        Parameters
        ----------
        transactions:
            List of transaction dicts extracted from evidence.

        Returns
        -------
        List of finding dicts with keys:
            type, description, severity, amount (optional), confidence
        """
        if not transactions:
            return []

        findings: list[dict] = []

        amounts = [
            Decimal(str(txn.get("amount", 0)))
            for txn in transactions
        ]

        # Rule 1 — High value
        findings.extend(
            self._check_high_value(transactions, amounts)
        )

        # Rule 2 — Structuring
        findings.extend(
            self._check_structuring(transactions, amounts)
        )

        # Rule 3 — Rapid fund movement
        findings.extend(
            self._check_rapid_movement(transactions)
        )

        # Rule 4 — Suspiciously round amounts
        findings.extend(
            self._check_round_amounts(transactions, amounts)
        )

        # Rule 5 — Duplicate receivers (fan-out pattern)
        findings.extend(
            self._check_fan_out(transactions)
        )

        return findings

    # ─────────────────────────────────────────────────────────
    # Detection rules
    # ─────────────────────────────────────────────────────────

    def _check_high_value(
        self,
        transactions: list[dict],
        amounts: list[Decimal]
    ) -> list[dict]:
        findings = []
        for txn, amount in zip(transactions, amounts):
            if amount >= self.HIGH_VALUE_THRESHOLD:
                findings.append({
                    "type": "HIGH_VALUE_TRANSACTION",
                    "severity": "HIGH",
                    "confidence": 0.90,
                    "amount": float(amount),
                    "description": (
                        f"Transaction of ₹{amount:,} exceeds the "
                        f"high-value threshold of "
                        f"₹{self.HIGH_VALUE_THRESHOLD:,}. "
                        f"Receiver: {txn.get('receiver', 'Unknown')}."
                    )
                })
        return findings

    def _check_structuring(
        self,
        transactions: list[dict],
        amounts: list[Decimal]
    ) -> list[dict]:
        """
        Detect structuring: multiple transactions just below ₹50,000
        to avoid Cash Transaction Report (CTR) thresholds.
        """
        near_threshold = [
            (txn, amt)
            for txn, amt in zip(transactions, amounts)
            if Decimal("45000") <= amt < Decimal("50000")
        ]
        if len(near_threshold) >= self.STRUCTURING_MIN_COUNT:
            total = sum(amt for _, amt in near_threshold)
            return [{
                "type": "STRUCTURING",
                "severity": "CRITICAL",
                "confidence": 0.85,
                "amount": float(total),
                "description": (
                    f"{len(near_threshold)} transactions found between "
                    f"₹45,000–₹49,999 — a classic structuring pattern "
                    f"to avoid CTR reporting. Total: ₹{total:,}."
                )
            }]
        return []

    def _check_rapid_movement(
        self,
        transactions: list[dict]
    ) -> list[dict]:
        """Flag when many transactions appear in a single screenshot."""
        count = len(transactions)
        if count >= self.RAPID_MOVEMENT_MIN:
            return [{
                "type": "RAPID_FUND_MOVEMENT",
                "severity": "HIGH",
                "confidence": 0.80,
                "description": (
                    f"{count} transactions detected in a single evidence "
                    f"item — indicates rapid or automated fund movement."
                )
            }]
        return []

    def _check_round_amounts(
        self,
        transactions: list[dict],
        amounts: list[Decimal]
    ) -> list[dict]:
        """
        Large round amounts (e.g., exactly ₹10,000, ₹50,000) are often
        seen in advance-fee fraud and lottery scams.
        """
        findings = []
        for txn, amount in zip(transactions, amounts):
            if amount < 1000:
                continue
            for multiple in self.ROUND_AMOUNT_MULTIPLES:
                if amount % multiple == 0 and amount >= Decimal(str(multiple * 5)):
                    findings.append({
                        "type": "ROUND_AMOUNT_SUSPICION",
                        "severity": "LOW",
                        "confidence": 0.60,
                        "amount": float(amount),
                        "description": (
                            f"Exactly round amount of ₹{amount:,} is typical in "
                            f"advance-fee or lottery fraud schemes."
                        )
                    })
                    break
        return findings

    def _check_fan_out(
        self,
        transactions: list[dict]
    ) -> list[dict]:
        """
        Detect fan-out: one sender sending to many different receivers,
        common in money-mule networks.
        """
        receivers = [
            str(txn.get("receiver", "")).strip().lower()
            for txn in transactions
            if txn.get("receiver")
        ]
        senders = [
            str(txn.get("sender", "")).strip().lower()
            for txn in transactions
            if txn.get("sender")
        ]

        unique_receivers = set(r for r in receivers if r)
        unique_senders = set(s for s in senders if s)

        findings = []

        if len(unique_receivers) >= 3 and len(unique_senders) == 1:
            findings.append({
                "type": "FAN_OUT_PATTERN",
                "severity": "HIGH",
                "confidence": 0.78,
                "description": (
                    f"Single sender distributing funds to "
                    f"{len(unique_receivers)} different receivers — "
                    f"possible money-mule network."
                )
            })

        return findings
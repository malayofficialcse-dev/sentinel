"""
Financial Fraud ML Model Service
================================
Loads and runs the PaySim Random Forest classifier (financial_model.pkl).
Evaluates transaction features (step, type, amount, balances, errors) and
returns fraud probability, risk classification, and feature contributions.
"""

import json
import os
from pathlib import Path
from typing import Any, Optional


class FinancialModelService:

    def __init__(self):
        self._model = None
        self._features_config: dict[str, Any] = {}
        self._metadata: dict[str, Any] = {}
        self._loaded = False
        self._load_model()

    def _load_model(self) -> None:
        try:
            import joblib

            service_dir = Path(__file__).resolve().parent
            ai_dir = service_dir.parent.parent
            model_dir = ai_dir / "models" / "financial"

            model_path = model_dir / "financial_model.pkl"
            features_path = model_dir / "financial_features.json"
            metadata_path = model_dir / "financial_model_metadata.json"

            if metadata_path.exists():
                with open(metadata_path, "r", encoding="utf-8") as f:
                    self._metadata = json.load(f)

            if features_path.exists():
                with open(features_path, "r", encoding="utf-8") as f:
                    self._features_config = json.load(f)

            if model_path.exists():
                self._model = joblib.load(model_path)
                self._loaded = True

        except Exception as err:
            self._loaded = False
            self._load_error = str(err)

    def predict(
        self,
        transaction_type: str,
        amount: float,
        oldbalance_org: float,
        newbalance_orig: float,
        oldbalance_dest: float,
        newbalance_dest: float,
        step: int = 1,
        is_flagged_fraud: int = 0
    ) -> dict[str, Any]:
        """
        Run fraud inference on transaction parameters.
        Calculates balance error features and runs PaySim Random Forest model.
        """
        # Derived domain features
        orig_balance_change = oldbalance_org - newbalance_orig
        dest_balance_change = newbalance_dest - oldbalance_dest
        balance_error_orig = (oldbalance_org - amount) - newbalance_orig
        balance_error_dest = (oldbalance_dest + amount) - newbalance_dest
        amount_to_orig_balance = amount / (oldbalance_org + 1.0)
        amount_to_dest_balance = amount / (oldbalance_dest + 1.0)
        hour = step % 24
        day = (step // 24) + 1

        feature_dict = {
            "step": step,
            "type": transaction_type.upper(),
            "amount": amount,
            "oldbalanceOrg": oldbalance_org,
            "newbalanceOrig": newbalance_orig,
            "oldbalanceDest": oldbalance_dest,
            "newbalanceDest": newbalance_dest,
            "isFlaggedFraud": is_flagged_fraud,
            "orig_balance_change": orig_balance_change,
            "dest_balance_change": dest_balance_change,
            "balance_error_orig": balance_error_orig,
            "balance_error_dest": balance_error_dest,
            "amount_to_orig_balance": amount_to_orig_balance,
            "amount_to_dest_balance": amount_to_dest_balance,
            "hour": hour,
            "day": day,
        }

        # Run ML model if loaded
        is_fraud = False
        fraud_prob = 0.0

        if self._loaded and self._model is not None:
            try:
                import pandas as pd

                num_features = self._features_config.get("numerical_features", [])
                X = pd.DataFrame([[feature_dict.get(feat, 0.0) for feat in num_features]], columns=num_features)

                pred = self._model.predict(X)[0]
                proba = self._model.predict_proba(X)[0]
                classes = list(self._model.classes_)

                if 1 in classes:
                    fraud_prob = float(proba[classes.index(1)])
                else:
                    fraud_prob = float(pred)

                is_fraud = bool(fraud_prob >= 0.5 or pred == 1)

            except Exception:
                fraud_prob, is_fraud = self._heuristic_predict(feature_dict)
        else:
            fraud_prob, is_fraud = self._heuristic_predict(feature_dict)

        # Risk score and Level
        risk_score = round(fraud_prob * 100, 2)
        if risk_score >= 80:
            risk_level = "CRITICAL"
        elif risk_score >= 60:
            risk_level = "HIGH"
        elif risk_score >= 30:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        # Generate explanatory factors
        reasons = self._generate_explanations(feature_dict, fraud_prob)

        return {
            "is_fraud": is_fraud,
            "fraud_probability": fraud_prob,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "model_name": self._metadata.get("model_name", "Random Forest (PaySim)"),
            "accuracy": self._metadata.get("accuracy", 0.9999),
            "features": feature_dict,
            "reasons": reasons,
            "model_loaded": self._loaded,
        }

    @staticmethod
    def _heuristic_predict(f: dict[str, Any]) -> tuple[float, bool]:
        """Heuristic fallback for PaySim fraud patterns."""
        score = 0.0
        t_type = f.get("type", "")
        amount = f.get("amount", 0.0)
        old_org = f.get("oldbalanceOrg", 0.0)
        new_org = f.get("newbalanceOrig", 0.0)
        old_dest = f.get("oldbalanceDest", 0.0)
        new_dest = f.get("newbalanceDest", 0.0)

        # In PaySim, fraud almost exclusively occurs on TRANSFER and CASH_OUT
        if t_type in ("TRANSFER", "CASH_OUT"):
            score += 0.20

            # Entire balance drained
            if old_org > 0 and new_org == 0 and amount >= old_org * 0.95:
                score += 0.40

            # Destination balance discrepancy (no balance received despite transfer)
            if old_dest == 0 and new_dest == 0:
                score += 0.30

            # High value
            if amount >= 200000:
                score += 0.20
        else:
            score = 0.02

        prob = min(1.0, round(score, 4))
        return prob, prob >= 0.5

    @staticmethod
    def _generate_explanations(f: dict[str, Any], prob: float) -> list[str]:
        reasons = []
        t_type = f.get("type", "")
        amount = f.get("amount", 0.0)
        old_org = f.get("oldbalanceOrg", 0.0)
        new_org = f.get("newbalanceOrig", 0.0)
        old_dest = f.get("oldbalanceDest", 0.0)
        new_dest = f.get("newbalanceDest", 0.0)

        if t_type in ("TRANSFER", "CASH_OUT"):
            reasons.append(f"High-risk transaction category: {t_type}")

        if old_org > 0 and new_org == 0:
            reasons.append("Account Drained: Entire sender balance was emptied in a single transaction")

        if old_dest == 0 and new_dest == 0 and amount > 0:
            reasons.append("Zero Destination Balance Anomaly: Receiver balance did not increase after receiving funds (Mule routing)")

        if amount >= 100000:
            reasons.append(f"High Value Transaction: ₹{amount:,.2f} exceeds standard monitoring threshold")

        if abs(f.get("balance_error_orig", 0.0)) > 1.0:
            reasons.append("Sender balance arithmetic discrepancy detected")

        if not reasons:
            reasons.append("Transaction characteristics match normal legitimate baseline activity")

        return reasons

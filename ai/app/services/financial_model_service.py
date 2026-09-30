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
        is_flagged_fraud: int = 0,
        history: Optional[list[dict[str, Any]]] = None,
        account_age_days: Optional[int] = None,
        device_changed: bool = False,
        geo_distance_km: Optional[float] = None,
        merchant_category: Optional[str] = None,
        device_id: Optional[str] = None,
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
            "transactions_last_hour": self._transactions_last_hour(history),
            "amount_last_hour": self._amount_last_hour(history),
            "new_beneficiary": self._new_beneficiary(history, receiver=None),
            "device_changed": int(device_changed),
            "account_age_days": account_age_days if account_age_days is not None else -1,
            "geo_distance_km": geo_distance_km if geo_distance_km is not None else 0.0,
            "merchant_category": merchant_category or "UNKNOWN",
            "device_id_present": int(bool(device_id)),
        }

        # Run ML model if loaded
        is_fraud = False
        fraud_prob = 0.0

        if self._loaded and self._model is not None:
            try:
                import pandas as pd

                num_features = self._features_config.get("numerical_features", [])
                categorical_features = self._features_config.get("categorical_features", [])
                expected_features = [*categorical_features, *num_features]
                X = pd.DataFrame([[feature_dict.get(feat, "UNKNOWN" if feat in categorical_features else 0.0) for feat in expected_features]], columns=expected_features)

                pred = self._model.predict(X)[0]
                proba = self._model.predict_proba(X)[0]
                classes = list(self._model.classes_)

                if 1 in classes:
                    fraud_prob = float(proba[classes.index(1)])
                else:
                    fraud_prob = float(pred)

                is_fraud = bool(fraud_prob >= 0.5 or pred == 1)

            except Exception as exc:
                raise RuntimeError(f"trained financial inference failed: {exc}") from exc
        else:
            raise RuntimeError("trained financial inference model unavailable")

        behavior_probability, behavior_reasons = self._behavior_score(
            feature_dict, history or [], receiver=None
        )
        operational_probability = min(1.0, 0.70 * fraud_prob + 0.30 * behavior_probability)
        is_fraud = operational_probability >= 0.5
        risk_score = round(operational_probability * 100, 2)
        if risk_score >= 80:
            risk_level = "CRITICAL"
        elif risk_score >= 60:
            risk_level = "HIGH"
        elif risk_score >= 30:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        # Generate explanatory factors
        reasons = self._generate_explanations(feature_dict, operational_probability) + behavior_reasons

        return {
            "is_fraud": is_fraud,
            "fraud_probability": fraud_prob,
            "model_probability": round(fraud_prob, 6),
            "behavior_probability": round(behavior_probability, 6),
            "operational_probability": round(operational_probability, 6),
            "risk_score": risk_score,
            "risk_level": risk_level,
            "model_name": self._metadata.get("model_name", "Random Forest (PaySim)"),
            "accuracy": self._metadata.get("accuracy", "not_available"),
            "features": {feature: feature_dict[feature] for feature in [*self._features_config.get("categorical_features", []), *self._features_config.get("numerical_features", [])]},
            "reasons": reasons,
            "model_loaded": self._loaded,
            "decision": "FRAUD" if operational_probability >= 0.5 else ("NEEDS_REVIEW" if operational_probability >= 0.3 or behavior_probability >= 0.5 else "LEGITIMATE"),
            "behavior_features": {key: feature_dict[key] for key in ("transactions_last_hour", "amount_last_hour", "new_beneficiary", "device_changed", "account_age_days", "geo_distance_km", "merchant_category")},
        }

    @staticmethod
    def _transactions_last_hour(history: Optional[list[dict[str, Any]]]) -> int:
        return sum(1 for item in history or [] if float(item.get("hours_ago", 999)) <= 1)

    @staticmethod
    def _amount_last_hour(history: Optional[list[dict[str, Any]]]) -> float:
        return sum(float(item.get("amount", 0)) for item in history or [] if float(item.get("hours_ago", 999)) <= 1)

    @staticmethod
    def _new_beneficiary(history: Optional[list[dict[str, Any]]], receiver: Optional[str]) -> int:
        if not receiver:
            return int(any(bool(item.get("new_beneficiary")) for item in history or []))
        return int(not any(str(item.get("receiver", "")) == receiver for item in history or []))

    @staticmethod
    def _behavior_score(feature_dict: dict[str, Any], history: list[dict[str, Any]], receiver: Optional[str]) -> tuple[float, list[str]]:
        score = 0.0
        reasons: list[str] = []
        velocity = int(feature_dict["transactions_last_hour"])
        amount_velocity = float(feature_dict["amount_last_hour"])
        if velocity >= 5:
            score += 0.35
            reasons.append(f"High transaction velocity: {velocity} transactions in the last hour")
        elif velocity >= 3:
            score += 0.18
        if amount_velocity >= 100000:
            score += 0.25
            reasons.append(f"High hourly amount velocity: ₹{amount_velocity:,.2f}")
        if feature_dict["new_beneficiary"]:
            score += 0.15
            reasons.append("New beneficiary pattern detected")
        if feature_dict["device_changed"]:
            score += 0.15
            reasons.append("Device change detected around the transaction")
        if feature_dict["account_age_days"] >= 0 and feature_dict["account_age_days"] < 30:
            score += 0.15
            reasons.append("Account is newly opened")
        if feature_dict["geo_distance_km"] >= 500:
            score += 0.15
            reasons.append("Geographic distance is inconsistent with recent activity")
        return min(1.0, round(score, 4)), reasons

    def info(self) -> dict[str, Any]:
        return {
            "id": "financial-fraud-model",
            "status": "ACTIVE" if self._loaded else "UNAVAILABLE",
            "model_loaded": self._loaded,
            "artifact": "models/financial/financial_model.pkl",
            "dataset": self._metadata.get("dataset", "PaySim"),
            "accuracy": self._metadata.get("accuracy"),
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

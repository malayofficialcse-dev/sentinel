"""
URL Service
===========
Wraps the existing ML-based URL scanner and feature extractor into a
clean async interface consumed by ThreatAgent.

The ML model (url_model.pkl) classifies a URL as phishing or legitimate
using 22 structural features extracted by extract_url_features().
"""

import asyncio
import re
import ipaddress
from urllib.parse import urlparse


# ─────────────────────────────────────────────────────────────
# Feature extraction helpers  (previously at module level)
# ─────────────────────────────────────────────────────────────

def is_ip_address(hostname: str) -> int:
    if not hostname:
        return 0
    try:
        ipaddress.ip_address(hostname)
        return 1
    except ValueError:
        return 0


def count_subdomains(hostname: str) -> int:
    if not hostname:
        return 0
    parts = hostname.split(".")
    if len(parts) <= 2:
        return 0
    return len(parts) - 2


def extract_url_features(url: str) -> dict:
    """Extract 22 structural features from a URL string."""

    original_url = url.strip()

    if not re.match(r"^[a-zA-Z][a-zA-Z0-9+.\-]*://", original_url):
        url_for_parse = "http://" + original_url
    else:
        url_for_parse = original_url

    parsed = urlparse(url_for_parse)

    hostname = parsed.hostname or ""
    path = parsed.path or ""
    query = parsed.query or ""
    fragment = parsed.fragment or ""

    url_length = len(original_url)
    domain_length = len(hostname)
    letters_in_url = sum(c.isalpha() for c in original_url)
    digits_in_url = sum(c.isdigit() for c in original_url)
    equals_count = original_url.count("=")
    question_count = original_url.count("?")
    ampersand_count = original_url.count("&")
    special_chars = set("@!#$%^*()_+-=[]{}|;:',<>")
    other_special = sum(c in special_chars for c in original_url)
    domain_letters = sum(c.isalpha() for c in hostname)
    domain_digits = sum(c.isdigit() for c in hostname)
    path_length = len(path)
    is_https = int(parsed.scheme.lower() == "https")
    domain_is_ip = is_ip_address(hostname)
    num_subdomains = count_subdomains(hostname)

    try:
        has_port = int(parsed.port is not None)
    except ValueError:
        has_port = 0

    shortening_domains = {
        "bit.ly", "tinyurl.com", "t.co", "goo.gl",
        "ow.ly", "is.gd", "buff.ly", "cutt.ly", "shorturl.at"
    }
    is_shortened = int(hostname.lower() in shortening_domains)

    suspicious_words = [
        "login", "verify", "verification", "secure", "account",
        "update", "confirm", "password", "signin", "bank",
        "paypal", "wallet", "recover", "authentication"
    ]
    url_lower = original_url.lower()
    suspicious_word_count = sum(w in url_lower for w in suspicious_words)

    has_at = int("@" in original_url)
    hyphen_count = original_url.count("-")
    dot_count = original_url.count(".")

    return {
        "URLLength": url_length,
        "DomainLength": domain_length,
        "IsDomainIP": domain_is_ip,
        "NoOfSubDomain": num_subdomains,
        "NoOfLettersInURL": letters_in_url,
        "NoOfDigitsInURL": digits_in_url,
        "NoOfEqualsInURL": equals_count,
        "NoOfQMarkInURL": question_count,
        "NoOfAmpersandInURL": ampersand_count,
        "NoOfOtherSpecialCharsInURL": other_special,
        "NoOfLettersInDomain": domain_letters,
        "NoOfDigitsInDomain": domain_digits,
        "PathLength": path_length,
        "IsHTTPS": is_https,
        "HasPort": has_port,
        "IsShortenedURL": is_shortened,
        "SuspiciousWordCount": suspicious_word_count,
        "HasAtSymbol": has_at,
        "HyphenCount": hyphen_count,
        "DotCount": dot_count,
        "QueryLength": len(query),
        "FragmentLength": len(fragment),
    }


# ─────────────────────────────────────────────────────────────
# Risk + explanation helpers
# ─────────────────────────────────────────────────────────────

def _calculate_risk(phishing_probability: float) -> dict:
    score = phishing_probability * 100
    if score >= 80:
        level = "CRITICAL"
    elif score >= 60:
        level = "HIGH"
    elif score >= 30:
        level = "MEDIUM"
    else:
        level = "LOW"
    return {"score": round(score, 2), "level": level}


def _generate_reasons(features: dict) -> list[str]:
    reasons = []
    if features.get("IsDomainIP") == 1:
        reasons.append("Domain uses an IP address instead of a hostname")
    if features.get("URLLength", 0) > 100:
        reasons.append("URL is unusually long")
    if features.get("NoOfSubDomain", 0) >= 3:
        reasons.append("Multiple subdomains detected")
    if features.get("NoOfDigitsInURL", 0) >= 10:
        reasons.append("High number of digits in URL")
    if features.get("HasAtSymbol") == 1:
        reasons.append("@ symbol detected in URL")
    if features.get("IsShortenedURL") == 1:
        reasons.append("URL shortening service detected")
    if features.get("SuspiciousWordCount", 0) > 0:
        reasons.append("Security-sensitive keywords detected in URL")
    if not reasons:
        reasons.append("No obvious URL-level phishing indicators detected")
    return reasons


# ─────────────────────────────────────────────────────────────
# URLService — async wrapper
# ─────────────────────────────────────────────────────────────

class URLService:
    """
    Async service for ML-based URL phishing detection.

    Each call runs feature extraction + model inference and returns
    a structured result with risk score, level, and human-readable reasons.

    Usage
    -----
    service = URLService()
    result = await service.analyze("https://bit.ly/fake-bank-login")
    # result["risk"]["level"] == "CRITICAL"
    """

    def __init__(self):
        # Lazy-load the model + features on first use
        self._model = None
        self._model_features: list[str] = []
        self._model_loaded = False

    # ─────────────────────────────────────────────────────
    # Public interface
    # ─────────────────────────────────────────────────────

    async def analyze(self, url: str) -> dict:
        """
        Analyze a URL for phishing / malware indicators.

        Returns
        -------
        {
          "url": str,
          "domain": str,
          "is_phishing": bool,
          "phishing_probability": float,   # 0.0–1.0
          "risk": {"score": float, "level": str},
          "reasons": [str],
          "features": {feature_name: value},
          "indicators": [
            {"type": str, "value": str, "severity": str, "confidence": float, "description": str}
          ],
          "model_available": bool
        }
        """
        features = extract_url_features(url)
        parsed = urlparse(
            url if "://" in url else "http://" + url
        )
        domain = parsed.hostname or url

        # Try ML model
        model_result = await self._run_model(url, features)

        if model_result["model_available"]:
            is_phishing = model_result["is_phishing"]
            prob = model_result["phishing_probability"]
        else:
            raise RuntimeError("trained phishing inference model unavailable")

        risk = _calculate_risk(prob)
        reasons = _generate_reasons(features)

        # Build indicator list
        indicators = []
        if is_phishing:
            indicators.append({
                "type": "PHISHING_URL",
                "value": url,
                "severity": risk["level"],
                "confidence": round(prob, 3),
                "description": (
                    f"ML model classified this URL as phishing "
                    f"with {prob * 100:.1f}% confidence."
                )
            })
        for reason in reasons:
            if "No obvious" not in reason:
                indicators.append({
                    "type": "SUSPICIOUS_DOMAIN",
                    "value": domain,
                    "severity": "MEDIUM",
                    "confidence": 0.75,
                    "description": reason
                })

        return {
            "url": url,
            "domain": domain,
            "is_phishing": is_phishing,
            "phishing_probability": round(prob, 4),
            "risk": risk,
            "reasons": reasons,
            "features": features,
            "indicators": indicators,
            "model_available": model_result["model_available"]
        }

    # ─────────────────────────────────────────────────────
    # ML model runner
    # ─────────────────────────────────────────────────────

    async def _run_model(
        self,
        url: str,
        features: dict
    ) -> dict:
        """Run ML inference in a thread pool to avoid blocking."""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None,
            self._run_model_sync,
            url,
            features
        )

    def _run_model_sync(self, url: str, features: dict) -> dict:
        try:
            import os, json, joblib  # type: ignore
            import pandas as pd  # type: ignore

            # Locate model files relative to this service file
            service_dir = os.path.dirname(os.path.abspath(__file__))
            ai_dir = os.path.dirname(os.path.dirname(service_dir))
            model_dir = os.path.join(ai_dir, "models", "phishing")
            # The active URL extractor produces the 22-feature representation.
            # url_model.pkl requires a separate 50-feature webpage extractor that
            # is not present in this production service. Use the saved compatible
            # 22-feature model rather than padding inputs with fabricated zeros.
            model_path = os.path.join(model_dir, "url_model1.pkl")
            features_path = os.path.join(model_dir, "url_features1.json")

            if not os.path.exists(model_path):
                return {"model_available": False, "is_phishing": False, "phishing_probability": 0.0}

            if self._model is None:
                self._model = joblib.load(model_path)
                with open(features_path) as f:
                    self._model_features = json.load(f)

            missing_features = [feature for feature in self._model_features if feature not in features]
            if missing_features:
                return {
                    "model_available": False,
                    "error": "URL extractor does not implement required model features: " + ", ".join(missing_features)
                }

            X = pd.DataFrame(
                [[features[feat] for feat in self._model_features]],
                columns=self._model_features
            )

            prediction = self._model.predict(X)[0]
            probabilities = self._model.predict_proba(X)[0]
            classes = list(self._model.classes_)

            if 1 in classes:
                phishing_prob = float(probabilities[classes.index(1)])
            else:
                phishing_prob = float(prediction)

            return {
                "model_available": True,
                "is_phishing": bool(prediction == 1),
                "phishing_probability": phishing_prob
            }

        except Exception:
            return {"model_available": False, "is_phishing": False, "phishing_probability": 0.0}

    # ─────────────────────────────────────────────────────
    # Heuristic fallback (no model)
    # ─────────────────────────────────────────────────────

    @staticmethod
    def _heuristic_score(features: dict) -> tuple[float, bool]:
        """
        Simple weighted heuristic when ML model is unavailable.
        Returns (probability, is_phishing).
        """
        score = 0.0
        if features.get("IsDomainIP"):
            score += 0.35
        if features.get("URLLength", 0) > 100:
            score += 0.20
        if features.get("NoOfSubDomain", 0) >= 3:
            score += 0.20
        if features.get("HasAtSymbol"):
            score += 0.15
        if features.get("IsShortenedURL"):
            score += 0.10
        if features.get("SuspiciousWordCount", 0) > 0:
            score += features["SuspiciousWordCount"] * 0.05
        score = min(score, 1.0)
        return round(score, 4), score >= 0.4

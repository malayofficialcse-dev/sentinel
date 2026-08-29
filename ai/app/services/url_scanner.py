# def calculate_risk(phishing_probability):

#     risk_score = phishing_probability * 100

#     if risk_score >= 80:
#         level = "CRITICAL"

#     elif risk_score >= 60:
#         level = "HIGH"

#     elif risk_score >= 30:
#         level = "MEDIUM"

#     else:
#         level = "LOW"

#     return {
#         "score": round(risk_score, 2),
#         "level": level
#     }





# def generate_reasons(features):

#     reasons = []

#     if features.get("IsDomainIP") == 1:
#         reasons.append({
#             "severity": "HIGH",
#             "reason": "Domain uses an IP address instead of a normal domain"
#         })

#     if features.get("URLLength", 0) > 100:
#         reasons.append({
#             "severity": "HIGH",
#             "reason": "URL is unusually long"
#         })

#     if features.get("NoOfSubDomain", 0) >= 3:
#         reasons.append({
#             "severity": "HIGH",
#             "reason": "Multiple subdomains detected"
#         })

#     if features.get("NoOfDigitsInURL", 0) >= 10:
#         reasons.append({
#             "severity": "MEDIUM",
#             "reason": "High number of digits in URL"
#         })

#     if features.get("HasAtSymbol") == 1:
#         reasons.append({
#             "severity": "HIGH",
#             "reason": "@ symbol detected in URL"
#         })

#     if features.get("IsShortenedURL") == 1:
#         reasons.append({
#             "severity": "MEDIUM",
#             "reason": "URL shortening service detected"
#         })

#     if features.get("SuspiciousWordCount", 0) > 0:
#         reasons.append({
#             "severity": "MEDIUM",
#             "reason": "Security-sensitive words detected in URL"
#         })

#     if not reasons:
#         reasons.append({
#             "severity": "INFO",
#             "reason": "No obvious URL-level indicators detected"
#         })

#     return reasons








import sys
import os
import json
import joblib
import pandas as pd

from url_feature_extractor import extract_url_features


# ============================================================
# PATHS
# ============================================================

CURRENT_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

AI_DIR = os.path.dirname(
    os.path.dirname(CURRENT_DIR)
)

MODEL_DIR = os.path.join(
    AI_DIR,
    "models",
    "phishing"
)


# MODEL_PATH = os.path.join(
#     MODEL_DIR,
#     "phishing_model.pkl"
# )



MODEL_PATH = os.path.join(
    MODEL_DIR,
    "url_model.pkl"
)


# FEATURES_PATH = os.path.join(
#     MODEL_DIR,
#     "features.json"
# )


FEATURES_PATH = os.path.join(
    MODEL_DIR,
    "url_features.json"
)


# ============================================================
# LOAD MODEL
# ============================================================

def load_model():

    print("\nLoading ML model...")

    if not os.path.exists(MODEL_PATH):

        raise FileNotFoundError(
            f"""
ML model not found!

Expected:

{MODEL_PATH}

"""
        )

    model = joblib.load(
        MODEL_PATH
    )

    print("ML model loaded successfully.")

    return model


# ============================================================
# LOAD FEATURES
# ============================================================

def load_features():

    print("Loading model features...")

    if not os.path.exists(FEATURES_PATH):

        raise FileNotFoundError(
            f"""
Feature configuration not found!

Expected:

{FEATURES_PATH}

"""
        )

    with open(
        FEATURES_PATH,
        "r"
    ) as file:

        features = json.load(file)

    print(
        f"Model expects {len(features)} features."
    )

    return features


# ============================================================
# RISK CALCULATION
# ============================================================

def calculate_risk(
    phishing_probability
):

    score = phishing_probability * 100

    if score >= 80:

        level = "CRITICAL"

    elif score >= 60:

        level = "HIGH"

    elif score >= 30:

        level = "MEDIUM"

    else:

        level = "LOW"

    return {
        "score": round(score, 2),
        "level": level
    }


# ============================================================
# EXPLANATION ENGINE
# ============================================================

def generate_reasons(features):

    reasons = []

    # IP address
    if features.get(
        "IsDomainIP",
        0
    ) == 1:

        reasons.append(
            "🔴 Domain uses an IP address"
        )

    # URL length
    if features.get(
        "URLLength",
        0
    ) > 100:

        reasons.append(
            "🔴 URL is unusually long"
        )

    # Subdomains
    if features.get(
        "NoOfSubDomain",
        0
    ) >= 3:

        reasons.append(
            "🔴 Multiple subdomains detected"
        )

    # Digits
    if features.get(
        "NoOfDigitsInURL",
        0
    ) >= 10:

        reasons.append(
            "🟠 High number of digits in URL"
        )

    # @
    if features.get(
        "HasAtSymbol",
        0
    ) == 1:

        reasons.append(
            "🔴 @ symbol detected in URL"
        )

    # Shortener
    if features.get(
        "IsShortenedURL",
        0
    ) == 1:

        reasons.append(
            "🟠 URL shortening service detected"
        )

    # Suspicious words
    if features.get(
        "SuspiciousWordCount",
        0
    ) > 0:

        reasons.append(
            "🟠 Security-sensitive words detected"
        )

    if not reasons:

        reasons.append(
            "🟢 No obvious URL-level indicators detected"
        )

    return reasons


# ============================================================
# MAIN SCANNER
# ============================================================

def scan_url(url):

    print("\n")
    print("=" * 60)

    print(
        "              SENTINEL URL SCANNER"
    )

    print("=" * 60)

    print("\nURL:")
    print(url)

    # --------------------------------------------------------
    # STEP 1
    # --------------------------------------------------------

    print("\n[1/4] Extracting URL features...")

    features = extract_url_features(
        url
    )

    print(
        "Feature extraction completed."
    )

    # --------------------------------------------------------
    # STEP 2
    # --------------------------------------------------------

    print("\n[2/4] Loading model...")

    model = load_model()

    model_features = load_features()

    # --------------------------------------------------------
    # ALIGN FEATURES
    # --------------------------------------------------------

    # missing_features = []

    # for feature in model_features:

    #     if feature not in features:

    #         missing_features.append(
    #             feature
    #         )

    # if missing_features:

    #     print("\nWARNING!")
    #     print(
    #         "The current URL extractor does not "
    #         "produce all model features."
    #     )

    #     print("\nMissing features:")

    #     for feature in missing_features:

    #         print(
    #             " -",
    #             feature
    #         )

    #     print(
    #         "\nWe need to retrain a URL-only model "
    #         "using features that can actually be "
    #         "extracted from a URL."
    #     )

    #     return

    # --------------------------------------------------------
    # CREATE MODEL INPUT
    # --------------------------------------------------------

    X = pd.DataFrame(
        [
            [
                features[feature]
                for feature in model_features
            ]
        ],
        columns=model_features
    )

    # --------------------------------------------------------
    # STEP 3
    # --------------------------------------------------------

    print("\n[3/4] Running ML prediction...")

    prediction = model.predict(
        X
    )[0]

    probabilities = model.predict_proba(
        X
    )[0]

    # --------------------------------------------------------
    # PROBABILITY
    # --------------------------------------------------------

    classes = list(
        model.classes_
    )

    phishing_probability = 0.0

    if 1 in classes:

        phishing_index = classes.index(
            1
        )

        phishing_probability = probabilities[
            phishing_index
        ]

    else:

        # fallback
        phishing_probability = float(
            prediction
        )

    # --------------------------------------------------------
    # RISK
    # --------------------------------------------------------

    risk = calculate_risk(
        phishing_probability
    )

    # --------------------------------------------------------
    # REASONS
    # --------------------------------------------------------

    reasons = generate_reasons(
        features
    )

    # --------------------------------------------------------
    # RESULT
    # --------------------------------------------------------

    print("\n[4/4] Analysis completed.")

    print("\n")
    print("=" * 60)

    print("                SENTINEL RESULT")

    print("=" * 60)

    if prediction == 1:

        print(
            "\nClassification : 🔴 PHISHING"
        )

    else:

        print(
            "\nClassification : 🟢 LEGITIMATE"
        )

    print(
        f"Phishing Probability : "
        f"{phishing_probability * 100:.2f}%"
    )

    print(
        f"Risk Score           : "
        f"{risk['score']}/100"
    )

    print(
        f"Risk Level           : "
        f"{risk['level']}"
    )

    # --------------------------------------------------------
    # FEATURES
    # --------------------------------------------------------

    print("\n")
    print("-" * 60)

    print("URL FEATURES")

    print("-" * 60)

    for feature, value in features.items():

        print(
            f"{feature:<35} : {value}"
        )

    # --------------------------------------------------------
    # REASONS
    # --------------------------------------------------------

    print("\n")
    print("-" * 60)

    print("WHY IS THIS URL RISKY?")

    print("-" * 60)

    for reason in reasons:

        print(
            reason
        )

    print("\n")
    print("=" * 60)


# ============================================================
# COMMAND LINE
# ============================================================

if __name__ == "__main__":

    if len(sys.argv) < 2:

        print(
            """
Usage:

python url_scanner.py "https://example.com/login"

Example:

python url_scanner.py "https://example.com/login"

"""
        )

        sys.exit(1)

    url = sys.argv[1]

    scan_url(
        url
    )
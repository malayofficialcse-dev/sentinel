"""Train the phishing model with the exact feature contract used by the API."""

import json
import sys
from pathlib import Path

import joblib
import pandas as pd
from sklearn.calibration import CalibratedClassifierCV, calibration_curve
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, brier_score_loss, f1_score, precision_score, recall_score, roc_auc_score
from sklearn.model_selection import train_test_split

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.services.url_feature_extractor import extract_url_features


ROOT = Path(__file__).resolve().parents[1]
DATASET = ROOT / "datasets" / "phiusiil.csv"
MODEL_DIR = ROOT / "models" / "phishing"
MODEL_PATH = MODEL_DIR / "url_model1.pkl"
FEATURES_PATH = MODEL_DIR / "url_features1.json"
METRICS_PATH = MODEL_DIR / "runtime_metrics.json"
CALIBRATED_PATH = MODEL_DIR / "calibrated_structural_model.pkl"
CHAR_MODEL_PATH = MODEL_DIR / "url_char_model.pkl"
OOD_PATH = MODEL_DIR / "url_ood_stats.json"


def main() -> None:
    dataset = pd.read_csv(DATASET, usecols=["URL", "label"]).dropna()
    rows = [extract_url_features(str(url)) for url in dataset["URL"]]
    features = pd.DataFrame(rows)
    labels = (1 - dataset["label"].astype(int)).rename("phishing")

    train_x, test_x, train_y, test_y = train_test_split(
        features, labels, test_size=0.2, random_state=42, stratify=labels
    )
    base_model = RandomForestClassifier(
        n_estimators=300,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )
    calibrated_model = CalibratedClassifierCV(base_model, method="sigmoid", cv=3, n_jobs=1)
    calibrated_model.fit(train_x, train_y)

    char_vectorizer = TfidfVectorizer(analyzer="char", ngram_range=(3, 5), min_df=5, max_features=20000, sublinear_tf=True)
    char_train = char_vectorizer.fit_transform(dataset.loc[train_x.index, "URL"].astype(str))
    char_model = LogisticRegression(max_iter=300, class_weight="balanced", random_state=42)
    char_model.fit(char_train, train_y)

    structural_probability = calibrated_model.predict_proba(test_x)[:, list(calibrated_model.classes_).index(1)]
    char_probability = char_model.predict_proba(char_vectorizer.transform(dataset.loc[test_x.index, "URL"].astype(str)))[:, 1]
    probabilities = 0.65 * structural_probability + 0.35 * char_probability
    predictions = (probabilities >= 0.5).astype(int)
    calibration_true, calibration_pred = calibration_curve(test_y, probabilities, n_bins=10, strategy="quantile")
    feature_stats = {column: {"min": float(features[column].min()), "max": float(features[column].max()), "mean": float(features[column].mean()), "std": float(features[column].std() or 1)} for column in features.columns}
    metrics = {
        "model": "Random Forest",
        "dataset": "PhiUSIIL",
        "target": "phishing (1 - dataset label)",
        "training_rows": len(train_x),
        "testing_rows": len(test_x),
        "accuracy": accuracy_score(test_y, predictions),
        "precision": precision_score(test_y, predictions),
        "recall": recall_score(test_y, predictions),
        "f1": f1_score(test_y, predictions),
        "roc_auc": roc_auc_score(test_y, probabilities),
        "brier_score": brier_score_loss(test_y, probabilities),
        "expected_calibration_error": float(sum(abs(actual - predicted) for actual, predicted in zip(calibration_true, calibration_pred)) / max(len(calibration_true), 1)),
        "reliability_diagram": {"predicted": calibration_pred.tolist(), "observed": calibration_true.tolist()},
        "ensemble": {"structural_weight": 0.65, "character_weight": 0.35},
    }

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(calibrated_model, CALIBRATED_PATH)
    joblib.dump({"vectorizer": char_vectorizer, "model": char_model}, CHAR_MODEL_PATH)
    joblib.dump(calibrated_model, MODEL_PATH)
    FEATURES_PATH.write_text(json.dumps(list(features.columns), indent=2), encoding="utf-8")
    METRICS_PATH.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    OOD_PATH.write_text(json.dumps(feature_stats, indent=2), encoding="utf-8")
    print(json.dumps(metrics, indent=2))


if __name__ == "__main__":
    main()
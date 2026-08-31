"""Inspect saved inference artifacts without training or changing them."""
import json
from pathlib import Path
import joblib

ROOT = Path(__file__).resolve().parents[1]

def inspect(path: Path) -> None:
    print(f"model_file: {path}")
    try:
        obj = joblib.load(path)
        print("loaded_successfully: true")
        print(f"class: {type(obj).__name__}")
        print(f"feature_count: {getattr(obj, 'n_features_in_', 'not_available')}")
        print(f"classes: {list(getattr(obj, 'classes_', [])) or 'not_available'}")
        print(f"predict_proba: {hasattr(obj, 'predict_proba')}")
        if hasattr(obj, "steps"):
            print(f"pipeline_steps: {[name for name, _ in obj.steps]}")
        if hasattr(obj, "get_feature_names_out"):
            try: print(f"feature_names: {list(obj.get_feature_names_out())}")
            except Exception: pass
    except Exception as exc:
        print("loaded_successfully: false")
        print(f"error: {type(exc).__name__}: {exc}")

def metadata(path: Path) -> None:
    print(f"metadata_file: {path}")
    if not path.exists(): print("metadata: not_available"); return
    print(json.dumps(json.loads(path.read_text(encoding="utf-8")), indent=2))

for path in [
    ROOT / "models/phishing/url_model.pkl",
    ROOT / "models/phishing/url_model1.pkl",
    ROOT / "models/phishing/phishing_model.pkl",
    ROOT / "models/financial/financial_model.pkl",
    ROOT / "models/malware/malware_model.pkl",
    ROOT / "models/malware/ember_vectorizer.pkl",
]: inspect(path)
metadata(ROOT / "models/financial/financial_model_metadata.json")
print("financial_features:")
print((ROOT / "models/financial/financial_features.json").read_text(encoding="utf-8"))
print("phishing_features:")
print((ROOT / "models/phishing/url_features.json").read_text(encoding="utf-8"))

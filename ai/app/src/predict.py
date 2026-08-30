import os
import joblib
import pandas as pd


MODEL_PATH = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "../../models/financial/financial_model.pkl"
    )
)


print("Loading model from:")
print(MODEL_PATH)


model = joblib.load(MODEL_PATH)

print("Financial model loaded successfully.")


def predict_fraud(transaction_data):

    df = pd.DataFrame([transaction_data])

    prediction = model.predict(df)[0]

    probability = model.predict_proba(df)[0][1]

    if probability >= 0.80:
        risk_level = "HIGH"

    elif probability >= 0.50:
        risk_level = "MEDIUM"

    elif probability >= 0.20:
        risk_level = "LOW"

    else:
        risk_level = "MINIMAL"

    return {
        "prediction": int(prediction),
        "fraud_probability": round(
            float(probability) * 100,
            2
        ),
        "risk_level": risk_level
    }
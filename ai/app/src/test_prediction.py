from predict import predict_fraud


transaction = {
    "step": 500,
    "type": "DEBIT",
    "amount": 7507700,

    "oldbalanceOrg": 1000,
    "newbalanceOrig": 1000,

    "oldbalanceDest": 1000,
    "newbalanceDest": 1000,

    "isFlaggedFraud": 0,

    "orig_balance_change": 1000,
    "dest_balance_change": 1000,

    "balance_error_orig": 0,
    "balance_error_dest": 0,

    "amount_to_orig_balance": 0.9375,
    "amount_to_dest_balance": 75,

    "hour": 20,
    "day": 20
}


result = predict_fraud(transaction)

print("\n")
print("=" * 50)
print("       SENTINEL FINANCIAL ANALYSIS")
print("=" * 50)

print(f"Fraud Probability : {result['fraud_probability']}%")
print(f"Risk Level        : {result['risk_level']}")

if result["prediction"] == 1:
    print("Decision          : FRAUD DETECTED")
else:
    print("Decision          : LEGITIMATE")

print("=" * 50)
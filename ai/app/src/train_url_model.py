import os
import sys
import json
import joblib

import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix,
    roc_auc_score
)

# ============================================================
# PATH SETUP
# ============================================================

CURRENT_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

APP_DIR = os.path.dirname(
    CURRENT_DIR
)

AI_DIR = os.path.dirname(
    APP_DIR
)

DATASET_PATH = os.path.join(
    AI_DIR,
    "datasets",
    "phiusiil.csv"
)

MODEL_DIR = os.path.join(
    AI_DIR,
    "models",
    "phishing"
)

os.makedirs(
    MODEL_DIR,
    exist_ok=True
)

MODEL_PATH = os.path.join(
    MODEL_DIR,
    "url_model.pkl"
)

FEATURES_PATH = os.path.join(
    MODEL_DIR,
    "url_features.json"
)


# ============================================================
# IMPORT FEATURE EXTRACTOR
# ============================================================

sys.path.insert(
    0,
    os.path.join(
        APP_DIR,
        "services"
    )
)

from url_feature_extractor import (
    extract_url_features
)


# ============================================================
# LOAD DATASET
# ============================================================

print("\n" + "=" * 70)
print("             SENTINEL URL MODEL TRAINING")
print("=" * 70)

print("\nDataset:")
print(DATASET_PATH)

if not os.path.exists(DATASET_PATH):

    raise FileNotFoundError(
        f"""
Dataset not found:

{DATASET_PATH}
"""
    )

df = pd.read_csv(
    DATASET_PATH
)

print(
    "\nDataset loaded successfully."
)

print(
    "Shape:",
    df.shape
)

print(
    "\nColumns:"
)

for column in df.columns:

    print(
        " -",
        column
    )


# ============================================================
# FIND URL COLUMN
# ============================================================

possible_url_columns = [
    "URL",
    "url",
    "Url",
    "Domain",
    "domain"
]

url_column = None

for column in possible_url_columns:

    if column in df.columns:

        url_column = column

        break


if url_column is None:

    raise ValueError(
        """
Could not find URL column.

Available columns:
""" + str(list(df.columns))
    )


print(
    "\nURL column:",
    url_column
)


# ============================================================
# FIND LABEL COLUMN
# ============================================================

possible_label_columns = [
    "label",
    "Label",
    "LABEL",
    "status",
    "Status",
    "CLASS_LABEL",
    "class",
    "Class"
]

label_column = None

for column in possible_label_columns:

    if column in df.columns:

        label_column = column

        break


if label_column is None:

    raise ValueError(
        """
Could not find label column.

Available columns:
""" + str(list(df.columns))
    )


print(
    "Label column:",
    label_column
)


# ============================================================
# CLEAN DATA
# ============================================================

df = df[
    [
        url_column,
        label_column
    ]
].copy()

df = df.dropna()

df[url_column] = df[url_column].astype(str)


print(
    "\nRows after cleaning:",
    len(df)
)


# ============================================================
# CONVERT LABEL
# ============================================================

print(
    "\nOriginal labels:"
)

print(
    df[label_column].value_counts()
)


# ------------------------------------------------------------
# Handle numeric labels
# ------------------------------------------------------------

if pd.api.types.is_numeric_dtype(
    df[label_column]
):

    df["target"] = (
        df[label_column]
        .astype(int)
    )

else:

    # Convert text labels
    label_values = (
        df[label_column]
        .astype(str)
        .str.lower()
        .str.strip()
    )

    phishing_words = {
        "1",
        "phishing",
        "malicious",
        "bad",
        "fraud",
        "attack",
        "malware"
    }

    df["target"] = label_values.apply(
        lambda x:
        1
        if x in phishing_words
        else 0
    )


print(
    "\nConverted target distribution:"
)

print(
    df["target"].value_counts()
)


# ============================================================
# FEATURE EXTRACTION
# ============================================================

print(
    "\n" + "=" * 70
)

print(
    "EXTRACTING URL FEATURES"
)

print(
    "=" * 70
)


feature_rows = []

valid_indices = []


for index, url in enumerate(
    df[url_column]
):

    try:

        features = extract_url_features(
            url
        )

        feature_rows.append(
            features
        )

        valid_indices.append(
            index
        )

    except Exception as error:

        print(
            f"Skipping row {index}: {error}"
        )


print(
    "\nSuccessfully extracted features:",
    len(feature_rows)
)


# ============================================================
# CREATE FEATURE DATAFRAME
# ============================================================

X = pd.DataFrame(
    feature_rows
)

y = df.loc[
    valid_indices,
    "target"
].reset_index(
    drop=True
)


print(
    "\nFeature matrix shape:",
    X.shape
)

print(
    "\nFeatures:"
)

for feature in X.columns:

    print(
        " -",
        feature
    )


# ============================================================
# REMOVE INVALID VALUES
# ============================================================

X = X.replace(
    [float("inf"), float("-inf")],
    0
)

X = X.fillna(0)


# ============================================================
# TRAIN TEST SPLIT
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(

    X,
    y,

    test_size=0.20,

    random_state=42,

    stratify=y
)


print(
    "\nTraining samples:",
    len(X_train)
)

print(
    "Testing samples:",
    len(X_test)
)


# ============================================================
# TRAIN RANDOM FOREST
# ============================================================

print(
    "\n" + "=" * 70
)

print(
    "TRAINING RANDOM FOREST"
)

print(
    "=" * 70
)


model = RandomForestClassifier(

    n_estimators=300,

    max_depth=None,

    min_samples_split=2,

    min_samples_leaf=1,

    class_weight="balanced",

    random_state=42,

    n_jobs=-1
)


model.fit(
    X_train,
    y_train
)


print(
    "\nTraining completed."
)


# ============================================================
# PREDICTION
# ============================================================

y_pred = model.predict(
    X_test
)

y_probability = model.predict_proba(
    X_test
)[:, 1]


# ============================================================
# METRICS
# ============================================================

accuracy = accuracy_score(
    y_test,
    y_pred
)

precision = precision_score(
    y_test,
    y_pred,
    zero_division=0
)

recall = recall_score(
    y_test,
    y_pred,
    zero_division=0
)

f1 = f1_score(
    y_test,
    y_pred,
    zero_division=0
)

auc = roc_auc_score(
    y_test,
    y_probability
)


print(
    "\n" + "=" * 70
)

print(
    "MODEL PERFORMANCE"
)

print(
    "=" * 70
)

print(
    f"\nAccuracy  : {accuracy:.4f}"
)

print(
    f"Precision : {precision:.4f}"
)

print(
    f"Recall    : {recall:.4f}"
)

print(
    f"F1 Score  : {f1:.4f}"
)

print(
    f"ROC-AUC   : {auc:.4f}"
)


# ============================================================
# CLASSIFICATION REPORT
# ============================================================

print(
    "\nClassification Report:"
)

print(
    classification_report(
        y_test,
        y_pred,
        zero_division=0
    )
)


# ============================================================
# CONFUSION MATRIX
# ============================================================

print(
    "\nConfusion Matrix:"
)

cm = confusion_matrix(
    y_test,
    y_pred
)

print(cm)


# ============================================================
# FEATURE IMPORTANCE
# ============================================================

importance = pd.DataFrame({

    "feature":
        X.columns,

    "importance":
        model.feature_importances_

})


importance = importance.sort_values(
    "importance",
    ascending=False
)


print(
    "\n" + "=" * 70
)

print(
    "TOP IMPORTANT FEATURES"
)

print(
    "=" * 70
)

print(
    importance.to_string(
        index=False
    )
)


# ============================================================
# SAVE MODEL
# ============================================================

joblib.dump(
    model,
    MODEL_PATH
)


print(
    "\nModel saved:"
)

print(
    MODEL_PATH
)


# ============================================================
# SAVE FEATURES
# ============================================================

features = list(
    X.columns
)

with open(
    FEATURES_PATH,
    "w"
) as file:

    json.dump(
        features,
        file,
        indent=4
    )


print(
    "\nFeatures saved:"
)

print(
    FEATURES_PATH
)


# ============================================================
# FINAL
# ============================================================

print(
    "\n" + "=" * 70
)

print(
    "URL MODEL TRAINING COMPLETE"
)

print(
    "=" * 70
)

print(
    "\nYou can now use:"
)

print(
    'python .\\app\\services\\url_scanner.py "https://example.com"'
)
# """Load the UCI phishing dataset without hanging on an unavailable network."""

# from __future__ import annotations

# import io
# import json
# import os
# from pathlib import Path
# from urllib.error import HTTPError, URLError
# from urllib.request import urlopen

# import pandas as pd

# DATASET_ID = 967
# API_URL = f"https://archive.ics.uci.edu/api/dataset?id={DATASET_ID}"
# CACHE_FILE = Path(__file__).resolve().parents[3] / "data" / "phiusiil_phishing_url_dataset.csv"
# TIMEOUT_SECONDS = float(os.getenv("UCI_DATASET_TIMEOUT", "15"))


# def _download(url: str) -> bytes:
#     """Download a resource with a bounded timeout and a useful error."""
#     try:
#         with urlopen(url, timeout=TIMEOUT_SECONDS) as response:
#             return response.read()
#     except (HTTPError, URLError, TimeoutError) as exc:
#         raise ConnectionError(
#             f"Could not reach the UCI dataset service within {TIMEOUT_SECONDS:g}s. "
#             f"Check your internet/VPN or place a CSV at {CACHE_FILE}."
#         ) from exc


# def load_phishing_dataset() -> pd.DataFrame:
#     """Load the cached dataset, or download and cache it from UCI."""
#     if CACHE_FILE.exists():
#         print(f"Loading cached dataset: {CACHE_FILE}", flush=True)
#         return pd.read_csv(CACHE_FILE)

#     print(f"Downloading UCI dataset {DATASET_ID} (timeout: {TIMEOUT_SECONDS:g}s)...", flush=True)
#     metadata = json.loads(_download(API_URL).decode("utf-8"))
#     dataset_url = metadata.get("data", {}).get("data_url")
#     if not dataset_url:
#         raise ValueError(f"UCI did not provide a CSV URL for dataset {DATASET_ID}.")

#     frame = pd.read_csv(io.BytesIO(_download(dataset_url)))
#     CACHE_FILE.parent.mkdir(parents=True, exist_ok=True)
#     frame.to_csv(CACHE_FILE, index=False)
#     print(f"Cached dataset at: {CACHE_FILE}", flush=True)
#     return frame


# if __name__ == "__main__":
#     try:
#         dataset = load_phishing_dataset()
#     except (ConnectionError, ValueError, OSError) as error:
#         raise SystemExit(f"Dataset load failed: {error}") from error

#     print("Dataset shape:", dataset.shape)
#     print(dataset.head())
#     print("Columns:", list(dataset.columns))





from pathlib import Path
import pandas as pd


# ai/app/src/data_loader.py

BASE_DIR = Path(__file__).resolve().parents[2]

DATASET_PATH = (
    BASE_DIR
    / "datasets"
    / "phiusiil.csv"
)


def load_phishing_dataset():

    if not DATASET_PATH.exists():
        raise FileNotFoundError(
            f"\nDataset not found!\n"
            f"Expected location:\n{DATASET_PATH}\n\n"
            f"Please download the PhiUSIIL dataset "
            f"and place it at:\n"
            f"{DATASET_PATH}"
        )

    print(f"Loading dataset from:\n{DATASET_PATH}")

    df = pd.read_csv(DATASET_PATH)

    print("Dataset loaded successfully.")
    print("Shape:", df.shape)

    return df


if __name__ == "__main__":

    df = load_phishing_dataset()

    print("\nColumns:")
    print(df.columns.tolist())

    print("\nFirst 5 rows:")
    print(df.head())
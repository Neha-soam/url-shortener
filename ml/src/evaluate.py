"""Evaluate the saved model on any labelled CSV (url,label). Useful for adversarial / held-out sets.

Usage: python -m src.evaluate --data data/processed/adversarial.csv
"""
import argparse

import pandas as pd

from .predict import load_model, predict_url
from .train import metrics


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", required=True)
    args = ap.parse_args()
    load_model()
    df = pd.read_csv(args.data).dropna(subset=["url", "label"])
    preds = [int(predict_url(u)["isMalicious"]) for u in df["url"]]
    m = metrics(df["label"].astype(int), preds)
    print(m)
    print(f"Missed phishing (false negatives): {m['fn']} | False alarms (false positives): {m['fp']}")


if __name__ == "__main__":
    main()

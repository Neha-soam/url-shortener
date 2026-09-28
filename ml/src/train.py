"""Train, validate, gate and version the phishing model.

Usage: python -m src.train [--data data/raw/urls.csv] [--version v1.0]
Outputs: models/phishing_model.pkl  +  models/model_meta.json
"""
import argparse
import json
import os
from datetime import datetime, timezone

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import confusion_matrix, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

from .features import FEATURE_NAMES, features_vector

# Validation gate: a model must clear these on the VALIDATION set to be promoted.
MIN_RECALL = 0.85     # false negatives (missed phishing) are the costly error
MIN_PRECISION = 0.80
MIN_F1 = 0.85


def metrics(y_true, y_pred):
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred, labels=[0, 1]).ravel()
    return {
        "precision": round(float(precision_score(y_true, y_pred, zero_division=0)), 4),
        "recall": round(float(recall_score(y_true, y_pred, zero_division=0)), 4),
        "f1": round(float(f1_score(y_true, y_pred, zero_division=0)), 4),
        "tp": int(tp), "fp": int(fp), "tn": int(tn), "fn": int(fn),
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", default="data/raw/urls.csv")
    ap.add_argument("--version", default=datetime.now(timezone.utc).strftime("v%Y%m%d%H%M"))
    ap.add_argument("--seed", type=int, default=42)
    args = ap.parse_args()

    df = pd.read_csv(args.data).dropna(subset=["url", "label"]).drop_duplicates(subset="url")
    print(f"rows after dedupe: {len(df)} | phishing share: {df['label'].mean():.2%}")

    X = np.array([features_vector(u) for u in df["url"]], dtype=float)
    y = df["label"].astype(int).values

    # 60/20/20 stratified split. Test set is touched ONCE, for the chosen model only.
    X_tr, X_tmp, y_tr, y_tmp = train_test_split(X, y, test_size=0.4, stratify=y, random_state=args.seed)
    X_val, X_te, y_val, y_te = train_test_split(X_tmp, y_tmp, test_size=0.5, stratify=y_tmp, random_state=args.seed)

    # Class imbalance handled with class_weight='balanced'
    candidates = {
        "logreg": make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000, class_weight="balanced")),
        "random_forest": RandomForestClassifier(n_estimators=200, class_weight="balanced", random_state=args.seed, n_jobs=-1),
    }

    results = {}
    for name, model in candidates.items():
        model.fit(X_tr, y_tr)
        results[name] = metrics(y_val, model.predict(X_val))
        print(f"[val] {name}: {results[name]}")

    best_name = max(results, key=lambda n: (results[n]["f1"], results[n]["recall"]))
    best, val_m = candidates[best_name], results[best_name]

    if not (val_m["recall"] >= MIN_RECALL and val_m["precision"] >= MIN_PRECISION and val_m["f1"] >= MIN_F1):
        raise SystemExit(f"VALIDATION GATE FAILED for {best_name}: {val_m}. Model NOT promoted.")

    test_m = metrics(y_te, best.predict(X_te))
    print(f"[test] {best_name}: {test_m}")

    os.makedirs("models", exist_ok=True)
    joblib.dump(best, "models/phishing_model.pkl")
    meta = {
        "version": args.version,
        "algorithm": best_name,
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "data_file": args.data,
        "n_rows": int(len(df)),
        "feature_names": FEATURE_NAMES,
        "threshold": 0.5,
        "feature_mean": X_tr.mean(axis=0).tolist(),
        "feature_std": (X_tr.std(axis=0) + 1e-9).tolist(),
        "validation_metrics": val_m,
        "test_metrics": test_m,
        "all_validation_results": results,
    }
    with open("models/model_meta.json", "w") as f:
        json.dump(meta, f, indent=2)
    print(f"saved model {args.version} ({best_name})")


if __name__ == "__main__":
    main()

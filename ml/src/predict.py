import json
import os

import joblib
import numpy as np

from .features import FEATURE_DESCRIPTIONS, FEATURE_NAMES, features_vector

_BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_MODEL_PATH = os.path.join(_BASE, "models", "phishing_model.pkl")
_META_PATH = os.path.join(_BASE, "models", "model_meta.json")

_model = None
_meta = None


def load_model():
    global _model, _meta
    _model = joblib.load(_MODEL_PATH)
    with open(_META_PATH) as f:
        _meta = json.load(f)
    return _meta


def _contributions(x: np.ndarray) -> np.ndarray:
    """Per-feature push towards 'phishing'. Traceable to the real model:
    - Logistic regression: coefficient * standardised value (exact contribution to the logit)
    - Random forest: global feature importance * z-score (a documented HEURISTIC, not SHAP)
    """
    if hasattr(_model, "named_steps"):  # pipeline(scaler, logreg)
        scaler, clf = _model.named_steps["standardscaler"], _model.named_steps["logisticregression"]
        return clf.coef_[0] * scaler.transform([x])[0]
    mean, std = np.array(_meta["feature_mean"]), np.array(_meta["feature_std"])
    return _model.feature_importances_ * ((x - mean) / std)


def predict_url(url: str, top_k: int = 3) -> dict:
    if _model is None:
        load_model()
    x = np.array(features_vector(url), dtype=float)
    risk = float(_model.predict_proba([x])[0][1])
    is_bad = risk >= _meta.get("threshold", 0.5)

    explanation = []
    if is_bad:
        contrib = _contributions(x)
        for i in np.argsort(contrib)[::-1][:top_k]:
            if contrib[i] > 0:
                explanation.append(FEATURE_DESCRIPTIONS[FEATURE_NAMES[i]])

    return {
        "isMalicious": bool(is_bad),
        "riskScore": round(risk, 4),
        "modelVersion": _meta["version"],
        "explanation": explanation,
    }

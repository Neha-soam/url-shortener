"""Tiny HTTP wrapper so the Node backend can call the model. POST /predict {"url": "..."}"""
from flask import Flask, jsonify, request

from .predict import load_model, predict_url

app = Flask(__name__)
META = load_model()  # fail at startup if no trained model exists


@app.get("/health")
def health():
    return jsonify(status="ok", modelVersion=META["version"])


@app.post("/predict")
def predict():
    body = request.get_json(silent=True) or {}
    url = body.get("url")
    if not isinstance(url, str) or not url or len(url) > 2048:
        return jsonify(error="'url' (string, <=2048 chars) is required"), 400
    return jsonify(predict_url(url))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)

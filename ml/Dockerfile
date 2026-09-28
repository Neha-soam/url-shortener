FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY src ./src
RUN mkdir -p data/raw data/processed models
EXPOSE 5001
# If no trained model exists, train on the SYNTHETIC placeholder data so the stack boots.
# Replace with a real dataset before reporting any results (see docs/ml-report.md).
CMD ["sh", "-c", "[ -f models/phishing_model.pkl ] || (python -m src.make_sample_data && python -m src.train --version v0-synthetic); gunicorn -b 0.0.0.0:5001 src.server:app"]

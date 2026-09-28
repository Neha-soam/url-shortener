# ML report  (TEMPLATE -- fill in with REAL results)

> The repo ships a **synthetic** generator only so the pipeline runs. Perfect scores on it mean nothing.

1. **Dataset:** source(s), size, class balance, collection date, cleaning steps, dedupe.
2. **Features:** see `ml/src/features.py` (18 lexical URL features, no network access).
3. **Split:** 60/20/20 stratified train/val/test; test set used once.
4. **Imbalance handling:** `class_weight='balanced'` (compare with resampling if time permits).
5. **Candidates & validation metrics:** table of precision / recall / F1 for each model.
6. **Validation gate:** recall ≥ 0.85, precision ≥ 0.80, F1 ≥ 0.85 (tune and justify). Discuss false negatives vs false positives.
7. **Test metrics** for the chosen model + confusion matrix.
8. **Adversarial tests:** homograph/punycode domains, chained shorteners, long benign URLs, benign URLs with "login" in the path. Use `python -m src.evaluate --data <csv>`.
9. **Explainability method:** logistic regression → coef × standardised value (exact); random forest → importance × z-score (heuristic, not SHAP).
10. **Limitations:** URL-only features, dataset bias, concept drift, evasion.

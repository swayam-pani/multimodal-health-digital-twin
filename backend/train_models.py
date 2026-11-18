import os
import joblib
import numpy as np
import xgboost as xgb
from sklearn.preprocessing import StandardScaler

def train_and_serialize_models(output_dir=None, n_samples=1500, random_seed=42):
    """
    Trains and saves the XGBoost spike predictor and risk tier classifier.
    """
    if output_dir is None:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        output_dir = os.path.join(base_dir, "models")
    os.makedirs(output_dir, exist_ok=True)

    np.random.seed(random_seed)

    # Synthetic multi-modal physiological dataset
    carbs = np.random.uniform(10, 120, n_samples)
    gi = np.random.uniform(30, 95, n_samples)
    fiber = np.random.uniform(0, 15, n_samples)
    protein = np.random.uniform(5, 55, n_samples)
    baseline_G = np.random.normal(95, 12, n_samples)
    sleep = np.random.uniform(4, 9, n_samples)
    hrv = np.random.uniform(25, 85, n_samples)
    activity = np.random.uniform(0, 90, n_samples)

    X = np.column_stack([carbs, gi, fiber, protein, baseline_G, sleep, hrv, activity])
    y_peak = np.clip(
        baseline_G + (carbs * gi / 100.0) * 0.88 - fiber * 2.2 - activity * 0.28 - (sleep - 6.5) * 2.2 + np.random.normal(0, 4.0, n_samples),
        80, 260
    )
    risk_score = (y_peak / 140.0) * 0.4 + (100 - hrv) / 100.0 * 0.3 + (7.5 - sleep) * 0.15 + (baseline_G - 90) * 0.15
    y_risk = np.where(risk_score > 1.25, 2, np.where(risk_score > 0.95, 1, 0))

    split = int(n_samples * 0.8)
    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X[:split])

    # 1. Train Spike Regressor
    spike_model = xgb.XGBRegressor(
        n_estimators=160,
        learning_rate=0.05,
        max_depth=5,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=random_seed
    )
    spike_model.fit(X_train_s, y_peak[:split])
    spike_path = os.path.join(output_dir, "spike_regressor.json")
    spike_model.save_model(spike_path)

    # 2. Train Risk Classifier
    risk_model = xgb.XGBClassifier(
        n_estimators=140,
        learning_rate=0.05,
        max_depth=4,
        random_state=random_seed,
        eval_metric='mlogloss'
    )
    risk_model.fit(X_train_s, y_risk[:split])
    risk_path = os.path.join(output_dir, "risk_classifier.json")
    risk_model.save_model(risk_path)

    # 3. Save Scaler
    scaler_path = os.path.join(output_dir, "scaler.joblib")
    joblib.dump(scaler, scaler_path)

    print(f"[+] Serialized model artifacts to: {output_dir}")
    print(f"    - Spike Regressor: {spike_path}")
    print(f"    - Risk Classifier: {risk_path}")
    print(f"    - Scaler: {scaler_path}")

if __name__ == "__main__":
    train_and_serialize_models()

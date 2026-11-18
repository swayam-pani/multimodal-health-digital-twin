import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from sklearn.preprocessing import StandardScaler

try:
    import xgboost as xgb
    HAS_XGBOOST = True
except ImportError:
    HAS_XGBOOST = False

def run_evaluation():
    print("=" * 70)
    print("HEALTH DIGITAL TWIN: PREDICTIVE ARCHITECTURE EVALUATION")
    print("Comparing XGBoost vs Random Forest vs Ridge Regression")
    print("=" * 70)

#  *********************************************
    np.random.seed(42)
    n_samples = 1500

    carbs = np.random.uniform(10, 120, n_samples)
    gi = np.random.uniform(30, 95, n_samples)
    fiber = np.random.uniform(0, 15, n_samples)
    protein = np.random.uniform(5, 50, n_samples)
    baseline_G = np.random.normal(95, 12, n_samples)
    sleep = np.random.uniform(4, 9, n_samples)
    hrv = np.random.uniform(25, 85, n_samples)
    activity = np.random.uniform(0, 90, n_samples)

    X = np.column_stack([carbs, gi, fiber, protein, baseline_G, sleep, hrv, activity])
    
    # Non-linear physical target
    y_peak = (
        baseline_G 
        + (carbs * gi / 100.0) * 0.85 
        - fiber * 2.1 
        - activity * 0.25 
        - (sleep - 6) * 2.5 
        + np.random.normal(0, 4.5, n_samples)
    )

    split = int(n_samples * 0.8)
    X_train, X_test = X[:split], X[split:]
    y_train, y_test = y_peak[:split], y_peak[split:]
#  *****************************************************************
    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_test_s = scaler.transform(X_test)
#  *********************************************************************
    # 1. XGBoost Model
    if HAS_XGBOOST:
        xgb_model = xgb.XGBRegressor(n_estimators=150, learning_rate=0.05, max_depth=5, random_state=42)
        xgb_model.fit(X_train_s, y_train)
        xgb_preds = xgb_model.predict(X_test_s)
        xgb_r2 = r2_score(y_test, xgb_preds)
        xgb_mae = mean_absolute_error(y_test, xgb_preds)
        xgb_rmse = np.sqrt(mean_squared_error(y_test, xgb_preds))
    else:
        xgb_r2, xgb_mae, xgb_rmse = "N/A", "N/A", "N/A"

    # 2. Random Forest Model
    rf_model = RandomForestRegressor(n_estimators=150, random_state=42)
    rf_model.fit(X_train_s, y_train)
    rf_preds = rf_model.predict(X_test_s)
    rf_r2 = r2_score(y_test, rf_preds)
    rf_mae = mean_absolute_error(y_test, rf_preds)
    rf_rmse = np.sqrt(mean_squared_error(y_test, rf_preds))

    # 3. Ridge Linear Model
    ridge_model = Ridge(alpha=1.0)
    ridge_model.fit(X_train_s, y_train)
    ridge_preds = ridge_model.predict(X_test_s)
    ridge_r2 = r2_score(y_test, ridge_preds)
    ridge_mae = mean_absolute_error(y_test, ridge_preds)
    ridge_rmse = np.sqrt(mean_squared_error(y_test, ridge_preds))
# ************************************************************************
# cd "d:\Project 1\backend"
# python evaluate_models.py
    metrics_df = pd.DataFrame([
        {"Architecture": "XGBoost (eXtreme Gradient Boosting)", "R2 Score": f"{xgb_r2:.4f}" if HAS_XGBOOST else "N/A", "MAE (mg/dL)": f"{xgb_mae:.2f}" if HAS_XGBOOST else "N/A", "RMSE": f"{xgb_rmse:.2f}" if HAS_XGBOOST else "N/A"},
        {"Architecture": "Random Forest Regressor", "R2 Score": f"{rf_r2:.4f}", "MAE (mg/dL)": f"{rf_mae:.2f}", "RMSE": f"{rf_rmse:.2f}"},
        {"Architecture": "Ridge Baseline Linear Model", "R2 Score": f"{ridge_r2:.4f}", "MAE (mg/dL)": f"{ridge_mae:.2f}", "RMSE": f"{ridge_rmse:.2f}"}
    ])

    print("\nBENCHMARK RESULTS TABLE:")
    print(metrics_df.to_string(index=False))
    print("=" * 70)

if __name__ == "__main__":
    run_evaluation()

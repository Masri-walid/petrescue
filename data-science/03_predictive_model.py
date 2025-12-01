"""
Predictive Modeling Script
PetRescue Connect - Adoption Likelihood Prediction

This script:
1. Prepares features for machine learning
2. Trains and evaluates multiple models
3. Selects the best model based on performance
4. Saves the trained model for inference
"""

import pandas as pd
import numpy as np
from pathlib import Path
import joblib
import warnings
warnings.filterwarnings('ignore')

from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (accuracy_score, precision_score, recall_score, 
                            f1_score, roc_auc_score, classification_report,
                            confusion_matrix)

try:
    from xgboost import XGBClassifier
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False
    print("XGBoost not available, using alternative models")

# Configuration
DATA_DIR = Path(__file__).parent / 'data'
PROCESSED_DATA_PATH = DATA_DIR / 'processed'
MODEL_DIR = Path(__file__).parent / 'models'


def load_data():
    """Load processed data for modeling."""
    data_path = PROCESSED_DATA_PATH / 'adoption_data_cleaned.csv'
    
    if not data_path.exists():
        raise FileNotFoundError(
            f"Processed data not found at {data_path}. "
            "Please run 01_data_cleaning.py first."
        )
    
    df = pd.read_csv(data_path)
    print(f"Loaded {len(df)} records for modeling")
    return df


def prepare_features(df):
    """Prepare features for machine learning."""
    print("\n--- Feature Preparation ---")
    
    # Define feature columns based on PetRescue Connect schema
    categorical_features = ['species', 'gender', 'size', 'color', 'breed']
    numeric_features = ['estimated_age']
    boolean_features = ['is_vaccinated', 'is_spayed_neutered']
    
    # Additional features if available
    optional_numeric = ['adoption_fee', 'time_in_shelter', 'days_in_shelter', 'weight']
    
    # Filter to available columns
    available_categorical = [c for c in categorical_features if c in df.columns]
    available_numeric = [c for c in numeric_features if c in df.columns]
    available_numeric += [c for c in optional_numeric if c in df.columns]
    available_boolean = [c for c in boolean_features if c in df.columns]
    
    print(f"Categorical features: {available_categorical}")
    print(f"Numeric features: {available_numeric}")
    print(f"Boolean features: {available_boolean}")
    
    # Create feature dataframe
    X = pd.DataFrame()
    
    # Encode categorical features
    label_encoders = {}
    for col in available_categorical:
        le = LabelEncoder()
        X[col] = le.fit_transform(df[col].astype(str))
        label_encoders[col] = le
    
    # Add numeric features
    for col in available_numeric:
        X[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
    
    # Add boolean features
    for col in available_boolean:
        X[col] = df[col].map({True: 1, False: 0, 'True': 1, 'False': 0}).fillna(0).astype(int)
    
    # Target variable
    if 'adopted' not in df.columns:
        raise ValueError("Target variable 'adopted' not found in data")
    
    y = df['adopted'].astype(int)
    
    print(f"\nFeature matrix shape: {X.shape}")
    print(f"Target distribution: {y.value_counts().to_dict()}")
    
    return X, y, label_encoders


def train_models(X_train, X_test, y_train, y_test):
    """Train and evaluate multiple models."""
    print("\n--- Model Training ---")
    
    models = {
        'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42),
        'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
        'Gradient Boosting': GradientBoostingClassifier(n_estimators=100, random_state=42),
    }
    
    if XGBOOST_AVAILABLE:
        models['XGBoost'] = XGBClassifier(n_estimators=100, random_state=42, 
                                          use_label_encoder=False, eval_metric='logloss')
    
    results = {}
    
    for name, model in models.items():
        print(f"\nTraining {name}...")
        model.fit(X_train, y_train)
        
        # Predictions
        y_pred = model.predict(X_test)
        y_prob = model.predict_proba(X_test)[:, 1]
        
        # Metrics
        results[name] = {
            'model': model,
            'accuracy': accuracy_score(y_test, y_pred),
            'precision': precision_score(y_test, y_pred, zero_division=0),
            'recall': recall_score(y_test, y_pred, zero_division=0),
            'f1': f1_score(y_test, y_pred, zero_division=0),
            'roc_auc': roc_auc_score(y_test, y_prob),
        }
        
        print(f"  Accuracy: {results[name]['accuracy']:.4f}")
        print(f"  Precision: {results[name]['precision']:.4f}")
        print(f"  Recall: {results[name]['recall']:.4f}")
        print(f"  F1 Score: {results[name]['f1']:.4f}")
        print(f"  ROC AUC: {results[name]['roc_auc']:.4f}")
    
    return results


def select_best_model(results):
    """Select the best model based on ROC AUC score."""
    print("\n--- Model Selection ---")
    
    # Sort by ROC AUC
    sorted_results = sorted(results.items(), key=lambda x: x[1]['roc_auc'], reverse=True)
    
    print("\nModel Rankings (by ROC AUC):")
    for i, (name, metrics) in enumerate(sorted_results, 1):
        print(f"  {i}. {name}: {metrics['roc_auc']:.4f}")
    
    best_name, best_metrics = sorted_results[0]
    print(f"\nBest Model: {best_name}")

    return best_name, best_metrics['model']


def tune_hyperparameters(model, X_train, y_train, model_name):
    """Perform hyperparameter tuning for the best model."""
    print(f"\n--- Hyperparameter Tuning for {model_name} ---")

    param_grids = {
        'Random Forest': {
            'n_estimators': [50, 100, 200],
            'max_depth': [5, 10, 15, None],
            'min_samples_split': [2, 5, 10],
        },
        'Gradient Boosting': {
            'n_estimators': [50, 100, 200],
            'max_depth': [3, 5, 7],
            'learning_rate': [0.01, 0.1, 0.2],
        },
        'XGBoost': {
            'n_estimators': [50, 100, 200],
            'max_depth': [3, 5, 7],
            'learning_rate': [0.01, 0.1, 0.2],
        },
        'Logistic Regression': {
            'C': [0.01, 0.1, 1, 10],
            'penalty': ['l2'],
        }
    }

    if model_name not in param_grids:
        print(f"No parameter grid defined for {model_name}. Skipping tuning.")
        return model

    grid_search = GridSearchCV(
        model, param_grids[model_name], cv=5, scoring='roc_auc', n_jobs=-1
    )

    print("Running grid search (this may take a few minutes)...")
    grid_search.fit(X_train, y_train)

    print(f"Best parameters: {grid_search.best_params_}")
    print(f"Best CV ROC AUC: {grid_search.best_score_:.4f}")

    return grid_search.best_estimator_


def get_feature_importance(model, feature_names):
    """Extract feature importance from the model."""
    print("\n--- Feature Importance ---")

    if hasattr(model, 'feature_importances_'):
        importances = model.feature_importances_
    elif hasattr(model, 'coef_'):
        importances = np.abs(model.coef_[0])
    else:
        print("Model does not support feature importance extraction")
        return None

    importance_df = pd.DataFrame({
        'feature': feature_names,
        'importance': importances
    }).sort_values('importance', ascending=False)

    print("\nTop Features:")
    for _, row in importance_df.head(10).iterrows():
        print(f"  {row['feature']}: {row['importance']:.4f}")

    return importance_df


def save_model(model, scaler, label_encoders, feature_names, metrics):
    """Save the trained model and associated artifacts."""
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    # Save model
    model_path = MODEL_DIR / 'adoption_model.joblib'
    joblib.dump(model, model_path)
    print(f"\nModel saved to: {model_path}")

    # Save scaler
    scaler_path = MODEL_DIR / 'scaler.joblib'
    joblib.dump(scaler, scaler_path)
    print(f"Scaler saved to: {scaler_path}")

    # Save label encoders
    encoders_path = MODEL_DIR / 'label_encoders.joblib'
    joblib.dump(label_encoders, encoders_path)
    print(f"Label encoders saved to: {encoders_path}")

    # Save feature names
    features_path = MODEL_DIR / 'feature_names.joblib'
    joblib.dump(feature_names, features_path)
    print(f"Feature names saved to: {features_path}")

    # Save model info
    info_path = MODEL_DIR / 'model_info.txt'
    with open(info_path, 'w') as f:
        f.write("Adoption Likelihood Prediction Model\n")
        f.write("=" * 50 + "\n\n")
        f.write(f"Model Type: {type(model).__name__}\n")
        f.write(f"Features: {feature_names}\n\n")
        f.write("Performance Metrics:\n")
        for metric, value in metrics.items():
            if metric != 'model':
                f.write(f"  {metric}: {value:.4f}\n")

    print(f"Model info saved to: {info_path}")


def main():
    """Main modeling pipeline."""
    print("=" * 60)
    print("PetRescue Connect - Predictive Model Training")
    print("=" * 60)

    try:
        # Load data
        df = load_data()

        # Prepare features
        X, y, label_encoders = prepare_features(df)
        feature_names = list(X.columns)

        # Scale features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        X_scaled = pd.DataFrame(X_scaled, columns=feature_names)

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42, stratify=y
        )

        print(f"\nTraining set: {len(X_train)} samples")
        print(f"Test set: {len(X_test)} samples")

        # Train models
        results = train_models(X_train, X_test, y_train, y_test)

        # Select best model
        best_name, best_model = select_best_model(results)

        # Hyperparameter tuning (optional - can be slow)
        # best_model = tune_hyperparameters(best_model, X_train, y_train, best_name)

        # Feature importance
        importance_df = get_feature_importance(best_model, feature_names)

        # Save importance to file
        if importance_df is not None:
            MODEL_DIR.mkdir(parents=True, exist_ok=True)
            importance_df.to_csv(MODEL_DIR / 'feature_importance.csv', index=False)

        # Save model and artifacts
        save_model(best_model, scaler, label_encoders, feature_names, results[best_name])

        print("\n" + "=" * 60)
        print("Model training completed successfully!")
        print("=" * 60)

        return best_model, scaler, label_encoders

    except Exception as e:
        print(f"\nError during model training: {e}")
        raise


if __name__ == "__main__":
    main()


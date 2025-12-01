"""
Prediction API for Adoption Likelihood
PetRescue Connect - Integration with ML Service

This script provides:
1. Flask endpoints for predicting adoption likelihood
2. Integration with PostgreSQL database to update animal records
3. Batch prediction capabilities for all animals

Features used: species, gender, color, breed, age
"""

import numpy as np
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import psycopg2
from psycopg2.extras import RealDictCursor
import warnings
warnings.filterwarnings('ignore')

# Configuration
MODEL_DIR = Path(__file__).parent / 'models'
app = Flask(__name__)
CORS(app)

# Feature configuration - only use these 5 features
REQUIRED_FEATURES = ['species', 'gender', 'color', 'breed', 'estimated_age']

# Default adoption likelihood weights (used when no model is trained)
# Based on general pet adoption statistics
DEFAULT_WEIGHTS = {
    'species': {'dog': 85, 'cat': 75, 'rabbit': 60, 'bird': 55, 'other': 45},
    'gender': {'female': 5, 'male': 0, 'unknown': -5},
    'age_bonus': lambda age: max(0, 20 - abs(age - 24) * 0.5) if age else 10,  # Peak at 2 years
}


# Database connection
def get_db_connection():
    return psycopg2.connect(
        host="localhost",
        database="petrescue",
        user="postgres",
        password="123",
        port="5432"
    )


def load_model_artifacts():
    """Load the trained model and associated artifacts."""
    global model, scaler, label_encoders, feature_names, model_loaded

    model_path = MODEL_DIR / 'adoption_model.joblib'
    scaler_path = MODEL_DIR / 'scaler.joblib'
    encoders_path = MODEL_DIR / 'label_encoders.joblib'
    features_path = MODEL_DIR / 'feature_names.joblib'

    if not model_path.exists():
        print("Model not found. Using rule-based prediction.")
        model_loaded = False
        return False

    try:
        model = joblib.load(model_path)
        scaler = joblib.load(scaler_path)
        label_encoders = joblib.load(encoders_path)
        feature_names = joblib.load(features_path)
        model_loaded = True

        print(f"Loaded model: {type(model).__name__}")
        print(f"Features: {feature_names}")

        return True
    except Exception as e:
        print(f"Failed to load model: {e}")
        print("Using rule-based prediction instead.")
        model_loaded = False
        return False


def calculate_rule_based_likelihood(animal_data):
    """Calculate adoption likelihood using rule-based approach when no model is available."""
    base_score = 50  # Start at 50%

    # Species bonus
    species = (animal_data.get('species') or 'other').lower()
    base_score = DEFAULT_WEIGHTS['species'].get(species, 45)

    # Gender adjustment
    gender = (animal_data.get('gender') or 'unknown').lower()
    base_score += DEFAULT_WEIGHTS['gender'].get(gender, 0)

    # Age adjustment (younger animals tend to be adopted faster, but not too young)
    age = animal_data.get('estimated_age') or animal_data.get('estimatedAge') or 12
    if isinstance(age, str):
        try:
            age = int(age)
        except:
            age = 12
    base_score += DEFAULT_WEIGHTS['age_bonus'](age)

    # Breed bonus (purebreds slightly higher)
    breed = animal_data.get('breed') or ''
    if breed and breed.lower() not in ['mixed', 'unknown', 'mix', '']:
        base_score += 5

    # Color adjustment (some colors are more popular)
    color = (animal_data.get('color') or '').lower()
    popular_colors = ['golden', 'white', 'orange', 'tan', 'brown']
    if any(c in color for c in popular_colors):
        base_score += 3

    # Clamp between 5 and 95
    return round(max(5, min(95, base_score)), 1)


def predict_adoption_likelihood(animal_data):
    """Predict adoption likelihood for a single animal."""
    # If model is loaded, use ML prediction
    if model_loaded and model is not None:
        try:
            features = prepare_animal_features(animal_data)
            X = np.array([[features.get(f, 0) for f in feature_names]])
            X_scaled = scaler.transform(X)
            probability = model.predict_proba(X_scaled)[0][1]
            # Convert numpy types to Python native types for JSON serialization
            return float(round(float(probability) * 100, 1))
        except Exception as e:
            print(f"ML prediction failed: {e}, falling back to rule-based")

    # Fallback to rule-based prediction
    return calculate_rule_based_likelihood(animal_data)


def prepare_animal_features(animal_data):
    """Prepare features from animal data for prediction."""
    features = {}
    categorical_features = ['species', 'gender', 'color', 'breed']

    for feat in feature_names:
        if feat in categorical_features and feat in label_encoders:
            value = animal_data.get(feat, 'unknown')
            if value is None:
                value = 'unknown'
            try:
                if value.lower() in label_encoders[feat].classes_:
                    features[feat] = label_encoders[feat].transform([value.lower()])[0]
                else:
                    features[feat] = 0
            except Exception:
                features[feat] = 0
        elif feat == 'estimated_age':
            age = animal_data.get('estimated_age') or animal_data.get('estimatedAge') or 12
            features[feat] = int(age) if age else 12
        else:
            features[feat] = 0

    return features


@app.route('/api/adoption-likelihood/predict', methods=['POST'])
def predict_single():
    """Predict adoption likelihood for a single animal."""
    try:
        animal_data = request.json
        
        if not animal_data:
            return jsonify({'error': 'No animal data provided'}), 400
        
        likelihood = predict_adoption_likelihood(animal_data)
        
        if likelihood is None:
            return jsonify({'error': 'Model not loaded'}), 500
        
        return jsonify({
            'adoption_likelihood': likelihood,
            'animal_id': animal_data.get('id'),
        })
        
    except Exception as e:
        print(f"Error in predict_single: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/adoption-likelihood/predict-batch', methods=['POST'])
def predict_batch():
    """Predict adoption likelihood for multiple animals."""
    try:
        animals = request.json
        
        if not animals or not isinstance(animals, list):
            return jsonify({'error': 'Expected a list of animals'}), 400
        
        results = []
        for animal in animals:
            likelihood = predict_adoption_likelihood(animal)
            results.append({
                'animal_id': animal.get('id'),
                'adoption_likelihood': likelihood,
            })
        
        return jsonify({'predictions': results})

    except Exception as e:
        print(f"Error in predict_batch: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/adoption-likelihood/update-all', methods=['POST'])
def update_all_animals():
    """Update adoption likelihood for all animals in the database."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        # Fetch all animals
        cursor.execute("""
            SELECT id, species, breed, estimated_age, gender, size, color,
                   is_spayed_neutered, vaccination_status, adoption_fee
            FROM animals
            WHERE status IN ('available', 'in_care', 'rescued')
        """)
        animals = cursor.fetchall()

        if not animals:
            return jsonify({'message': 'No animals found to update', 'updated': 0})

        updated_count = 0

        for animal in animals:
            likelihood = predict_adoption_likelihood(dict(animal))

            if likelihood is not None:
                cursor.execute("""
                    UPDATE animals
                    SET adoption_likelihood = %s, updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                """, (likelihood, animal['id']))
                updated_count += 1

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            'message': f'Updated {updated_count} animals',
            'updated': updated_count,
            'total': len(animals)
        })

    except Exception as e:
        print(f"Error in update_all_animals: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/adoption-likelihood/animal/<animal_id>', methods=['GET'])
def get_animal_likelihood(animal_id):
    """Get adoption likelihood for a specific animal from the database."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute("""
            SELECT id, name, species, breed, estimated_age, gender, size, color,
                   is_spayed_neutered, vaccination_status, adoption_fee, adoption_likelihood
            FROM animals
            WHERE id = %s
        """, (animal_id,))

        animal = cursor.fetchone()
        cursor.close()
        conn.close()

        if not animal:
            return jsonify({'error': 'Animal not found'}), 404

        # If likelihood not calculated, calculate now
        if animal['adoption_likelihood'] is None:
            likelihood = predict_adoption_likelihood(dict(animal))
        else:
            likelihood = float(animal['adoption_likelihood'])

        return jsonify({
            'animal_id': str(animal['id']),
            'name': animal['name'],
            'adoption_likelihood': likelihood,
            'cached': animal['adoption_likelihood'] is not None
        })

    except Exception as e:
        print(f"Error in get_animal_likelihood: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/adoption-likelihood/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    model_loaded = model is not None
    return jsonify({
        'status': 'healthy',
        'model_loaded': model_loaded,
        'features': feature_names if model_loaded else None
    })


# Initialize model on startup
model = None
scaler = None
label_encoders = None
feature_names = None
model_loaded = False


def initialize():
    """Initialize the prediction service."""
    global model_loaded
    success = load_model_artifacts()
    if not success:
        print("=" * 50)
        print("Using RULE-BASED prediction (no ML model found)")
        print("To use ML model, run the training pipeline:")
        print("  1. python 01_data_cleaning.py")
        print("  2. python 02_exploratory_analysis.py")
        print("  3. python 03_predictive_model.py")
        print("=" * 50)
    else:
        print("=" * 50)
        print("Using ML MODEL for predictions")
        print("=" * 50)


if __name__ == '__main__':
    initialize()
    print("\nStarting Adoption Likelihood Prediction API on port 5002...")
    app.run(host='0.0.0.0', port=5002, debug=True)


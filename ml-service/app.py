from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from PIL import Image
import io
import psycopg2
from psycopg2.extras import RealDictCursor
import torch
from torchvision import models, transforms
from sklearn.metrics.pairwise import cosine_similarity
import base64

app = Flask(__name__)
CORS(app)

# Load pre-trained ResNet model for feature extraction
model = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
model.eval()
# Remove the final classification layer to get embeddings
model = torch.nn.Sequential(*list(model.children())[:-1])

# Image preprocessing pipeline
preprocess = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

# Database connection
def get_db_connection():
    return psycopg2.connect(
        host="localhost",
        database="petrescue",
        user="postgres",
        password="123",
        port="5432"
    )

def extract_features(image_bytes):
    """Extract feature vector from image using ResNet50"""
    try:
        # Convert bytes to PIL Image
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')

        # Preprocess and extract features
        input_tensor = preprocess(image).unsqueeze(0)

        with torch.no_grad():
            features = model(input_tensor)

        # Flatten to 1D vector
        features = features.squeeze().numpy()
        return features
    except Exception as e:
        print(f"Error extracting features: {e}")
        return None


def compute_characteristics(image_bytes):
    """Compute simple, high-level characteristics for a photo."""
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        # Resize to speed up processing
        small = image.resize((64, 64))
        arr = np.array(small).reshape(-1, 3).astype(float)

        # Average color and brightness
        mean_color = arr.mean(axis=0)
        r, g, b = mean_color
        brightness = (r + g + b) / (3.0 * 255.0)

        if brightness < 0.33:
            brightness_label = "dark"
        elif brightness < 0.66:
            brightness_label = "medium"
        else:
            brightness_label = "bright"

        # Simple dominant color estimation based on distance to a small palette
        palette = {
            "black": np.array([0, 0, 0]),
            "white": np.array([255, 255, 255]),
            "gray": np.array([128, 128, 128]),
            "brown": np.array([120, 72, 0]),
            "red": np.array([200, 40, 40]),
            "orange": np.array([230, 120, 40]),
            "yellow": np.array([230, 230, 80]),
            "green": np.array([60, 180, 75]),
            "blue": np.array([60, 120, 200]),
        }

        distances = {name: np.linalg.norm(mean_color - value) for name, value in palette.items()}
        dominant_color = min(distances, key=distances.get)

        max_distance = np.linalg.norm(np.array([255, 255, 255]))
        color_confidence = float(1.0 - min(distances.values()) / max_distance) if max_distance > 0 else 0.0

        characteristics = [
            {
                "name": "dominant_color",
                "value": dominant_color,
                "confidence": max(0.0, min(1.0, color_confidence)),
            },
            {
                "name": "brightness",
                "value": brightness_label,
                "confidence": 1.0,
            },
        ]

        return characteristics
    except Exception as e:
        print(f"Error computing characteristics: {e}")
        return []


@app.route('/api/compare-photo', methods=['POST'])
def compare_photo():
    """Compare uploaded photo with all rescue report and animal photos."""
    try:
        # Get uploaded image
        if 'photo' not in request.files:
            return jsonify({'error': 'No photo provided'}), 400

        uploaded_file = request.files['photo']
        uploaded_bytes = uploaded_file.read()

        # Extract features from uploaded image
        uploaded_features = extract_features(uploaded_bytes)
        if uploaded_features is None:
            return jsonify({'error': 'Failed to process uploaded image'}), 400

        # Get threshold from request (default 0.7 = 70% similarity)
        threshold_raw = request.form.get('threshold')
        if threshold_raw is None or threshold_raw == "":
            threshold = 0.7
        else:
            try:
                threshold = float(str(threshold_raw).replace(',', '.'))
            except Exception:
                threshold = 0.7

        # Helper to get raw image bytes from DB row (photo_data or base64 data URL)
        def get_image_bytes(row, data_key='photo_data', url_key='photo_url'):
            data = row.get(data_key)
            if data is not None:
                try:
                    return bytes(data)
                except Exception as e:
                    print(f"Error reading binary photo data: {e}")

            url = row.get(url_key)
            if isinstance(url, str) and url.startswith('data:') and ';base64,' in url:
                try:
                    base64_data = url.split(',', 1)[1]
                    return base64.b64decode(base64_data)
                except Exception as e:
                    print(f"Error decoding base64 photo data URL: {e}")

            return None

        # Fetch all rescue report photos from database
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        rescue_query = """
            SELECT
                rrp.id as photo_id,
                rrp.photo_data,
                rrp.photo_url,
                rrp.rescue_report_id,
                rr.animal_type,
                rr.location_address,
                rr.description,
                rr.urgency_level,
                rr.status,
                rr.created_at
            FROM rescue_report_photos rrp
            JOIN rescue_reports rr ON rrp.rescue_report_id = rr.id
            WHERE rr.status IN ('reported', 'assigned', 'in_progress')
            ORDER BY rr.created_at DESC
        """

        cursor.execute(rescue_query)
        rescue_photos = cursor.fetchall()

        # Fetch all animal photos from database
        animal_query = """
            SELECT
                ap.id as photo_id,
                ap.photo_data,
                ap.photo_url,
                a.id as animal_id,
                a.name,
                a.species,
                a.color,
                a.status,
                a.description,
                o.name as organization_name,
                o.city,
                o.state
            FROM animal_photos ap
            JOIN animals a ON ap.animal_id = a.id
            LEFT JOIN organizations o ON a.organization_id = o.id
        """

        cursor.execute(animal_query)
        animal_photos = cursor.fetchall()

        # Compare with each rescue report and animal photo
        matches = []

        for photo in rescue_photos:
            image_bytes = get_image_bytes(photo)
            if image_bytes is None:
                continue

            db_features = extract_features(image_bytes)
            if db_features is None:
                continue

            similarity = cosine_similarity(
                uploaded_features.reshape(1, -1),
                db_features.reshape(1, -1)
            )[0][0]

            if similarity >= threshold:
                matches.append({
                    'type': 'rescue_report',
                    'rescue_report_id': str(photo['rescue_report_id']),
                    'photo_id': str(photo['photo_id']),
                    'similarity_score': float(similarity),
                    'animal_type': photo.get('animal_type'),
                    'location': photo.get('location_address'),
                    'description': photo.get('description'),
                    'urgency_level': photo.get('urgency_level'),
                    'status': photo.get('status'),
                    'created_at': photo.get('created_at').isoformat() if photo.get('created_at') else None,
                })

        for photo in animal_photos:
            image_bytes = get_image_bytes(photo)
            if image_bytes is None:
                continue

            db_features = extract_features(image_bytes)
            if db_features is None:
                continue

            similarity = cosine_similarity(
                uploaded_features.reshape(1, -1),
                db_features.reshape(1, -1)
            )[0][0]

            if similarity >= threshold:
                location_parts = []
                if photo.get('city'):
                    location_parts.append(photo['city'])
                if photo.get('state'):
                    location_parts.append(photo['state'])

                matches.append({
                    'type': 'animal',
                    'animal_id': str(photo['animal_id']),
                    'photo_id': str(photo['photo_id']),
                    'similarity_score': float(similarity),
                    'name': photo.get('name'),
                    'species': photo.get('species'),
                    'color': photo.get('color'),
                    'status': photo.get('status'),
                    'organization_name': photo.get('organization_name'),
                    'location': ', '.join(location_parts) if location_parts else None,
                })

        # Sort by similarity score (highest first)
        matches.sort(key=lambda x: x['similarity_score'], reverse=True)

        cursor.close()
        conn.close()

        total_compared = len(rescue_photos) + len(animal_photos)

        return jsonify({
            'matches': matches,
            'total_compared': total_compared,
            'matches_found': len(matches),
            'rescue_photos_compared': len(rescue_photos),
            'animal_photos_compared': len(animal_photos),
        })

    except Exception as e:
        print(f"Error in compare_photo: {e}")
        return jsonify({'error': str(e)}), 500



@app.route('/api/analyze-photo', methods=['POST'])
def analyze_photo():
    """Return embedding and simple characteristics for a single photo."""
    try:
        if 'photo' not in request.files:
            return jsonify({'error': 'No photo provided'}), 400

        uploaded_file = request.files['photo']
        uploaded_bytes = uploaded_file.read()

        embedding = extract_features(uploaded_bytes)
        if embedding is None:
            return jsonify({'error': 'Failed to process uploaded image'}), 400

        characteristics = compute_characteristics(uploaded_bytes)

        return jsonify({
            'embedding': embedding.tolist(),
            'characteristics': characteristics,
        })
    except Exception as e:
        print(f"Error in analyze_photo: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)


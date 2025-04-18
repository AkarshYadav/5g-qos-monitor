from flask import Flask, request, jsonify
import pickle
import pandas as pd
import numpy as np
from flask_cors import CORS
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS with default options

# Load the model and scaler
try:
    with open('D:/5GLab/5gqos/api/qos_xgb_model.pkl', 'rb') as f:
        model, scaler = pickle.load(f)
    logger.info("✅ Model and scaler loaded successfully")
except Exception as e:
    logger.error(f"❌ Error loading model or scaler: {e}")
    model, scaler = None, None

# Define preprocessing function (matching training script)
def process_input(data):
    try:
        df = pd.DataFrame([data])
        
        # Log incoming data
        logger.info(f"Received data: {df.to_dict(orient='records')[0]}")

        # Derive Hour from timestamp if not provided
        if 'Hour' not in df.columns and 'timestamp' in df.columns:
            df['Hour'] = pd.to_datetime(df['timestamp'], unit='s').dt.hour
            logger.info(f"Derived Hour: {df['Hour'].iloc[0]}")

        # Required features
        feature_cols = ['Latitude', 'Longitude', 'Altitude', 'speed_kmh', 'Hour',
                        'temperature', 'humidity', 'windSpeed', 'pressure', 'operator']

        # Check for missing features
        missing_features = [col for col in feature_cols if col not in df.columns]
        if missing_features:
            logger.warning(f"Missing features: {missing_features}")
            for col in missing_features:
                df[col] = 0  # Default value for missing features

        df_features = df[feature_cols].copy()
        df_features.fillna(0, inplace=True)
        
        # Log processed features
        logger.info(f"Processed features: {df_features.to_dict(orient='records')[0]}")

        # Scale features
        X_scaled = scaler.transform(df_features)
        return X_scaled
    except Exception as e:
        logger.error(f"Preprocessing error: {e}")
        raise ValueError(f"Preprocessing error: {e}")

@app.route('/predict', methods=['POST'])
def predict():
    if model is None or scaler is None:
        return jsonify({'error': 'Model or scaler not loaded properly'}), 500

    try:
        data = request.json
        logger.info("Received prediction request")

        # Required input keys
        required_keys = ['Latitude', 'Longitude', 'Altitude', 'speed_kmh',
                        'temperature', 'humidity', 'windSpeed', 'pressure', 'operator']
        
        # Check for timestamp - needed to derive Hour
        if 'timestamp' not in data and 'Hour' not in data:
            logger.warning("No timestamp or Hour provided, using current time")
            data['timestamp'] = int(datetime.now().timestamp())

        # Validate keys
        missing = [key for key in required_keys if key not in data]
        if missing:
            logger.warning(f"Missing keys in request: {missing}")
            return jsonify({'error': f'Missing keys: {missing}'}), 400

        # Process and predict
        X_input = process_input(data)
        prediction_log = model.predict(X_input)[0]
        throughput = np.expm1(prediction_log)  # Reverse log1p transform
        
        logger.info(f"Throughput prediction: {throughput}")

        return jsonify({
            'throughput': float(throughput),
            'unit': 'Mbps',
            'status': 'success',
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    health_status = {
        'status': 'healthy' if model is not None and scaler is not None else 'unhealthy',
        'message': 'API is running',
        'model_loaded': model is not None,
        'scaler_loaded': scaler is not None,
        'timestamp': datetime.now().isoformat()
    }
    return jsonify(health_status)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
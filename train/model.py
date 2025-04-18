import pandas as pd
import numpy as np
import pickle
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
from sklearn.preprocessing import OrdinalEncoder

# Function to process the data (for both train and test)
def process_data(df, encoder=None, is_train=True):
    df['Hour'] = pd.to_datetime(df['timestamp'], unit='s').dt.hour

    feature_cols = ['Latitude', 'Longitude', 'Altitude', 'speed_kmh', 'Hour',
                    'temperature', 'humidity', 'windSpeed', 'pressure', 'operator']
    df_features = df[feature_cols].copy()
    df_features.fillna(0, inplace=True)

    if is_train:
        encoder = OrdinalEncoder()
        df_features[['operator']] = encoder.fit_transform(df_features[['operator']])
    else:
        df_features[['operator']] = encoder.transform(df_features[['operator']])

    return df_features, encoder

# Load full dataset
df = pd.read_csv("Train.csv")

# Separate target variable
y = df['target']

# Process features
X, encoder = process_data(df, is_train=True)

# Split into training and validation sets
X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = GradientBoostingRegressor(random_state=42)
model.fit(X_train, y_train)

# Predict and evaluate on validation set
predictions = model.predict(X_val)
rmse = np.sqrt(mean_squared_error(y_val, predictions))
print(f"✅ Validation RMSE: {rmse:.4f}")

# Save model and encoder
model_filename = "qos_model_reduced.pkl"
with open(model_filename, "wb") as f:
    pickle.dump((model, encoder), f)

print(f"✅ Model saved to '{model_filename}'")

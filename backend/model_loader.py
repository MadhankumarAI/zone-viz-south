import joblib
import os
import logging
import numpy as np
import pandas as pd
from datetime import datetime

logger = logging.getLogger(__name__)

def safe_json_convert(obj):
    """Convert numpy types to JSON-serializable Python types"""
    if isinstance(obj, (np.integer, np.signedinteger)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float32, np.float64)):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, (np.bool_, np.bool8)):
        return bool(obj)
    elif isinstance(obj, np.string_):
        return str(obj)
    else:
        return obj

class ModelLoader:
    def __init__(self, model_path='model/model.joblib'):
        self.model_path = model_path
        self.model = None
        self.load_model()
    
    def load_model(self):
        """Load the pre-trained XGBoost model from joblib file"""
        try:
            if not os.path.exists(self.model_path):
                logger.error(f"Model file not found at {self.model_path}")
                raise FileNotFoundError(f"Model file not found at {self.model_path}")
            
            # Load model using joblib
            self.model = joblib.load(self.model_path)
            
            logger.info(f"Successfully loaded model from {self.model_path} using joblib")
            
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            raise
    
    def create_timestamp_dummies(self, timestamp_str):
        """Create timestamp dummy variables for the model"""
        # Initialize all timestamp dummies to 0
        timestamp_dummies = {
            'timestamp_2023-02-01': 0,
            'timestamp_2023-03-01': 0,
            'timestamp_2023-04-01': 0,
            'timestamp_2023-05-01': 0,
            'timestamp_2023-06-01': 0,
            'timestamp_2023-07-01': 0,
            'timestamp_2023-08-01': 0,
            'timestamp_2023-09-01': 0,
            'timestamp_2023-10-01': 0,
            'timestamp_2023-11-01': 0,
            'timestamp_2023-12-01': 0,
            'timestamp_2024-01-01': 0,
            'timestamp_2024-02-01': 0,
            'timestamp_2024-03-01': 0,
            'timestamp_2024-04-01': 0,
            'timestamp_2024-05-01': 0,
            'timestamp_2024-06-01': 0,
            'timestamp_2024-07-01': 0,
            'timestamp_2024-08-01': 0,
            'timestamp_2024-09-01': 0,
            'timestamp_2024-10-01': 0,
            'timestamp_2024-11-01': 0,
            'timestamp_2024-12-01': 0
        }
        
        # Extract year and month from timestamp
        try:
            if isinstance(timestamp_str, str):
                dt = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
            else:
                dt = timestamp_str
            
            # Create the timestamp key for this month
            timestamp_key = f"timestamp_{dt.year}-{dt.month:02d}-01"
            
            # Set the appropriate dummy to 1
            if timestamp_key in timestamp_dummies:
                timestamp_dummies[timestamp_key] = 1
                
        except Exception as e:
            logger.warning(f"Error processing timestamp {timestamp_str}: {e}")
            # Keep all dummies as 0 if there's an error
        
        return timestamp_dummies
    
    def predict_probability(self, features):
        """
        Predict the probability of illegal activity for given features
        
        Args:
            features: Dictionary with feature values
        
        Returns:
            float: Probability of illegal activity (0-1)
        """
        try:
            if self.model is None:
                raise ValueError("Model not loaded")
            
            # Create feature vector in the exact order expected by the model
            feature_vector = self.prepare_feature_vector(features)
            
            # Convert to DataFrame for prediction
            feature_df = pd.DataFrame([feature_vector])
            
            # Get prediction probability
            probabilities = self.model.predict_proba(feature_df)
            
            # Return probability of positive class (illegal)
            if probabilities.shape[1] > 1:
                return float(probabilities[0][1])  # Probability of class 1 (illegal)
            else:
                return float(probabilities[0][0])  # Single probability
                
        except Exception as e:
            logger.error(f"Error in prediction: {e}")
            return 0.0  # Default to legal in case of error
    
    def prepare_feature_vector(self, features):
        """Prepare feature vector in the exact order used by the model"""
        try:
            # Create timestamp dummies if timestamp is provided
            if 'timestamp' in features:
                timestamp_dummies = self.create_timestamp_dummies(features['timestamp'])
            else:
                # Use existing timestamp dummies from features
                timestamp_dummies = {}
                for key in features:
                    if key.startswith('timestamp_'):
                        timestamp_dummies[key] = features[key]
            
            # Create feature vector in exact training order (38 features)
            feature_vector = {
                'latitude': features.get('latitude', 0.0),
                'longitude': features.get('longitude', 0.0),
                'households': features.get('households', 0),
                'distance_to_substation_km': features.get('distance_to_substation_km', 0.0),
                'local_incident_reports': int(features.get('local_incident_reports', 0)),
                'year': features.get('year', 2024),
                'month': features.get('month', 1),
                'expected_consumption_kwh': features.get('expected_consumption_kwh', 0.0),
                'voltage_reading_v': features.get('voltage_reading_v', 220.0),
                'current_reading_a': features.get('current_reading_a', 0.0),
                'power_factor': features.get('power_factor', 0.8),
                'load_factor': features.get('load_factor', 0.6),
                'is_summer': int(features.get('is_summer', 0)),
                'is_monsoon': int(features.get('is_monsoon', 0)),
                'is_winter': int(features.get('is_winter', 1)),
                **timestamp_dummies
            }
            
            return feature_vector
            
        except Exception as e:
            logger.error(f"Error preparing feature vector: {e}")
            return {}
    
    def classify(self, features, threshold=0.08):
        """
        Classify the record as legal or illegal based on probability threshold
        
        Args:
            features: Dictionary with feature values
            threshold: Probability threshold for classification (default: 0.08, optimized for Kerala data)
        
        Returns:
            tuple: (classification, probability)
                - classification: 'legal' or 'illegal'
                - probability: float probability of illegal activity
        """
        try:
            probability = self.predict_probability(features)
            classification = 'illegal' if probability >= threshold else 'legal'
            return classification, probability
            
        except Exception as e:
            logger.error(f"Error in classification: {e}")
            return 'legal', 0.0
    
    def get_required_features(self):
        """
        Return the list of required features for the model in exact order
        """
        return [
            'latitude',
            'longitude', 
            'households',
            'distance_to_substation_km',
            'local_incident_reports',
            'year',
            'month',
            'expected_consumption_kwh',
            'voltage_reading_v',
            'current_reading_a',
            'power_factor',
            'load_factor',
            'is_summer',
            'is_monsoon',
            'is_winter',
            'timestamp_2023-02-01',
            'timestamp_2023-03-01',
            'timestamp_2023-04-01',
            'timestamp_2023-05-01',
            'timestamp_2023-06-01',
            'timestamp_2023-07-01',
            'timestamp_2023-08-01',
            'timestamp_2023-09-01',
            'timestamp_2023-10-01',
            'timestamp_2023-11-01',
            'timestamp_2023-12-01',
            'timestamp_2024-01-01',
            'timestamp_2024-02-01',
            'timestamp_2024-03-01',
            'timestamp_2024-04-01',
            'timestamp_2024-05-01',
            'timestamp_2024-06-01',
            'timestamp_2024-07-01',
            'timestamp_2024-08-01',
            'timestamp_2024-09-01',
            'timestamp_2024-10-01',
            'timestamp_2024-11-01',
            'timestamp_2024-12-01'
        ]
    
    def get_feature_importance(self):
        """Get feature importance from the model (if available)"""
        try:
            if self.model is None:
                return {}
                
            if hasattr(self.model, 'feature_importances_'):
                features = self.get_required_features()
                if len(features) != len(self.model.feature_importances_):
                    logger.warning(f"Feature count mismatch: expected {len(features)}, got {len(self.model.feature_importances_)}")
                    return {}
                
                # Convert numpy types to JSON-serializable types
                importance_values = [safe_json_convert(val) for val in self.model.feature_importances_]
                importance_dict = dict(zip(features, importance_values))
                
                # Sort by importance
                sorted_importance = dict(sorted(importance_dict.items(), 
                                               key=lambda x: x[1], reverse=True))
                return sorted_importance
            else:
                logger.info("Model does not have feature_importances_ attribute")
                return {}
                
        except Exception as e:
            logger.error(f"Error getting feature importance: {e}")
            return {}
    
    def model_info(self):
        """Get basic information about the loaded model"""
        try:
            if self.model is None:
                return {'error': 'Model not loaded', 'model_loaded': False}
                
            info = {
                'model_type': type(self.model).__name__,
                'model_loaded': True,
                'model_path': self.model_path,
                'required_features': self.get_required_features(),
                'feature_count': len(self.get_required_features())
            }
            
            # Add XGBoost-specific info if available with JSON serialization safety
            try:
                if hasattr(self.model, 'n_estimators'):
                    info['n_estimators'] = safe_json_convert(self.model.n_estimators)
                if hasattr(self.model, 'max_depth'):
                    info['max_depth'] = safe_json_convert(self.model.max_depth) if self.model.max_depth is not None else None
                if hasattr(self.model, 'learning_rate'):
                    info['learning_rate'] = safe_json_convert(self.model.learning_rate)
                if hasattr(self.model, 'random_state'):
                    info['random_state'] = safe_json_convert(self.model.random_state) if self.model.random_state is not None else None
                if hasattr(self.model, 'subsample'):
                    info['subsample'] = safe_json_convert(self.model.subsample)
                if hasattr(self.model, 'colsample_bytree'):
                    info['colsample_bytree'] = safe_json_convert(self.model.colsample_bytree)
            except Exception as e:
                logger.warning(f"Could not get model parameters: {e}")
                
            return info
            
        except Exception as e:
            logger.error(f"Error getting model info: {e}")
            return {'error': str(e), 'model_loaded': False}
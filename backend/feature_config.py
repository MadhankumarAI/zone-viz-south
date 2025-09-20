"""
Feature configuration for the power grid fraud detection model.
This file documents the feature mapping and data preprocessing rules.
"""

# Original dataset features
ORIGINAL_FEATURES = [
    'area_id', 'district', 'city', 'area_name', 'latitude', 'longitude',
    'area_type', 'households', 'distance_to_substation_km', 'local_incident_reports',
    'year', 'month', 'timestamp', 'expected_consumption_kwh', 'actual_consumption_kwh',
    'voltage_reading_v', 'current_reading_a', 'consumption_deviation_pct',
    'illegal_fence_suspected', 'power_factor', 'load_factor', 'consumption_per_household',
    'is_summer', 'is_monsoon', 'is_winter'
]

# Features used by the ML model (in exact order)
MODEL_FEATURES = [
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

# Timestamp dummy variables
TIMESTAMP_DUMMIES = [
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

# Feature data types and ranges (for validation)
FEATURE_SPECS = {
    'latitude': {'type': 'float', 'min': 6.0, 'max': 37.0},  # India bounds
    'longitude': {'type': 'float', 'min': 68.0, 'max': 97.0},  # India bounds
    'households': {'type': 'int', 'min': 1, 'max': 10000},
    'distance_to_substation_km': {'type': 'float', 'min': 0.1, 'max': 50.0},
    'local_incident_reports': {'type': 'int', 'min': 0, 'max': 1},  # Boolean as int
    'year': {'type': 'int', 'min': 2020, 'max': 2030},
    'month': {'type': 'int', 'min': 1, 'max': 12},
    'expected_consumption_kwh': {'type': 'float', 'min': 100, 'max': 100000},
    'voltage_reading_v': {'type': 'float', 'min': 180, 'max': 250},
    'current_reading_a': {'type': 'float', 'min': 1, 'max': 500},
    'power_factor': {'type': 'float', 'min': 0.5, 'max': 1.0},
    'load_factor': {'type': 'float', 'min': 0.1, 'max': 1.0},
    'is_summer': {'type': 'int', 'min': 0, 'max': 1},  # Boolean as int
    'is_monsoon': {'type': 'int', 'min': 0, 'max': 1},  # Boolean as int
    'is_winter': {'type': 'int', 'min': 0, 'max': 1}   # Boolean as int
}

# Sample data row (matching your provided example)
SAMPLE_DATA_ROW = {
    'area_id': 'KL_0000',
    'district': 'Kozhikode',
    'city': 'Kozhikode',
    'area_name': 'Kallathara',
    'latitude': 11.322288,
    'longitude': 76.231557,
    'area_type': 'semi-urban',
    'households': 35,
    'distance_to_substation_km': 3.56,
    'local_incident_reports': False,
    'year': 2023,
    'month': 1,
    'timestamp': '2023-01-01',
    'expected_consumption_kwh': 4886.85,
    'actual_consumption_kwh': 4886.85,
    'voltage_reading_v': 220.9,
    'current_reading_a': 30.88,
    'consumption_deviation_pct': 0.0,
    'illegal_fence_suspected': False,
    'power_factor': 0.789,
    'load_factor': 0.5585,
    'consumption_per_household': 139.62,
    'is_summer': False,
    'is_monsoon': False,
    'is_winter': True
}

def validate_features(features_dict):
    """Validate feature values against expected ranges"""
    errors = []
    
    for feature, value in features_dict.items():
        if feature in TIMESTAMP_DUMMIES:
            # Skip validation for timestamp dummies
            continue
            
        if feature not in FEATURE_SPECS:
            errors.append(f"Unknown feature: {feature}")
            continue
            
        spec = FEATURE_SPECS[feature]
        
        # Type check
        if spec['type'] == 'int' and not isinstance(value, (int, bool)):
            errors.append(f"{feature}: Expected int, got {type(value)}")
        elif spec['type'] == 'float' and not isinstance(value, (int, float)):
            errors.append(f"{feature}: Expected float, got {type(value)}")
            
        # Range check
        if isinstance(value, (int, float)):
            if value < spec['min'] or value > spec['max']:
                errors.append(f"{feature}: Value {value} outside range [{spec['min']}, {spec['max']}]")
    
    return errors

def create_timestamp_dummies(timestamp_str):
    """Create timestamp dummy variables from a timestamp string"""
    timestamp_features = {}
    
    # Initialize all dummies to 0
    for dummy in TIMESTAMP_DUMMIES:
        timestamp_features[dummy] = 0
    
    # Extract year and month from timestamp
    try:
        from datetime import datetime
        if isinstance(timestamp_str, str):
            dt = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
        else:
            dt = timestamp_str
        
        # Create the timestamp key for this month
        timestamp_key = f"timestamp_{dt.year}-{dt.month:02d}-01"
        
        # Set the appropriate dummy to 1
        if timestamp_key in timestamp_features:
            timestamp_features[timestamp_key] = 1
            
    except Exception as e:
        print(f"Error processing timestamp {timestamp_str}: {e}")
        # Keep all dummies as 0 if there's an error
    
    return timestamp_features

def preprocess_record(record):
    """Preprocess a data record for model input"""
    try:
        # Convert boolean fields to integers
        processed = record.copy()
        
        boolean_fields = ['local_incident_reports', 'is_summer', 'is_monsoon', 'is_winter']
        for field in boolean_fields:
            if field in processed:
                processed[field] = int(processed[field])
        
        # Create timestamp dummies
        timestamp_features = create_timestamp_dummies(processed.get('timestamp', '2023-01-01'))
        
        # Extract only the features used by the model
        model_input = {}
        
        # Add basic features
        basic_features = [
            'latitude', 'longitude', 'households', 'distance_to_substation_km',
            'local_incident_reports', 'year', 'month', 'expected_consumption_kwh',
            'voltage_reading_v', 'current_reading_a', 'power_factor', 'load_factor',
            'is_summer', 'is_monsoon', 'is_winter'
        ]
        
        for feature in basic_features:
            model_input[feature] = processed.get(feature, 0)
        
        # Add timestamp dummies
        model_input.update(timestamp_features)
        
        # Validate
        validation_errors = validate_features(model_input)
        if validation_errors:
            print(f"Validation warnings: {validation_errors}")
        
        return model_input
        
    except Exception as e:
        print(f"Error preprocessing record: {e}")
        return None

def get_feature_info():
    """Get comprehensive feature information"""
    return {
        'total_features': len(MODEL_FEATURES),
        'feature_names': MODEL_FEATURES,
        'basic_features': MODEL_FEATURES[:15],  # First 15 are basic features
        'timestamp_dummies': TIMESTAMP_DUMMIES,
        'feature_specifications': FEATURE_SPECS
    }
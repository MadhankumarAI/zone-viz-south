import random
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import logging
import os
from typing import Dict, List
from mongo_utils import MongoDBManager

logger = logging.getLogger(__name__)

class PowerGridSimulator:
    def __init__(self, model_loader, database):
        self.model_loader = model_loader
        self.db = database
        self.raw_data_collection = database.raw_data
        self.locations_collection = database.locations
        
        # Initialize MongoDB manager for clean model outputs
        self.mongo_manager = MongoDBManager()
        
        # Initialize locations if not exists
        self.initialize_locations()
        
        # Configuration - Lower threshold to catch more illegal cases
        self.classification_threshold = float(os.getenv('CLASSIFICATION_THRESHOLD', 0.15))
        
    def initialize_locations(self):
        """Initialize power grid locations in the database"""
        try:
            # Check if locations already exist
            if self.locations_collection.count_documents({}) > 0:
                logger.info("Locations already initialized")
                return
            
            # Sample locations data matching your dataset structure
            locations_data = [
                {
                    'area_id': 'KL_0001',
                    'district': 'Kozhikode',
                    'city': 'Kozhikode',
                    'area_name': 'Kallathara North',
                    'latitude': 11.322288,
                    'longitude': 76.231557,
                    'area_type': 'semi-urban',
                    'households': 35,
                    'distance_to_substation_km': 3.56
                },
                {
                    'area_id': 'KL_0002',
                    'district': 'Kochi',
                    'city': 'Kochi',
                    'area_name': 'Marine Drive',
                    'latitude': 9.9312,
                    'longitude': 76.2673,
                    'area_type': 'urban',
                    'households': 120,
                    'distance_to_substation_km': 1.8
                },
                {
                    'area_id': 'TN_0001',
                    'district': 'Chennai',
                    'city': 'Chennai',
                    'area_name': 'Anna Nagar',
                    'latitude': 13.0850,
                    'longitude': 80.2101,
                    'area_type': 'urban',
                    'households': 200,
                    'distance_to_substation_km': 2.1
                },
                {
                    'area_id': 'KA_0001',
                    'district': 'Bangalore',
                    'city': 'Bangalore',
                    'area_name': 'Electronic City',
                    'latitude': 12.8456,
                    'longitude': 77.6603,
                    'area_type': 'urban',
                    'households': 180,
                    'distance_to_substation_km': 4.2
                },
                {
                    'area_id': 'MH_0001',
                    'district': 'Mumbai',
                    'city': 'Mumbai',
                    'area_name': 'Bandra East',
                    'latitude': 19.0544,
                    'longitude': 72.8406,
                    'area_type': 'urban',
                    'households': 300,
                    'distance_to_substation_km': 2.7
                },
                {
                    'area_id': 'TN_0002',
                    'district': 'Coimbatore',
                    'city': 'Coimbatore', 
                    'area_name': 'Peelamedu',
                    'latitude': 11.0168,
                    'longitude': 76.9558,
                    'area_type': 'semi-urban',
                    'households': 85,
                    'distance_to_substation_km': 3.2
                },
                {
                    'area_id': 'KL_0003',
                    'district': 'Thiruvananthapuram',
                    'city': 'Thiruvananthapuram',
                    'area_name': 'Technopark',
                    'latitude': 8.5569,
                    'longitude': 76.8800,
                    'area_type': 'urban',
                    'households': 150,
                    'distance_to_substation_km': 5.1
                },
                {
                    'area_id': 'KA_0002',
                    'district': 'Mysore',
                    'city': 'Mysore',
                    'area_name': 'Vijayanagar',
                    'latitude': 12.3375,
                    'longitude': 76.6394,
                    'area_type': 'rural',
                    'households': 45,
                    'distance_to_substation_km': 6.8
                },
                {
                    'area_id': 'AP_0001',
                    'district': 'Hyderabad',
                    'city': 'Hyderabad',
                    'area_name': 'HITEC City',
                    'latitude': 17.4485,
                    'longitude': 78.3908,
                    'area_type': 'urban',
                    'households': 250,
                    'distance_to_substation_km': 3.9
                },
                {
                    'area_id': 'GJ_0001',
                    'district': 'Ahmedabad',
                    'city': 'Ahmedabad',
                    'area_name': 'Satellite',
                    'latitude': 23.0225,
                    'longitude': 72.5714,
                    'area_type': 'urban',
                    'households': 175,
                    'distance_to_substation_km': 2.8
                }
            ]
            
            # Insert locations
            self.locations_collection.insert_many(locations_data)
            logger.info(f"Initialized {len(locations_data)} locations")
            
        except Exception as e:
            logger.error(f"Error initializing locations: {e}")
    
    def get_season_flags(self, month: int) -> Dict[str, int]:
        """Get season flags based on month"""
        # Indian seasons
        if month in [3, 4, 5]:  # March, April, May
            return {'is_summer': 1, 'is_monsoon': 0, 'is_winter': 0}
        elif month in [6, 7, 8, 9]:  # June to September
            return {'is_summer': 0, 'is_monsoon': 1, 'is_winter': 0}
        else:  # October to February
            return {'is_summer': 0, 'is_monsoon': 0, 'is_winter': 1}
    
    def generate_synthetic_data(self, location: Dict) -> Dict:
        """Generate synthetic power grid data for a location matching realistic value ranges"""
        try:
            current_time = datetime.now()
            
            # Basic location info
            area_id = location['area_id']
            area_type = location['area_type']
            households = location['households']
            distance_to_substation = location['distance_to_substation_km']
            
            # Season flags
            season_flags = self.get_season_flags(current_time.month)
            
            # Generate realistic power readings based on area type and season
            # Base consumption per household per month (kWh) - Kerala patterns
            if area_type == 'urban':
                base_consumption_per_household = random.uniform(150, 250)  # Urban: 150-250 kWh/month
                voltage_base = random.uniform(220, 240)  # Better voltage regulation
            elif area_type == 'semi-urban':
                base_consumption_per_household = random.uniform(100, 180)  # Semi-urban: 100-180 kWh/month
                voltage_base = random.uniform(210, 235)  # Moderate voltage variation
            else:  # rural
                base_consumption_per_household = random.uniform(60, 120)   # Rural: 60-120 kWh/month
                voltage_base = random.uniform(200, 230)  # More voltage variation
            
            # Seasonal adjustments (monthly consumption patterns)
            seasonal_multiplier = 1.0
            if season_flags['is_summer']:
                seasonal_multiplier = random.uniform(1.2, 1.5)  # Higher AC usage
            elif season_flags['is_winter']:
                seasonal_multiplier = random.uniform(1.1, 1.3)  # Moderate increase
            elif season_flags['is_monsoon']:
                seasonal_multiplier = random.uniform(0.9, 1.1)   # Lower consumption
            
            # Calculate expected consumption (monthly)
            expected_consumption_kwh = base_consumption_per_household * households * seasonal_multiplier
            
            # Ensure expected consumption is within reasonable bounds
            expected_consumption_kwh = max(100, min(100000, expected_consumption_kwh))
            
            # Generate voltage reading (180-250V range)
            voltage_variation = random.uniform(-10, 10)
            voltage_reading = voltage_base + voltage_variation
            voltage_reading = max(180, min(250, voltage_reading))  # Clamp to valid range
            
            # Calculate current based on consumption (monthly average current)
            # Monthly kWh to average power: kWh/month ÷ (30 days × 24 hours)
            average_power_kw = expected_consumption_kwh / (30 * 24)  # Average power in kW
            # I = P / V (assuming single phase, power factor will be applied later)
            base_current = (average_power_kw * 1000) / voltage_reading  # Current in amperes
            
            # Add some realistic variation to current
            current_reading = base_current * random.uniform(0.8, 1.2)
            current_reading = max(1, min(500, current_reading))  # Clamp to 1-500A range
            
            # Generate power characteristics
            power_factor = random.uniform(0.75, 0.95)  # Typical residential power factor
            load_factor = random.uniform(0.3, 0.8)     # Load factor based on usage pattern
            
            # Local incident reports (10% chance normally)
            local_incident_reports = random.choice([0, 1]) if random.random() < 0.1 else 0
            
            # Make certain areas more prone to illegal activity based on risk factors
            area_illegal_probability = 0.3  # Base 30% probability
            
            # Risk factor adjustments
            if area_type == 'rural':
                area_illegal_probability += 0.15  # Rural areas more prone
            if distance_to_substation > 8.0:
                area_illegal_probability += 0.1   # Far from substation
            if households < 60:
                area_illegal_probability += 0.08  # Smaller communities
            
            # Generate actual consumption and introduce anomalies
            actual_consumption_kwh = expected_consumption_kwh
            illegal_fence_suspected = False
            
            if random.random() < area_illegal_probability:
                # Create fraud patterns
                # 1. Under-consumption (theft/bypass)
                if random.random() < 0.6:  # 60% are under-consumption cases
                    actual_consumption_kwh *= random.uniform(0.4, 0.7)  # 30-60% reduction
                    voltage_reading *= random.uniform(0.85, 0.95)       # Voltage drops
                    power_factor *= random.uniform(0.6, 0.8)            # Poor power factor
                    current_reading *= random.uniform(0.7, 0.9)         # Lower measured current
                
                # 2. Over-consumption (illegal connections/fences)
                else:  # 40% are over-consumption cases
                    actual_consumption_kwh *= random.uniform(1.3, 1.8)  # 30-80% increase
                    voltage_reading *= random.uniform(0.9, 0.97)        # Slight voltage drop
                    current_reading *= random.uniform(1.2, 1.7)         # Higher current
                    power_factor *= random.uniform(0.65, 0.85)          # Degraded power factor
                
                # Increase incident reports for fraud cases
                local_incident_reports = 1 if random.random() < 0.4 else local_incident_reports
                illegal_fence_suspected = random.choice([True, False])
                
                # Extreme anomaly cases (10% of fraud cases)
                if random.random() < 0.1:
                    voltage_reading = max(180, voltage_reading - random.uniform(15, 25))
                    power_factor = min(power_factor, random.uniform(0.5, 0.65))
                    current_reading *= random.uniform(1.5, 2.0)
            
            # Final range validation and clamping
            actual_consumption_kwh = max(100, min(100000, actual_consumption_kwh))
            voltage_reading = max(180, min(250, round(voltage_reading, 1)))
            current_reading = max(1, min(500, round(current_reading, 2)))
            power_factor = max(0.5, min(1.0, round(power_factor, 3)))
            load_factor = max(0.1, min(1.0, round(load_factor, 4)))
            
            # Create the data record matching your dataset structure
            data_record = {
                'area_id': area_id,
                'district': location['district'],
                'city': location['city'],
                'area_name': location['area_name'],
                'latitude': location['latitude'],
                'longitude': location['longitude'],
                'area_type': area_type,
                'households': households,
                'distance_to_substation_km': distance_to_substation,
                'local_incident_reports': local_incident_reports,
                'year': current_time.year,
                'month': current_time.month,
                'timestamp': current_time,
                'expected_consumption_kwh': round(expected_consumption_kwh, 2),
                'actual_consumption_kwh': round(actual_consumption_kwh, 2),
                'voltage_reading_v': voltage_reading,
                'current_reading_a': current_reading,
                'consumption_deviation_pct': round(((actual_consumption_kwh - expected_consumption_kwh) / expected_consumption_kwh) * 100, 1),
                'illegal_fence_suspected': illegal_fence_suspected,
                'power_factor': power_factor,
                'load_factor': load_factor,
                'consumption_per_household': round(actual_consumption_kwh / households, 2),
                **season_flags
            }
            
            return data_record
            
        except Exception as e:
            logger.error(f"Error generating synthetic data for location {location.get('area_id', 'unknown')}: {e}")
            return None
    
    def classify_record(self, data_record: Dict) -> tuple:
        """Classify a data record using the ML model"""
        try:
            # Prepare features for the model (only the features used in training)
            features = {
                'latitude': data_record['latitude'],
                'longitude': data_record['longitude'],
                'households': data_record['households'],
                'distance_to_substation_km': data_record['distance_to_substation_km'],
                'local_incident_reports': data_record['local_incident_reports'],
                'year': data_record['year'],
                'month': data_record['month'],
                'expected_consumption_kwh': data_record['expected_consumption_kwh'],
                'voltage_reading_v': data_record['voltage_reading_v'],
                'current_reading_a': data_record['current_reading_a'],
                'power_factor': data_record['power_factor'],
                'load_factor': data_record['load_factor'],
                'is_summer': data_record['is_summer'],
                'is_monsoon': data_record['is_monsoon'],
                'is_winter': data_record['is_winter'],
                'timestamp': data_record['timestamp']  # Will be converted to dummies in model_loader
            }
            
            # Get classification and probability
            classification, probability = self.model_loader.classify(
                features, 
                threshold=self.classification_threshold
            )
            
            return classification, probability
            
        except Exception as e:
            logger.error(f"Error classifying record: {e}")
            return 'legal', 0.0
    
    def generate_and_classify_data(self):
        """Generate synthetic data for all locations and classify them"""
        try:
            # Get all locations
            locations = list(self.locations_collection.find())
            
            if not locations:
                logger.warning("No locations found in database")
                return
            
            records_to_insert = []
            
            for location in locations:
                # Generate synthetic data
                data_record = self.generate_synthetic_data(location)
                
                if data_record:
                    # Classify the record
                    classification, probability = self.classify_record(data_record)
                    
                    # Add classification results to the record
                    data_record['classification'] = classification
                    data_record['illegal_probability'] = round(probability, 4)
                    
                    records_to_insert.append(data_record)
            
            # Insert all records at once into raw data collection
            if records_to_insert:
                self.raw_data_collection.insert_many(records_to_insert)
                
                # Insert clean model outputs using MongoDB manager
                self.mongo_manager.insert_model_outputs_batch(records_to_insert)
                
                legal_count = sum(1 for r in records_to_insert if r['classification'] == 'legal')
                illegal_count = len(records_to_insert) - legal_count
                
                logger.info(f"Generated and classified {len(records_to_insert)} records "
                           f"({legal_count} legal, {illegal_count} illegal)")
            
        except Exception as e:
            logger.error(f"Error in generate_and_classify_data: {e}")
    
    def get_location_stats(self, area_id: str, hours: int = 24) -> Dict:
        """Get statistics for a specific location over the last N hours"""
        try:
            cutoff_time = datetime.now() - timedelta(hours=hours)
            
            pipeline = [
                {
                    '$match': {
                        'area_id': area_id,
                        'timestamp': {'$gte': cutoff_time}
                    }
                },
                {
                    '$group': {
                        '_id': '$classification',
                        'count': {'$sum': 1},
                        'avg_probability': {'$avg': '$illegal_probability'},
                        'max_probability': {'$max': '$illegal_probability'},
                        'min_probability': {'$min': '$illegal_probability'}
                    }
                }
            ]
            
            results = list(self.raw_data_collection.aggregate(pipeline))
            
            stats = {
                'area_id': area_id,
                'time_window_hours': hours,
                'total_records': 0,
                'legal_count': 0,
                'illegal_count': 0,
                'illegal_percentage': 0.0,
                'avg_illegal_probability': 0.0
            }
            
            for result in results:
                classification = result['_id']
                count = result['count']
                stats['total_records'] += count
                
                if classification == 'legal':
                    stats['legal_count'] = count
                elif classification == 'illegal':
                    stats['illegal_count'] = count
                    stats['avg_illegal_probability'] = result['avg_probability']
            
            if stats['total_records'] > 0:
                stats['illegal_percentage'] = (stats['illegal_count'] / stats['total_records']) * 100
            
            return stats
            
        except Exception as e:
            logger.error(f"Error getting location stats for {area_id}: {e}")
            return {}
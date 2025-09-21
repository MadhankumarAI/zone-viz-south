import logging
from datetime import datetime
from pymongo import MongoClient
from typing import Dict, List, Optional
import os

logger = logging.getLogger(__name__)

class MongoDBManager:
    def __init__(self, mongodb_uri=None):
        """Initialize MongoDB connection and collections"""
        try:
            self.mongodb_uri = mongodb_uri or os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
            self.client = MongoClient(self.mongodb_uri)
            self.db = self.client.power_grid_db
            
            # Collections
            self.raw_data_collection = self.db.raw_data
            self.aggregated_data_collection = self.db.aggregated_data
            self.locations_collection = self.db.locations
            self.model_outputs_collection = self.db.model_outputs  # New collection for clean outputs
            
            # Test connection
            self.client.admin.command('ping')
            logger.info("MongoDB connection established successfully")
            
            # Create indexes for better performance
            self.create_indexes()
            
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise
    
    def create_indexes(self):
        """Create indexes for better query performance"""
        try:
            # Index on area_id and timestamp for model_outputs
            self.model_outputs_collection.create_index([("area_id", 1), ("timestamp", -1)])
            self.model_outputs_collection.create_index([("classification", 1)])
            self.model_outputs_collection.create_index([("timestamp", -1)])
            
            # Index on coordinates for geospatial queries
            self.model_outputs_collection.create_index([("location.coordinates", "2d")])
            
            logger.info("MongoDB indexes created successfully")
        except Exception as e:
            logger.warning(f"Could not create indexes: {e}")
    
    def insert_model_output(self, record: Dict) -> str:
        """
        Insert a single model output record
        
        Args:
            record: Dictionary containing the raw data record with classification
            
        Returns:
            str: Inserted document ID
        """
        try:
            # Extract only the required fields for the clean output table
            output_record = {
                'area_id': record.get('area_id'),
                'district': record.get('district'),
                'city': record.get('city'),
                'area_name': record.get('area_name'),
                'latitude': record.get('latitude'),
                'longitude': record.get('longitude'),
                'location': {
                    'type': 'Point',
                    'coordinates': [record.get('longitude'), record.get('latitude')]  # [lng, lat] for GeoJSON
                },
                'classification': record.get('classification'),  # legal/illegal
                'illegal_probability': record.get('illegal_probability', 0.0),
                'timestamp': record.get('timestamp', datetime.now()),
                'year': record.get('year'),
                'month': record.get('month'),
                'created_at': datetime.now()
            }
            
            result = self.model_outputs_collection.insert_one(output_record)
            return str(result.inserted_id)
            
        except Exception as e:
            logger.error(f"Error inserting model output: {e}")
            return None
    
    def insert_model_outputs_batch(self, records: List[Dict]) -> List[str]:
        """
        Insert multiple model output records in batch
        
        Args:
            records: List of dictionaries containing raw data records with classification
            
        Returns:
            List[str]: List of inserted document IDs
        """
        try:
            output_records = []
            
            for record in records:
                output_record = {
                    'area_id': record.get('area_id'),
                    'district': record.get('district'),
                    'city': record.get('city'),
                    'area_name': record.get('area_name'),
                    'latitude': record.get('latitude'),
                    'longitude': record.get('longitude'),
                    'location': {
                        'type': 'Point',
                        'coordinates': [record.get('longitude'), record.get('latitude')]
                    },
                    'classification': record.get('classification'),
                    'illegal_probability': record.get('illegal_probability', 0.0),
                    'timestamp': record.get('timestamp', datetime.now()),
                    'year': record.get('year'),
                    'month': record.get('month'),
                    'created_at': datetime.now()
                }
                output_records.append(output_record)
            
            if output_records:
                result = self.model_outputs_collection.insert_many(output_records)
                return [str(id) for id in result.inserted_ids]
            
            return []
            
        except Exception as e:
            logger.error(f"Error inserting model outputs batch: {e}")
            return []
    
    def get_model_outputs(self, 
                         limit: int = 100, 
                         classification: Optional[str] = None,
                         area_id: Optional[str] = None,
                         start_date: Optional[datetime] = None,
                         end_date: Optional[datetime] = None) -> List[Dict]:
        """
        Retrieve model outputs with optional filtering
        
        Args:
            limit: Maximum number of records to return
            classification: Filter by classification (legal/illegal)
            area_id: Filter by specific area ID
            start_date: Filter records after this date
            end_date: Filter records before this date
            
        Returns:
            List[Dict]: List of model output records
        """
        try:
            query = {}
            
            if classification:
                query['classification'] = classification
            
            if area_id:
                query['area_id'] = area_id
                
            if start_date or end_date:
                query['timestamp'] = {}
                if start_date:
                    query['timestamp']['$gte'] = start_date
                if end_date:
                    query['timestamp']['$lte'] = end_date
            
            cursor = self.model_outputs_collection.find(query).sort('timestamp', -1).limit(limit)
            
            results = []
            for doc in cursor:
                doc['_id'] = str(doc['_id'])  # Convert ObjectId to string
                if 'timestamp' in doc:
                    doc['timestamp'] = doc['timestamp'].isoformat()
                if 'created_at' in doc:
                    doc['created_at'] = doc['created_at'].isoformat()
                results.append(doc)
            
            return results
            
        except Exception as e:
            logger.error(f"Error retrieving model outputs: {e}")
            return []
    
    def get_location_summary(self, hours: int = 24) -> List[Dict]:
        """
        Get summary of illegal/legal classifications by location for the last N hours
        
        Args:
            hours: Number of hours to look back
            
        Returns:
            List[Dict]: Summary by location
        """
        try:
            cutoff_time = datetime.now().replace(microsecond=0) - \
                         timedelta(hours=hours)
            
            pipeline = [
                {
                    '$match': {
                        'timestamp': {'$gte': cutoff_time}
                    }
                },
                {
                    '$group': {
                        '_id': {
                            'area_id': '$area_id',
                            'area_name': '$area_name',
                            'district': '$district',
                            'city': '$city',
                            'latitude': '$latitude',
                            'longitude': '$longitude'
                        },
                        'total_count': {'$sum': 1},
                        'illegal_count': {
                            '$sum': {
                                '$cond': [{'$eq': ['$classification', 'illegal']}, 1, 0]
                            }
                        },
                        'legal_count': {
                            '$sum': {
                                '$cond': [{'$eq': ['$classification', 'legal']}, 1, 0]
                            }
                        },
                        'avg_illegal_probability': {'$avg': '$illegal_probability'},
                        'last_updated': {'$max': '$timestamp'}
                    }
                },
                {
                    '$project': {
                        'area_id': '$_id.area_id',
                        'area_name': '$_id.area_name',
                        'district': '$_id.district',
                        'city': '$_id.city',
                        'latitude': '$_id.latitude',
                        'longitude': '$_id.longitude',
                        'total_count': 1,
                        'illegal_count': 1,
                        'legal_count': 1,
                        'illegal_percentage': {
                            '$multiply': [
                                {'$divide': ['$illegal_count', '$total_count']}, 
                                100
                            ]
                        },
                        'avg_illegal_probability': {'$round': ['$avg_illegal_probability', 4]},
                        'location_status': {
                            '$cond': [
                                {'$gt': [{'$divide': ['$illegal_count', '$total_count']}, 0.5]},
                                'illegal',
                                'legal'
                            ]
                        },
                        'last_updated': 1,
                        '_id': 0
                    }
                },
                {
                    '$sort': {'illegal_percentage': -1}
                }
            ]
            
            results = list(self.model_outputs_collection.aggregate(pipeline))
            
            # Convert timestamps to ISO format
            for result in results:
                if 'last_updated' in result:
                    result['last_updated'] = result['last_updated'].isoformat()
            
            return results
            
        except Exception as e:
            logger.error(f"Error getting location summary: {e}")
            return []
    
    def get_classification_stats(self, hours: int = 24) -> Dict:
        """
        Get overall classification statistics for the last N hours
        
        Args:
            hours: Number of hours to look back
            
        Returns:
            Dict: Overall statistics
        """
        try:
            cutoff_time = datetime.now().replace(microsecond=0) - \
                         timedelta(hours=hours)
            
            pipeline = [
                {
                    '$match': {
                        'timestamp': {'$gte': cutoff_time}
                    }
                },
                {
                    '$group': {
                        '_id': None,
                        'total_records': {'$sum': 1},
                        'illegal_records': {
                            '$sum': {
                                '$cond': [{'$eq': ['$classification', 'illegal']}, 1, 0]
                            }
                        },
                        'legal_records': {
                            '$sum': {
                                '$cond': [{'$eq': ['$classification', 'legal']}, 1, 0]
                            }
                        },
                        'avg_illegal_probability': {'$avg': '$illegal_probability'},
                        'unique_locations': {'$addToSet': '$area_id'}
                    }
                },
                {
                    '$project': {
                        'total_records': 1,
                        'illegal_records': 1,
                        'legal_records': 1,
                        'illegal_percentage': {
                            '$multiply': [
                                {'$divide': ['$illegal_records', '$total_records']}, 
                                100
                            ]
                        },
                        'avg_illegal_probability': {'$round': ['$avg_illegal_probability', 4]},
                        'unique_locations_count': {'$size': '$unique_locations'},
                        '_id': 0
                    }
                }
            ]
            
            results = list(self.model_outputs_collection.aggregate(pipeline))
            
            if results:
                stats = results[0]
                stats['time_window_hours'] = hours
                stats['generated_at'] = datetime.now().isoformat()
                return stats
            else:
                return {
                    'total_records': 0,
                    'illegal_records': 0,
                    'legal_records': 0,
                    'illegal_percentage': 0.0,
                    'avg_illegal_probability': 0.0,
                    'unique_locations_count': 0,
                    'time_window_hours': hours,
                    'generated_at': datetime.now().isoformat()
                }
                
        except Exception as e:
            logger.error(f"Error getting classification stats: {e}")
            return {}
    
    def close_connection(self):
        """Close MongoDB connection"""
        try:
            self.client.close()
            logger.info("MongoDB connection closed")
        except Exception as e:
            logger.error(f"Error closing MongoDB connection: {e}")
    
    def __del__(self):
        """Cleanup when object is destroyed"""
        try:
            self.close_connection()
        except:
            pass
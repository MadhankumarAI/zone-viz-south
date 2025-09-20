from flask import Flask, request, jsonify
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta
import threading
import time
import os
from pymongo import MongoClient
from bson import ObjectId
import logging

from simulator import PowerGridSimulator
from model_loader import ModelLoader
from mongo_utils import MongoDBManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

class PowerGridBackend:
    def __init__(self):
        self.simulator = None
        self.model_loader = ModelLoader()
        self.scheduler = BackgroundScheduler()
        self.simulation_thread = None
        self.is_running = False
        self.window_duration_minutes = 1440  # Default: 1 day (1440 minutes)
        
        # MongoDB connection
        self.setup_database()
        
        # Initialize MongoDB manager for model outputs
        self.mongo_manager = MongoDBManager(mongodb_uri=os.getenv('MONGODB_URI', 'mongodb://localhost:27017/'))
        
        # Start scheduler
        self.scheduler.start()
        
        # Schedule initial aggregation job
        self.schedule_aggregation_job()
    
    def setup_database(self):
        """Setup MongoDB Atlas connection"""
        try:
            # Use environment variable for MongoDB URI in production
            mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
            self.client = MongoClient(mongodb_uri)
            self.db = self.client.power_grid_db
            self.raw_data_collection = self.db.raw_data
            self.aggregated_data_collection = self.db.aggregated_data
            self.locations_collection = self.db.locations
            
            # Test connection
            self.client.admin.command('ping')
            logger.info("Successfully connected to MongoDB")
            
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise
    
    def schedule_aggregation_job(self):
        """Schedule the aggregation job based on current window duration"""
        # Remove existing jobs
        if self.scheduler.get_jobs():
            self.scheduler.remove_all_jobs()
        
        # Add new job
        self.scheduler.add_job(
            func=self.aggregate_data,
            trigger="interval",
            minutes=self.window_duration_minutes,
            id='aggregation_job',
            replace_existing=True
        )
        logger.info(f"Scheduled aggregation job every {self.window_duration_minutes} minutes")
    
    def start_simulation(self):
        """Start the power grid simulation"""
        if self.is_running:
            return {"status": "error", "message": "Simulation is already running"}
        
        try:
            self.simulator = PowerGridSimulator(self.model_loader, self.db)
            self.is_running = True
            
            # Start simulation in a separate thread
            self.simulation_thread = threading.Thread(target=self.run_simulation)
            self.simulation_thread.daemon = True
            self.simulation_thread.start()
            
            logger.info("Power grid simulation started")
            return {"status": "success", "message": "Simulation started successfully"}
            
        except Exception as e:
            logger.error(f"Error starting simulation: {e}")
            return {"status": "error", "message": str(e)}
    
    def stop_simulation(self):
        """Stop the power grid simulation"""
        if not self.is_running:
            return {"status": "error", "message": "Simulation is not running"}
        
        self.is_running = False
        
        if self.simulation_thread:
            self.simulation_thread.join(timeout=5)
        
        logger.info("Power grid simulation stopped")
        return {"status": "success", "message": "Simulation stopped successfully"}
    
    def run_simulation(self):
        """Run the continuous simulation loop"""
        while self.is_running:
            try:
                self.simulator.generate_and_classify_data()
                # Configurable data generation interval (default 5 seconds)
                interval = int(os.getenv('DATA_GENERATION_INTERVAL', 5))
                time.sleep(interval)
            except Exception as e:
                logger.error(f"Error in simulation loop: {e}")
                time.sleep(5)  # Wait before retrying
    
    def set_window_duration(self, minutes):
        """Set the time window duration for aggregation"""
        try:
            if minutes <= 0:
                return {"status": "error", "message": "Window duration must be positive"}
            
            self.window_duration_minutes = minutes
            self.schedule_aggregation_job()  # Reschedule with new duration
            
            logger.info(f"Window duration set to {minutes} minutes")
            return {"status": "success", "message": f"Window duration set to {minutes} minutes"}
            
        except Exception as e:
            logger.error(f"Error setting window duration: {e}")
            return {"status": "error", "message": str(e)}
    
    def aggregate_data(self):
        """Aggregate data for the completed time window"""
        try:
            current_time = datetime.now()
            window_start = current_time - timedelta(minutes=self.window_duration_minutes)
            
            logger.info(f"Starting aggregation for window: {window_start} to {current_time}")
            
            # Get all locations
            locations = list(self.locations_collection.find())
            
            aggregation_results = []
            
            for location in locations:
                area_id = location['area_id']
                
                # Count records in the time window
                total_count = self.raw_data_collection.count_documents({
                    'area_id': area_id,
                    'timestamp': {
                        '$gte': window_start,
                        '$lt': current_time
                    }
                })
                
                illegal_count = self.raw_data_collection.count_documents({
                    'area_id': area_id,
                    'timestamp': {
                        '$gte': window_start,
                        '$lt': current_time
                    },
                    'classification': 'illegal'
                })
                
                if total_count > 0:
                    illegal_percentage = (illegal_count / total_count) * 100
                    location_status = 'illegal' if illegal_percentage > 50 else 'legal'
                    
                    aggregation_result = {
                        'area_id': area_id,
                        'district': location['district'],
                        'city': location['city'],
                        'area_name': location['area_name'],
                        'window_start': window_start,
                        'window_end': current_time,
                        'window_duration_minutes': self.window_duration_minutes,
                        'total_records': total_count,
                        'illegal_records': illegal_count,
                        'illegal_percentage': round(illegal_percentage, 2),
                        'location_status': location_status,
                        'created_at': current_time
                    }
                    
                    aggregation_results.append(aggregation_result)
            
            # Save aggregation results
            if aggregation_results:
                self.aggregated_data_collection.insert_many(aggregation_results)
                logger.info(f"Aggregated data for {len(aggregation_results)} locations")
            
        except Exception as e:
            logger.error(f"Error in data aggregation: {e}")
    
    def get_status(self):
        """Get current status and latest aggregation results"""
        try:
            # Get latest aggregation results
            latest_aggregation = list(
                self.aggregated_data_collection.find()
                .sort('created_at', -1)
                .limit(100)
            )
            
            # Convert ObjectId to string for JSON serialization
            for item in latest_aggregation:
                item['_id'] = str(item['_id'])
                if 'window_start' in item:
                    item['window_start'] = item['window_start'].isoformat()
                if 'window_end' in item:
                    item['window_end'] = item['window_end'].isoformat()
                if 'created_at' in item:
                    item['created_at'] = item['created_at'].isoformat()
            
            # Get current simulation stats
            current_time = datetime.now()
            total_records_today = self.raw_data_collection.count_documents({
                'timestamp': {
                    '$gte': current_time.replace(hour=0, minute=0, second=0, microsecond=0)
                }
            })
            
            return {
                "status": "success",
                "simulation_running": self.is_running,
                "window_duration_minutes": self.window_duration_minutes,
                "total_records_today": total_records_today,
                "latest_aggregation": latest_aggregation,
                "timestamp": current_time.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting status: {e}")
            return {"status": "error", "message": str(e)}

# Initialize the backend
backend = PowerGridBackend()

# Routes
@app.route('/start', methods=['POST'])
def start_simulation():
    """Start the power grid simulation"""
    return jsonify(backend.start_simulation())

@app.route('/stop', methods=['POST'])
def stop_simulation():
    """Stop the power grid simulation"""
    return jsonify(backend.stop_simulation())

@app.route('/set-window', methods=['POST'])
def set_window():
    """Set the time window duration for aggregation"""
    try:
        data = request.get_json()
        minutes = data.get('minutes', 1440)
        return jsonify(backend.set_window_duration(minutes))
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

@app.route('/status', methods=['GET'])
def get_status():
    """Get current status and latest aggregation results"""
    return jsonify(backend.get_status())

@app.route('/set-interval', methods=['POST'])
def set_generation_interval():
    """Set the data generation interval"""
    try:
        data = request.get_json()
        interval = data.get('seconds', 5)
        
        if interval <= 0:
            return jsonify({"status": "error", "message": "Interval must be positive"})
        
        # Set environment variable for the interval
        os.environ['DATA_GENERATION_INTERVAL'] = str(interval)
        
        logger.info(f"Data generation interval set to {interval} seconds")
        return jsonify({
            "status": "success", 
            "message": f"Data generation interval set to {interval} seconds"
        })
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

@app.route('/get-config', methods=['GET'])
def get_configuration():
    """Get current system configuration"""
    return jsonify({
        "status": "success",
        "configuration": {
            "simulation_running": backend.is_running,
            "window_duration_minutes": backend.window_duration_minutes,
            "data_generation_interval_seconds": int(os.getenv('DATA_GENERATION_INTERVAL', 5)),
            "classification_threshold": float(os.getenv('CLASSIFICATION_THRESHOLD', 0.25)),
            "model_loaded": backend.simulator.model_loader.model is not None if backend.simulator else False,
            "model_features": backend.model_loader.get_required_features() if backend.model_loader else [],
            "total_model_features": len(backend.model_loader.get_required_features()) if backend.model_loader else 0
        }
    })

@app.route('/model-info', methods=['GET'])
def get_model_info():
    """Get detailed model information"""
    try:
        if not backend.model_loader:
            return jsonify({"status": "error", "message": "Model loader not initialized"})
        
        if not backend.model_loader.model:
            return jsonify({"status": "error", "message": "Model not loaded"})
        
        model_info = backend.model_loader.model_info()
        feature_importance = backend.model_loader.get_feature_importance()
        
        return jsonify({
            "status": "success",
            "model_info": model_info,
            "feature_importance": feature_importance
        })
    except Exception as e:
        logger.error(f"Error in model-info endpoint: {e}")
        return jsonify({"status": "error", "message": f"Internal error: {str(e)}"})

@app.route('/model-outputs', methods=['GET'])
def get_model_outputs():
    """Get model outputs with optional filtering"""
    try:
        # Get query parameters
        limit = int(request.args.get('limit', 100))
        classification = request.args.get('classification')  # legal/illegal
        area_id = request.args.get('area_id')
        hours = int(request.args.get('hours', 24))
        
        # Calculate date range if hours specified
        start_date = None
        if hours:
            start_date = datetime.now() - timedelta(hours=hours)
        
        outputs = backend.mongo_manager.get_model_outputs(
            limit=limit,
            classification=classification,
            area_id=area_id,
            start_date=start_date
        )
        
        return jsonify({
            "status": "success",
            "count": len(outputs),
            "filters": {
                "limit": limit,
                "classification": classification,
                "area_id": area_id,
                "hours": hours
            },
            "outputs": outputs
        })
        
    except Exception as e:
        logger.error(f"Error getting model outputs: {e}")
        return jsonify({"status": "error", "message": str(e)})

@app.route('/location-summary', methods=['GET'])
def get_location_summary():
    """Get summary of classifications by location"""
    try:
        hours = int(request.args.get('hours', 24))
        
        summary = backend.mongo_manager.get_location_summary(hours=hours)
        
        return jsonify({
            "status": "success",
            "time_window_hours": hours,
            "locations_count": len(summary),
            "summary": summary
        })
        
    except Exception as e:
        logger.error(f"Error getting location summary: {e}")
        return jsonify({"status": "error", "message": str(e)})

@app.route('/classification-stats', methods=['GET'])
def get_classification_stats():
    """Get overall classification statistics"""
    try:
        hours = int(request.args.get('hours', 24))
        
        stats = backend.mongo_manager.get_classification_stats(hours=hours)
        
        return jsonify({
            "status": "success",
            "statistics": stats
        })
        
    except Exception as e:
        logger.error(f"Error getting classification stats: {e}")
        return jsonify({"status": "error", "message": str(e)})

@app.route('/illegal-locations', methods=['GET'])
def get_illegal_locations():
    """Get locations with illegal activity (shortcut endpoint)"""
    try:
        limit = int(request.args.get('limit', 50))
        hours = int(request.args.get('hours', 24))
        
        # Get only illegal classifications
        illegal_outputs = backend.mongo_manager.get_model_outputs(
            limit=limit,
            classification='illegal',
            start_date=datetime.now() - timedelta(hours=hours)
        )
        
        return jsonify({
            "status": "success",
            "count": len(illegal_outputs),
            "time_window_hours": hours,
            "illegal_locations": illegal_outputs
        })
        
    except Exception as e:
        logger.error(f"Error getting illegal locations: {e}")
        return jsonify({"status": "error", "message": str(e)})

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "simulation_running": backend.is_running
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
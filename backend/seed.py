import asyncio
from datetime import datetime
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URI = "mongodb+srv://sih:sih123@cluster0.ga6g9fv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = AsyncIOMotorClient(MONGO_URI)
db = client.safence

devices_collection = db.devices
alerts_collection = db.alerts
logs_collection = db.logs
pins_collection = db.map_pins
cameras_collection = db.cameras

sample_devices = [
  
    {
        "_id": ObjectId(),
        "device_id": "CAM-002",
        "name": "Security Camera 2",
        "type": "camera",
        "status": "online",
        "voltage": 24.1,
        "last_heartbeat": datetime.utcnow(),
        "location": {"lat": 51.507, "lng": -0.08},
        "alerts_count": 2
    }
]

sample_alerts = [
    {
        "_id": ObjectId(),
        "alert_id": "ALT-001",
        "device_id": "CAM-002",
        "title": "Illegal Activity Detected",
        "description": "Unauthorized personnel detected in restricted zone",
        "severity": "Critical",
        "timestamp": datetime.utcnow(),
        "status": "active",
        "type": "security_breach"
    }
]

sample_logs = [
    {
        "_id": ObjectId(),
        "event_id": "EVNT-001",
        "timestamp": datetime.utcnow(),
        "event_type": "Sensor Reading",
        "device_id": "MAG-007",
        "status": "Normal",
        "description": "Regular magnetometer reading"
    }
]

sample_pins = [
    {
        "_id": ObjectId(),
        "pin_id": "pin-1",
        "position": [51.505, -0.09],
        "status": "safe",
        "type": "sensorNode",
        "name": "Magnetometer MAG-007",
        "description": "Primary perimeter magnetometer unit"
    }
]

sample_cameras = [
    {
        "_id": ObjectId(),
        "camera_id": "CAM-001",
        "name": "North Perimeter",
        "status": "online",
        "stream_url": "rtsp://camera1.local/stream",
        "last_activity": datetime.utcnow()
    }
]

async def seed_database():
    """Insert sample data only if collections are empty"""
    if await devices_collection.count_documents({}) == 0:
        await devices_collection.insert_many(sample_devices)

    if await alerts_collection.count_documents({}) == 0:
        await alerts_collection.insert_many(sample_alerts)

    if await logs_collection.count_documents({}) == 0:
        await logs_collection.insert_many(sample_logs)

    if await pins_collection.count_documents({}) == 0:
        await pins_collection.insert_many(sample_pins)

    if await cameras_collection.count_documents({}) == 0:
        await cameras_collection.insert_many(sample_cameras)

    print("✅ Database seeded with sample data")

if __name__ == "__main__":
    asyncio.run(seed_database())

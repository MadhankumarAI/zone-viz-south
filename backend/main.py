from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, ConfigDict, Field
from bson import ObjectId
from typing import Optional, List
from datetime import datetime
import uvicorn

# Pydantic models
class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

class Device(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    device_id: str
    name: str
    type: str
    status: str
    voltage: float
    last_heartbeat: datetime
    location: dict
    alerts_count: int = 0

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Alert(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    alert_id: str
    device_id: str
    title: str
    description: str
    severity: str
    timestamp: datetime
    status: str
    type: str

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class LogEvent(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    event_id: str
    timestamp: datetime
    event_type: str
    device_id: str
    status: str
    description: str

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class MapPin(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    pin_id: str
    position: List[float]  # [lat, lng]
    status: str
    type: str
    name: str
    description: str

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Camera(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    camera_id: str
    name: str
    status: str
    stream_url: str
    last_activity: datetime

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# FastAPI app
app = FastAPI(title="SentinelGuard API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGODB_URL = "mongodb+srv://sih:sih123@cluster0.ga6g9fv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = AsyncIOMotorClient(MONGODB_URL)
db = client.safence

# Collections
devices_collection = db.devices
alerts_collection = db.alerts
logs_collection = db.logs
pins_collection = db.map_pins
cameras_collection = db.cameras

@app.on_event("startup")
async def startup_event():
    """Initialize database with sample data"""
    # Sample devices
    sample_devices = [
        {
            "device_id": "MAG-007",
            "name": "Magnetometer Unit 7",
            "type": "magnetometer",
            "status": "online",
            "voltage": 12.45,
            "last_heartbeat": datetime.now(),
            "location": {"lat": 51.505, "lng": -0.09},
            "alerts_count": 0
        },
        {
            "device_id": "CAM-002",
            "name": "Security Camera 2",
            "type": "camera",
            "status": "online",
            "voltage": 24.1,
            "last_heartbeat": datetime.now(),
            "location": {"lat": 51.507, "lng": -0.08},
            "alerts_count": 2
        },
        {
            "device_id": "FENC-001",
            "name": "Fence Sensor 1",
            "type": "fence_sensor",
            "status": "warning",
            "voltage": 11.8,
            "last_heartbeat": datetime.now(),
            "location": {"lat": 51.503, "lng": -0.095},
            "alerts_count": 1
        }
    ]

    # Sample alerts
    sample_alerts = [
        {
            "alert_id": "ALT-001",
            "device_id": "CAM-002",
            "title": "Illegal Activity Detected",
            "description": "Unauthorized personnel detected in restricted zone",
            "severity": "Critical",
            "timestamp": datetime.now(),
            "status": "active",
            "type": "security_breach"
        },
        {
            "alert_id": "ALT-002",
            "device_id": "FENC-001",
            "title": "Over-voltage Alert",
            "description": "Voltage reading exceeded safe threshold",
            "severity": "Warning",
            "timestamp": datetime.now(),
            "status": "acknowledged",
            "type": "system_alert"
        }
    ]

    # Sample logs
    sample_logs = [
        {
            "event_id": "EVNT-001",
            "timestamp": datetime.now(),
            "event_type": "Sensor Reading",
            "device_id": "MAG-007",
            "status": "Normal",
            "description": "Regular magnetometer reading"
        }
    ]

    # Sample map pins
    sample_pins = [
        {
            "pin_id": "pin-1",
            "position": [51.505, -0.09],
            "status": "safe",
            "type": "sensorNode",
            "name": "Magnetometer MAG-007",
            "description": "Primary perimeter magnetometer unit"
        }
    ]

    # Sample cameras
    sample_cameras = [
        {
            "camera_id": "CAM-001",
            "name": "North Perimeter",
            "status": "online",
            "stream_url": "rtsp://camera1.local/stream",
            "last_activity": datetime.now()
        }
    ]

    # Check if collections are empty and insert sample data
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

# Dashboard endpoints
@app.get("/api/dashboard/device")
async def get_dashboard_device():
    device = await devices_collection.find_one({"device_id": "CAM-002"})
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    device["_id"] = str(device["_id"])
    device["last_heartbeat"] = device["last_heartbeat"].isoformat() + "Z"
    return device


@app.get("/api/dashboard/alerts")
async def get_dashboard_alerts():
    alerts = []
    async for alert in alerts_collection.find():
        alert["_id"] = str(alert["_id"])
        # Convert datetime to ISO string for frontend
        alert["timestamp"] = alert["timestamp"].isoformat() + "Z"
        alerts.append(alert)
    return alerts

@app.get("/api/dashboard/summary")
async def get_dashboard_summary():
    total_devices = await devices_collection.count_documents({})
    online_devices = await devices_collection.count_documents({"status": "online"})
    active_alerts = await alerts_collection.count_documents({"status": "active"})
    
    return {
        "total_devices": total_devices,
        "online_devices": online_devices,
        "offline_devices": total_devices - online_devices,
        "active_alerts": active_alerts,
        "system_status": "operational" if active_alerts == 0 else "alerts_active"
    }

# Alerts endpoints
@app.get("/api/alerts")
async def get_alerts(
    severity: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    device_id: Optional[str] = Query(None),
    limit:int=Query(10)
):
    filter_query = {}
    
    if severity:
        filter_query["severity"] = {"$regex": severity, "$options": "i"}
    if status:
        filter_query["status"] = {"$regex": status, "$options": "i"}
    if device_id:
        filter_query["device_id"] = device_id
    
    alerts = []
    async for alert in alerts_collection.find(filter_query).sort("timestamp", -1).limit(limit):
        alert["_id"] = str(alert["_id"])
        alert["timestamp"] = alert["timestamp"].isoformat() + "Z"
        alerts.append(alert)
    
    return alerts

@app.patch("/api/alerts/{alert_id}")
async def update_alert(alert_id: str, status_update: dict):
    result = await alerts_collection.update_one(
        {"alert_id": alert_id},
        {"$set": {"status": status_update.get("status")}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    return {"message": "Alert updated successfully"}

# Logs endpoints
@app.get("/api/logs")
async def get_logs(
    device_id: Optional[str] = Query(None),
    event_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None)
):
    filter_query = {}
    
    if device_id:
        filter_query["device_id"] = device_id
    if event_type:
        filter_query["event_type"] = {"$regex": event_type, "$options": "i"}
    if status:
        filter_query["status"] = {"$regex": status, "$options": "i"}
    
    logs = []
    async for log in logs_collection.find(filter_query).sort("timestamp", -1):
        log["_id"] = str(log["_id"])
        log["timestamp"] = log["timestamp"].isoformat() + "Z"
        logs.append(log)
    
    return logs

# Map endpoints
@app.get("/api/map/devices")
async def get_map_pins():
    pins = []
    async for pin in pins_collection.find():
        pin["_id"] = str(pin["_id"])
        # Rename pin_id to id for frontend compatibility
        pin["id"] = pin["pin_id"]
        pins.append(pin)
    return pins

@app.get("/api/map/overlays")
async def get_map_overlays():
    # Static overlays for now
    return [
        {
            "type": "tampering",
            "bounds": [[51.502, -0.095], [51.504, -0.093]],
            "label": "Tampering Zone Alpha"
        },
        {
            "type": "illegal",
            "bounds": [[51.506, -0.082], [51.508, -0.078]],
            "label": "Restricted Access Zone"
        }
    ]

# Camera endpoints
@app.get("/api/cameras")
async def get_cameras():
    cameras = []
    async for camera in cameras_collection.find():
        camera["_id"] = str(camera["_id"])
        camera["last_activity"] = camera["last_activity"].isoformat() + "Z"
        cameras.append(camera)
    return cameras

@app.get("/api/cameras/{camera_id}/snapshot")
async def get_camera_snapshot(camera_id: str):
    return {
        "camera_id": camera_id,
        "snapshot_url": f"https://picsum.photos/640/480?random={camera_id}",
        "timestamp": datetime.now().isoformat() + "Z"
    }

# Device control endpoints
@app.get("/api/devices/{device_id}")
async def get_device(device_id: str):
    device = await devices_collection.find_one({"device_id": device_id})
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    device["_id"] = str(device["_id"])
    device["last_heartbeat"] = device["last_heartbeat"].isoformat() + "Z"
    return device

@app.patch("/api/devices/{device_id}")
async def update_device(device_id: str, device_update: dict):
    result = await devices_collection.update_one(
        {"device_id": device_id},
        {"$set": device_update}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Device not found")
    
    return {"message": "Device updated successfully"}

# System status endpoint
@app.get("/api/system/status")
async def get_system_status():
    return {
        "system_status": "operational",
        "uptime": "72h 45m",
        "last_backup": "2024-01-15T02:00:00Z",
        "database_status": "healthy",
        "network_status": "stable"
    }

# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat() + "Z",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    print("Starting SentinelGuard FastAPI Backend with MongoDB...")
    print("Available endpoints:")
    print("  Dashboard: http://localhost:8000/api/dashboard/*")
    print("  Alerts: http://localhost:8000/api/alerts")
    print("  Logs: http://localhost:8000/api/logs")
    print("  Map: http://localhost:8000/api/map/*")
    print("  Cameras: http://localhost:8000/api/cameras")
    print("  Health: http://localhost:8000/api/health")
    print("  Docs: http://localhost:8000/docs")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
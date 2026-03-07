from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
import uuid
import random
import json

app = FastAPI(
    title="ClearPath AI — Backend API",
    description="Intelligent Emergency Route Accessibility System",
    version="1.0.0",
)

# CORS — allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── In-memory DB (replace with PostgreSQL in production) ───────────────────
_obstructions: List[dict] = [
    {
        "id": "d1e2f3a4",
        "obstruction_type": "illegal_parking",
        "latitude": 12.9716,
        "longitude": 77.5946,
        "description": "Two cars blocking ambulance lane",
        "image_url": None,
        "severity": "red",
        "reported_by": "AI System",
        "timestamp": "2026-03-07T18:00:00",
        "status": "active",
        "ai_confidence": 0.94,
    },
    {
        "id": "b5c6d7e8",
        "obstruction_type": "construction",
        "latitude": 12.9756,
        "longitude": 77.5990,
        "description": "Construction materials on road",
        "image_url": None,
        "severity": "yellow",
        "reported_by": "Field Officer",
        "timestamp": "2026-03-07T17:48:00",
        "status": "active",
        "ai_confidence": 0.88,
    },
    {
        "id": "f9a1b2c3",
        "obstruction_type": "vendor_encroachment",
        "latitude": 12.9680,
        "longitude": 77.5910,
        "description": "Vegetable vendors on road",
        "image_url": None,
        "severity": "yellow",
        "reported_by": "Citizen",
        "timestamp": "2026-03-07T17:35:00",
        "status": "active",
        "ai_confidence": 0.79,
    },
]


# ─── Helper ──────────────────────────────────────────────────────────────────
def _mock_ai_classify(filename: str, obstruction_type: str) -> dict:
    """
    Simulates TensorFlow / OpenCV model inference.
    In production, replace this with actual model inference.
    """
    type_map = {
        "illegal_parking":    ("Illegal Parking",     0.85 + random.random() * 0.12),
        "construction":       ("Construction Zone",   0.80 + random.random() * 0.15),
        "vendor_encroachment":("Vendor Encroachment", 0.82 + random.random() * 0.13),
        "road_blockage":      ("Road Blockage",       0.78 + random.random() * 0.18),
        "garbage_truck":      ("Garbage Truck",       0.87 + random.random() * 0.10),
    }
    label, conf = type_map.get(obstruction_type, ("Unknown Obstruction", 0.70))
    severity = "red" if conf > 0.90 else "yellow" if conf > 0.80 else "green"
    return {"ai_detected": label, "confidence": round(conf, 4), "severity": severity}


# ─── Routes ──────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "ClearPath AI API is running 🚦", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.post("/report-obstruction")
async def report_obstruction(
    image: Optional[UploadFile] = File(None),
    obstruction_type: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    description: Optional[str] = Form(""),
    reported_by: Optional[str] = Form("Anonymous"),
):
    """
    Accepts a road image + metadata, runs mock AI classification,
    and stores the report.
    """
    # Read image bytes (for real model inference)
    image_bytes = None
    image_url = None
    if image:
        image_bytes = await image.read()
        image_url = f"/images/{image.filename}"  # In production, save to S3 / disk

    # AI classification
    ai_result = _mock_ai_classify(image.filename if image else "", obstruction_type)

    new_report = {
        "id": str(uuid.uuid4())[:8],
        "obstruction_type": obstruction_type,
        "latitude": latitude,
        "longitude": longitude,
        "description": description,
        "image_url": image_url,
        "severity": ai_result["severity"],
        "reported_by": reported_by,
        "timestamp": datetime.now().isoformat(),
        "status": "Reported",
        "ai_confidence": ai_result["confidence"],
    }
    _obstructions.append(new_report)

    return {
        "id": new_report["id"],
        "ai_detected": ai_result["ai_detected"],
        "confidence": ai_result["confidence"],
        "severity": ai_result["severity"],
        "status": "Reported",
        "message": "Obstruction successfully reported and added to the live map.",
    }


@app.post("/detect-obstruction")
async def detect_obstruction(image: UploadFile = File(...)):
    """
    AI-only endpoint: upload an image, get obstruction type + confidence.
    In production this runs OpenCV preprocessing + TensorFlow inference.
    """
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

    image_bytes = await image.read()
    size_kb = len(image_bytes) / 1024

    # Mock object detection pipeline
    detections = [
        {
            "object": random.choice(["parked_car", "construction_barrier", "garbage_truck", "vendor_stall"]),
            "obstruction_type": random.choice(["Illegal Parking", "Construction Zone", "Garbage Truck Blockage", "Vendor Encroachment"]),
            "confidence": round(0.75 + random.random() * 0.22, 4),
            "bounding_box": [
                random.randint(10, 100), random.randint(10, 100),
                random.randint(200, 500), random.randint(200, 400)
            ],
        }
    ]

    return {
        "filename": image.filename,
        "size_kb": round(size_kb, 2),
        "detections": detections,
        "processing_time_ms": round(random.uniform(120, 450), 1),
        "model": "ClearPath-DetectionNet-v1 (TF 2.x + OpenCV)",
    }


@app.get("/obstructions")
def get_obstructions(
    severity: Optional[str] = None,
    obstruction_type: Optional[str] = None,
    limit: int = 50,
):
    data = _obstructions.copy()
    if severity:
        data = [d for d in data if d["severity"] == severity]
    if obstruction_type:
        data = [d for d in data if d["obstruction_type"] == obstruction_type]
    return {"count": len(data), "obstructions": data[:limit]}


@app.get("/obstructions/{obs_id}")
def get_obstruction(obs_id: str):
    for obs in _obstructions:
        if obs["id"] == obs_id:
            return obs
    raise HTTPException(status_code=404, detail="Obstruction not found")


@app.get("/route")
def find_route(
    start_lat: float,
    start_lng: float,
    end_lat: float,
    end_lng: float,
):
    """
    Finds the safest route by checking obstructions near the path.
    In production, integrates with OSRM or GraphHopper + live obstruction DB.
    """
    # Check for obstructions near route (mock spatial query)
    nearby = []
    for obs in _obstructions:
        # Simple bounding box proximity
        if (min(start_lat, end_lat) - 0.02 <= obs["latitude"] <= max(start_lat, end_lat) + 0.02 and
            min(start_lng, end_lng) - 0.02 <= obs["longitude"] <= max(start_lng, end_lng) + 0.02):
            nearby.append(obs)

    distance_km = round(
        ((end_lat - start_lat)**2 + (end_lng - start_lng)**2)**0.5 * 111, 2
    )
    base_time = distance_km / 40 * 60  # assume 40 km/h avg
    obstruction_delay = len(nearby) * 1.5
    eta = round(base_time + obstruction_delay, 1)

    return {
        "start": {"lat": start_lat, "lng": start_lng},
        "end": {"lat": end_lat, "lng": end_lng},
        "distance_km": distance_km,
        "eta_minutes": eta,
        "obstructions_on_route": len(nearby),
        "obstructions": nearby,
        "route_status": "blocked" if any(o["severity"] == "red" for o in nearby) else
                        "moderate" if nearby else "clear",
        "alternative_available": len(nearby) > 0,
    }


@app.get("/dashboard/stats")
def dashboard_stats():
    total = len(_obstructions)
    active = sum(1 for o in _obstructions if o["status"] == "active")
    red = sum(1 for o in _obstructions if o["severity"] == "red")
    return {
        "total_today": total,
        "active": active,
        "cleared": total - active,
        "blocked_routes": red,
        "resolution_rate": round((total - active) / max(total, 1) * 100, 1),
        "ai_detections": sum(1 for o in _obstructions if "AI" in o.get("reported_by", "")),
    }

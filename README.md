# 🛡️ ClearPath AI — Intelligent Emergency Route Accessibility System

> **AI-powered emergency route accessibility for smarter cities.**  
> Detect real-world road obstructions, optimize emergency vehicle routes, and crowdsource civic reports — in real time.

---

![ClearPath AI Banner](https://img.shields.io/badge/ClearPath-AI-1E3A8A?style=for-the-badge&logo=shield&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=flat-square&logo=fastapi)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=flat-square&logo=tailwindcss)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 📌 Overview

Emergency vehicles lose **critical minutes** due to unexpected road obstructions —
illegal parking, construction zones, vendor encroachments, and garbage trucks —
that traditional GPS systems cannot detect.

**ClearPath AI** solves this by combining:

- 🤖 **AI Obstruction Detection** — OpenCV + TensorFlow image classification
- 👥 **Crowdsourced Reporting** — GPS-tagged reports from citizens and field officers
- 🗺️ **Live Accessibility Map** — Real-time color-coded Leaflet map
- 🚑 **Emergency Route Optimizer** — Obstruction-aware routing for ambulances & fire trucks
- 📊 **Smart City Dashboard** — Analytics for city administrators

---

## 🏗️ Tech Stack

| Layer        | Technology                                    |
|--------------|-----------------------------------------------|
| Frontend     | React.js · Tailwind CSS · Leaflet · Recharts  |
| Backend      | FastAPI (Python 3.12) · Uvicorn               |
| AI / CV      | OpenCV · TensorFlow · PIL                     |
| Database     | PostgreSQL (schema included)                  |
| Maps         | OpenStreetMap · Leaflet.js                    |

---

## 📁 Project Structure

```
AI4DEV/
├── frontend/               # React.js application
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.js      # Hero, Problem, Solution, Features
│   │   │   ├── CityMapPage.js      # Interactive Leaflet map
│   │   │   ├── ReportPage.js       # Obstruction reporting form
│   │   │   ├── RouteFinder.js      # Emergency route optimizer
│   │   │   └── Dashboard.js        # Admin analytics dashboard
│   │   └── components/
│   │       └── Navbar.js
│   └── tailwind.config.js
│
├── backend/                # FastAPI application
│   ├── main.py             # All API endpoints
│   ├── schema.sql          # PostgreSQL schema
│   └── requirements.txt
│
├── ai-model/               # Computer vision pipeline
│   └── detector.py         # OpenCV + TF inference (demo-ready)
│
└── dataset/                # Sample training dataset
    ├── generate_dataset.py # Dataset generator script
    ├── dataset.csv         # 50-row annotated metadata CSV
    ├── annotations/
    │   ├── coco_annotations.json
    │   └── class_labels.json
    └── split_manifest.json
```

---

## 🚀 Quick Start

### 1️⃣ Clone the repo

```bash
git clone https://github.com/<your-username>/clearpath-ai.git
cd clearpath-ai
```

### 2️⃣ Start the Frontend

```bash
cd frontend
npm install
npm start
# App runs at http://127.0.0.1:3000
```

### 3️⃣ Start the Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
# API runs at http://127.0.0.1:8000
# Swagger docs at http://127.0.0.1:8000/docs
```

### 4️⃣ Generate Sample Dataset

```bash
cd dataset
pip install pillow
python generate_dataset.py
# Generates 50 synthetic road obstruction images + annotations
```

---

## 🗺️ API Endpoints

| Method | Endpoint                | Description                               |
|--------|-------------------------|-------------------------------------------|
| `GET`  | `/`                     | API health check                          |
| `GET`  | `/health`               | Detailed health status                    |
| `POST` | `/report-obstruction`   | Submit a new obstruction report + image   |
| `POST` | `/detect-obstruction`   | AI-only image classification endpoint     |
| `GET`  | `/obstructions`         | List all obstructions (filterable)        |
| `GET`  | `/obstructions/{id}`    | Get a specific obstruction by ID          |
| `GET`  | `/route`                | Find safest emergency route               |
| `GET`  | `/dashboard/stats`      | Admin dashboard KPIs                      |

---

## 🧠 AI Detection Classes

| Class                  | Severity | Description                              |
|------------------------|----------|------------------------------------------|
| `illegal_parking`      | 🔴 Red    | Vehicles parked on emergency lanes       |
| `construction`         | 🟡 Yellow | Construction materials/barriers          |
| `vendor_encroachment`  | 🟡 Yellow | Street stalls occupying road space       |
| `garbage_truck`        | 🔴 Red    | Garbage vehicles blocking lanes          |
| `clear_road`           | 🟢 Green  | No obstruction detected                  |

---

## 🗄️ Database Setup (PostgreSQL)

```bash
psql -U postgres -d your_db_name -f backend/schema.sql
```

Update the connection string in `backend/main.py` when connecting to a real DB.

---

## 🎨 Color Palette

| Role       | Color       | Hex       |
|------------|-------------|-----------|
| Primary    | Deep Blue   | `#1E3A8A` |
| Secondary  | Teal        | `#14B8A6` |
| Alert      | Orange      | `#F97316` |
| Background | Light Gray  | `#F8FAFC` |
| Text       | Dark Gray   | `#1F2937` |

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🤝 Team

Built for **AI4DEV Smart City Hackathon** — BEYOND CLG · PSG  
_ClearPath AI Team — 2026_

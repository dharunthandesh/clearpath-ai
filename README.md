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



## 🧠 AI Detection Classes

| Class                  | Severity | Description                              |
|------------------------|----------|------------------------------------------|
| `illegal_parking`      | 🔴 Red    | Vehicles parked on emergency lanes       |
| `construction`         | 🟡 Yellow | Construction materials/barriers          |
| `vendor_encroachment`  | 🟡 Yellow | Street stalls occupying road space       |
| `garbage_truck`        | 🔴 Red    | Garbage vehicles blocking lanes          |
| `clear_road`           | 🟢 Green  | No obstruction detected                  |



## 🤝 Team

Built for **AI4DEV Smart City Hackathon** — BEYOND CLG · PSG  
_ClearPath AI Team — 2026_

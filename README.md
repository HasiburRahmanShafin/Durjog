# DURJOG (দুর্যোগ) – Disaster Early Warning & Response System

> A real-time natural disaster intelligence, early warning, and community coordination platform engineered specifically for the disaster-prone landscape of Bangladesh.

---

## 📌 Overview

**DURJOG** is an end-to-end full-stack platform designed to safeguard lives and livelihoods in Bangladesh by monitoring, forecasting, and communicating natural hazards—primarily monsoon floods and earthquakes. It connects meteorological and seismic sensors, administrative geospatial boundaries, and ground-level citizen reports into a unified command and response dashboard.

---

## 🌟 Key Features

### 1. Geospatial Vulnerability Mapping (Leaflet + GeoJSON)
- **District-Level Polygons:** Interactive map displaying risk scores (0–100) for all 64 districts in Bangladesh.
- **Dynamic Overlays:**
  - 🌊 **Flood-Prone Areas:** Visualized monsoon flooding zones across Sylhet, Sunamganj, Kurigram, and coastal belts.
  - ⚠️ **Seismic Fault Lines:** Geospatial fault lines depicting high-risk tectonic zones (Dauki fault, Madhupur fault, Chittagong-Tripura fold belt).
- **Vulnerability Side Panel:** Real-time breakdown of seismic zone categorization, flood proneness, and risk indices.

### 2. River Station Flood Monitoring & Predictive Forecasting
- **Water Level Gauges:** Tracks Bangladesh Water Development Board (BWDB) river monitoring stations against localized danger levels.
- **Predictive Projections:** Generates 24-hour and 48-hour forecasted water levels utilizing upstream rainfall telemetry and rising/falling trend vectors.
- **Affected Upazila Detection:** Instantly flags administrative upazilas where water levels exceed danger thresholds.

### 3. Real-Time USGS Seismic Tracker
- **Automated USGS Feed:** Ingests earthquake data from the USGS API across Bangladesh and surrounding tectonic boundaries (`20.5°N–26.5°N, 88.0°E–92.5°E`).
- **Dynamic Proximity Matching:** Determines the nearest upazila using spherical GeoJSON coordinate distance calculations and triggers automated alerts when magnitude $\ge 5.0$ within a 150 km radius.
- **Aftershock Tracking:** Correlates major seismic events with chronological aftershock logs.

### 4. Real-Time Alert Engine & Multi-Channel Notifications
- **Automated Rule Engine:** Evaluates flood and earthquake triggers every 15 minutes.
- **Private Socket.io Rooms:** Dispatches instant websocket alerts directly to connected users based on their followed Upazilas.
- **Automated Email Dispatch:** Sends immediate emergency advisories with actionable safety recommendations via Nodemailer.

### 5. Community Incident Reporting & Mutual Aid
- **Citizen Field Reports:** Enables residents to report localized floods, waterlogging, or structural cracks with GPS coordinates and photo attachments.
- **Admin Verification Workflow:** Dedicated admin console to review, approve, or reject field submissions.
- **Emergency Shelter Finder:** Discovers nearest open shelters using MongoDB `$geoNear` spatial indexing with one-click Google Maps navigation.
- **Resource Demand Board:** Shelters and administrators post urgent supplies needed (drinking water, dry food, medical kits), allowing citizens to offer direct aid.

### 6. Historical Disaster Catalog & Interactive Timeline
- Retrospective case studies of major Bangladesh disaster events (e.g., 2022 Sylhet Mega Flood, Cyclone Sidr 2007, 1998 Great Flood, 1991 Chittagong Cyclone) with financial loss and population impact metrics.
- Unified multi-disaster event timeline combining historical disasters with live automated alerts.

---

## 🏗️ System Architecture & Directory Structure

```
durjog/
├── package.json                 # Monorepo root scripts & dev orchestration
├── .gitignore                   # Root gitignore (safeguards secrets & node_modules)
├── backend/
│   ├── .env.example             # Backend environment variable template
│   ├── package.json             # Express, Mongoose, Socket.io, Axios, Nodemailer
│   ├── server.js                # Server entry point, Socket.io server, cron scheduler
│   ├── data/                    # GeoJSON & administrative datasets of Bangladesh
│   │   ├── bangladesh.geojson   # National district polygon boundaries
│   │   ├── seismic-zones.geojson# Tectonic fault line coordinates
│   │   ├── flood-prone-areas.geojson # Flood prone polygons
│   │   ├── bd-divisions.json    # Divisions list with coordinates
│   │   ├── bd-districts.json    # 64 districts data
│   │   ├── bd-upazilas.json     # 495 upazilas data
│   │   └── riverStationsDetailed.json # River gauge stations & danger marks
│   ├── scripts/
│   │   └── seedLocations.js     # Seeds divisions, districts & upazilas to MongoDB
│   └── src/
│       ├── config/              # MongoDB connection setup
│       ├── controllers/         # Auth, Alerts, Disasters, Locations, Shelters, Reports
│       ├── middleware/          # JWT authentication, role authorization, validators
│       ├── models/              # Mongoose schemas (User, Alert, Location, Report, etc.)
│       ├── routes/              # Express API route declarations
│       └── services/            # Alert rule engine, USGS fetcher, email, socket
└── frontend/
    ├── .env.example             # Frontend environment variable template
    ├── package.json             # React 19, React Router v7, Leaflet, Tailwind CSS
    ├── public/                  # Static assets, logos, and historical disaster imagery
    └── src/
        ├── components/
        │   ├── admin/           # Admin verification & management views
        │   ├── auth/            # Login, registration, password recovery
        │   ├── common/          # ProtectedRoute, Spinners
        │   ├── community/       # Citizen report submitter, resource boards
        │   ├── dashboard/       # Risk map, river gauges, earthquake tracker, timeline
        │   ├── layout/          # Navbar, Footer, App shell
        │   ├── map/             # Leaflet GeoJSON interactive risk map
        │   └── profile/         # Upazila preferences & notification settings
        ├── context/             # AuthContext (JWT management & socket room bindings)
        └── services/            # Axios API interceptors & Socket.io client
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Local instance running on `mongodb://localhost:27017` or MongoDB Atlas URI

---

### Step 1: Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/HasiburRahmanShafin/Durjog.git
cd Durjog

# Install backend and frontend dependencies
npm run install:all
```

---

### Step 2: Environment Configuration

Create `.env` in both `backend` and `frontend` using the provided `.env.example` templates:

#### Backend (`backend/.env`):
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/durjog
FRONTEND_URL=http://localhost:3000

# Authentication Secrets
JWT_ACCESS_SECRET=your_jwt_access_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here

# Notification Service (Gmail App Password)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

#### Frontend (`frontend/.env`):
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

### Step 3: Seed Administrative Location Data

Populate MongoDB with Bangladesh's divisions, 64 districts, 495 upazilas, and default coordinates:

```bash
npm run seed
```

---

### Step 4: Run the Development Servers

You can launch both the backend API and the React frontend simultaneously:

```bash
# Run both backend & frontend concurrently
npm run dev
```

Alternatively, run each service in separate terminals:

```bash
# Backend (Port 5000)
npm run dev:backend

# Frontend (Port 3000)
npm run dev:frontend
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 REST API Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a citizen account |
| `POST` | `/api/auth/login` | Public | Login and receive JWT access token & HTTP cookie |
| `GET` | `/api/auth/profile` | Private | Retrieve authenticated user profile |
| `PUT` | `/api/auth/profile` | Private | Update followed upazilas & alert preferences |
| `GET` | `/api/locations` | Private | Fetch administrative locations (filter by type/search) |
| `GET` | `/api/locations/search` | Private | Autocomplete search for upazilas and districts |
| `GET` | `/api/locations/risk-summary`| Private | Top 5 districts by vulnerability score |
| `GET` | `/api/alerts/active` | Private | Active flood and earthquake warnings |
| `GET` | `/api/alerts/history` | Private | Paginated historical alerts |
| `GET` | `/api/disaster` | Private | Major historical disasters catalog with imagery |
| `GET` | `/api/disaster/river-stations`| Private | River gauge levels vs danger thresholds |
| `GET` | `/api/disaster/flood-forecast`| Private | 24h & 48h water level projections |
| `GET` | `/api/disaster/earthquakes/recent`| Private | Live seismic events from USGS |
| `GET` | `/api/disaster/timeline` | Private | Chronological multi-hazard disaster timeline |
| `POST`| `/api/community/reports` | Private | Submit citizen field report with GPS & photo |
| `GET` | `/api/community/reports` | Private | Fetch submitted incident reports |
| `PUT` | `/api/community/reports/verify` | Admin | Approve or reject a citizen report |
| `GET` | `/api/community/shelters/nearby` | Private | Find nearest open shelters via GPS ($geoNear) |
| `GET` | `/api/community/resources` | Private | View active mutual aid resource requests |
| `POST`| `/api/community/resources/:id/offer` | Private | Citizen offers to fulfill shelter resource need |

---

## 🛡️ License

Developed under the ISC License. Designed for national disaster preparedness and humanitarian safety in Bangladesh.

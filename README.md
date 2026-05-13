# rescuenet_ai
AI-powered real-time disaster response and emergency mapping platform.

# RescueNet AI 🚨

AI-Powered Disaster Response & Emergency Management Platform

---

## 📌 Overview

RescueNet AI is a smart emergency response platform designed to help civilians, responders, and administrators coordinate efficiently during disasters and emergency situations.

The system allows users to:

* Report emergencies in real time
* Send SOS requests to nearby emergency services
* View live disaster locations on an interactive map
* Verify incidents through community voting
* Automatically notify the nearest emergency responders
* Manage incidents through dedicated admin and responder dashboards

The platform is designed with scalability, modular backend architecture, real-time updates, and role-based access systems.

---

# ✨ Key Features

## 👤 User Features

### 🚨 Emergency Reporting

Users can report incidents such as:

* Fire outbreaks
* Medical emergencies
* Floods
* Accidents
* Crimes
* Natural disasters

Reports include:

* Live GPS location
* Incident type
* Severity level
* Description
* Uploaded media/images

---

### 🆘 SOS Emergency System

Users can instantly request emergency help.

Supported services:

* 🚓 Police
* 🚑 Ambulance
* 🚒 Fire Brigade

Supports:

* Single-service SOS
* Multi-service SOS

Example:

* Police + Ambulance
* Ambulance + Fire Brigade
* Police + Fire Brigade

The system automatically identifies and assigns the nearest responder stations.

---

### 🗺️ Live Disaster Map

Interactive live map built using Leaflet.

Features:

* Real-time incident markers
* Disaster visualization
* Incident verification voting
* GPS-based reporting
* Location-based alerts

---

### ✅ Community Verification System

Users can vote on incidents to verify authenticity.

Voting types:

* Confirm
* Fake/Spam

This helps reduce false reports.

---

# 🛡️ Admin Features

## 🔐 Admin Authentication

Protected admin routes using role-based route protection.

---

## 📊 Admin Dashboard

Separate dashboard for administrators.

Includes:

* Incident monitoring
* SOS management
* Live map overview
* Report management
* Responder tracking

---

## 🗺️ Admin Live Map

Admins can monitor:

* Active incidents
* Deployed responders
* SOS locations
* Disaster clusters

---

## 📁 Report Management

Admins can:

* View all reports
* Monitor incident status
* Track disaster activity

---

# 🚓 Responder System

Dedicated responder system for:

* Police
* Ambulance
* Fire Brigade

---

## 🔒 Responder Authentication

Each responder department has:

* Separate login
* Password protection
* Role-based dashboard access

Security features:

* Protected routes
* Department isolation
* Unauthorized access prevention

---

## 🚑 Responder Dashboards

Each department only sees incidents relevant to them.

Example:

* Police sees police-related incidents
* Ambulance sees medical incidents
* Fire brigade sees fire incidents

Multi-service incidents appear to all assigned departments.

---

## 🚨 Incident Workflow

Responders can:

### Deploy Incident

Status changes:

```
PENDING → DEPLOYED
```

### Resolve Incident

Status changes:

```
DEPLOYED → RESOLVED
```

---

# 🤖 AI Integration

## Gemini AI

Google Gemini AI is integrated for:

* Severity analysis
* Intelligent classification
* Emergency analysis support

---

# ⚙️ Tech Stack

## Frontend

* React.js
* Vite
* Tailwind CSS
* React Router DOM
* React Leaflet
* Firebase SDK

---

## Backend

* Node.js
* Express.js
* Firebase Admin SDK
* Firestore Database
* Node Cron

---

## Database

* Firebase Firestore

---

## Maps & Location

* Leaflet Maps
* OpenStreetMap
* Browser Geolocation API
* Reverse Geocoding

---

## AI

* Google Gemini AI

---

# 🏗️ Project Architecture

## Frontend Structure

```bash
client/src
│
├── components
├── layouts
├── pages
│   ├── admin
│   └── responder
├── services
├── hooks
├── utils
└── firebase
```

---

## Backend Structure

```bash
server
│
├── controllers
├── routes
├── jobs
├── utils
├── config
├── middleware
└── index.js
```

---

# 📄 Important Routes

## User Routes

| Route      | Description       |
| ---------- | ----------------- |
| `/`        | Home Page         |
| `/report`  | Report Incident   |
| `/livemap` | Live Disaster Map |
| `/sos`     | Emergency SOS     |

---

## Admin Routes

| Route            | Description        |
| ---------------- | ------------------ |
| `/admin-access`  | Admin Login        |
| `/admin`         | Admin Overview     |
| `/admin/map`     | Admin Live Map     |
| `/admin/sos`     | SOS Management     |
| `/admin/reports` | Reports Management |

---

## Responder Routes

| Route                  | Description         |
| ---------------------- | ------------------- |
| `/responder`           | Responder Login     |
| `/responder/police`    | Police Dashboard    |
| `/responder/ambulance` | Ambulance Dashboard |
| `/responder/fire`      | Fire Dashboard      |

---

# 🔐 Security Features

* Role-based authentication
* Protected routes
* Admin isolation
* Responder isolation
* Firebase secret protection
* Rate limiting
* Unauthorized access prevention

---

# 🌍 Real-Time Features

* Live Firestore updates
* Real-time incident monitoring
* Dynamic responder updates
* Instant SOS requests
* Live map marker updates

---

# 🚀 Future Improvements

Potential future upgrades:

* SMS/Email alerts
* Push notifications
* AI-based disaster prediction
* Heatmap analytics
* Voice SOS system
* Offline emergency support
* Mobile app version
* Real responder station integration
* Satellite/weather APIs

---

# 🧪 Testing

## Admin Login

Access:

```
/admin-access
```

---

## Responder Login

Access:

```
/responder
```

Departments:

* Police
* Ambulance
* Fire Brigade

---

# 🛠️ Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/rescuenet_ai.git
```

---

## Frontend Setup

```bash
cd client
npm install
npm run dev
```

---

## Backend Setup

```bash
cd server
npm install
node index.js
```

---

# 🔑 Environment Variables

Create a `.env` file inside `server/`

Example:

```env
GEMINI_API_KEY=your_api_key
```

---

# 🔥 Firebase Setup

1. Create Firebase project
2. Enable Firestore
3. Download Service Account Key
4. Save as:

```bash
server/serviceAccountKey.json
```

5. Add to `.gitignore`

---

# 📷 Screenshots

Add screenshots here:

* Home Page
* Live Map
* SOS System
* Admin Dashboard
* Responder Dashboards

---

# 🎯 Project Goals

The main goal of RescueNet AI is to:

* Reduce emergency response time
* Improve disaster coordination
* Enable smart emergency communication
* Assist responders with real-time information
* Build a scalable AI-powered emergency platform

---

# 👨‍💻 Developed By

RescueNet AI Team

---

# 📜 License

This project is developed for educational, research, and hackathon purposes.

---

# ⭐ Final Note

RescueNet AI demonstrates how AI, real-time systems, mapping technologies, and role-based emergency management can be combined to create a modern disaster response platform.

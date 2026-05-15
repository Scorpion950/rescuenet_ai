# 🚨 RescueNet AI — Premium Disaster Response & Mapping

[![GitHub Stars](https://img.shields.io/github/stars/Scorpion950/rescuenet_ai?style=for-the-badge&color=ffd700)](https://github.com/Scorpion950/rescuenet_ai)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Built with Gemini](https://img.shields.io/badge/AI-Google%20Gemini-blue?style=for-the-badge&logo=google-gemini)](https://ai.google.dev/)
[![Security](https://img.shields.io/badge/Security-Auth0-eb5424?style=for-the-badge&logo=auth0)](https://auth0.com/)

**RescueNet AI** is a state-of-the-art, AI-powered disaster management platform designed to bridge the gap between civilians, emergency responders, and administrators during critical situations. Built for the modern web with a focus on speed, accessibility, and intelligent automation.

---

## 📺 Live Demo
🔗 **[Launch RescueNet AI](https://rescuenet-ai.netlify.app)**

---

## 🚀 The "Big Brain" Features

### 🤖 AI-Powered Triage (Google Gemini)
The platform uses **Google Gemini Vision & Pro** to automatically analyze user reports. It detects the severity level (Critical, High, Medium, Low) from both the user's description and uploaded photos/videos, ensuring that the most life-threatening incidents move to the top of the queue instantly.

### 📷 Live Emergency Capture
Equipped with a **Native Mobile Camera** integration. Civilians can record high-quality video or snap photos of a disaster site directly within the browser, utilizing the phone's hardware features (flash, zoom, 4K) for better evidence collection.

### 📱 Intelligent SMS Alerts (Twilio)
When a disaster is reported, RescueNet AI calculates a **5KM danger radius**. It instantly triggers **Twilio SMS Alerts** to every registered user within that radius, providing them with escape routes and live safety updates.

### 🔐 Multi-Layer Security
- **Civilians:** Secured via **Auth0 Google Login** with mandatory phone number verification.
- **Admins:** Protected by a secondary hardware-style **Secure Access Key**.
- **Responders:** Dedicated department isolation (Police, Fire, Medical).

---

## 🛠️ The Architecture

### 💻 Frontend (The Visual Experience)
- **Framework:** React 18 + Vite (for lightning-fast loads)
- **Styling:** Premium **Glassmorphism UI** using Tailwind CSS + Custom Backdrop Blurs.
- **Mapping:** **Leaflet.js** with Custom Hazard Zone Layers & Google Maps-style "Locate Me" GPS tracking.
- **Animations:** Custom **Fade-In-Up** entry transitions for a premium application feel.

### ⚙️ Backend (The Engine)
- **Runtime:** Node.js + Express
- **Database:** **Firebase Firestore** (Real-time NoSQL synchronization)
- **Media:** **Cloudinary** (Auto-optimizing emergency footage)
- **Automation:** **Node-Cron** for automatic incident resolution and cleanup.

---

## 🗺️ User Roles & Workflows

| Role | Access | Key Capabilities |
| :--- | :--- | :--- |
| **Civilian** | `/report` | AI Report, SOS Requests, Live Map Tracking, SMS Alerts |
| **Responder** | `/responder` | Incident Deployment, Real-time Navigation, Status Management |
| **Admin** | `/admin` | Global Oversight, Hardware-Key Login, Master Incident Control |

---

## 🏗️ Technical Setup

### Prerequisites
- Node.js v16+
- Firebase Project (Firestore enabled)
- Google Gemini API Key
- Twilio Account (SID, Token, and Phone Number)
- Cloudinary Account (Upload Preset & Cloud Name)

### Installation

1. **Clone the project**
   ```bash
   git clone https://github.com/Scorpion950/rescuenet_ai.git
   cd rescuenet_ai
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   # Add your .env variables (Twilio, Gemini, Firebase)
   node index.js
   ```

3. **Frontend Setup**
   ```bash
   cd client
   npm install
   # Add your .env variables (Cloudinary, Auth0, API URL)
   npm run dev
   ```

---

## 🎨 Design Philosophy
RescueNet AI is built with a **Premium Dark Aesthetic**. We believe that in high-stress emergency situations, the UI should be calm, legible, and "High-Contrast." Our use of **Frosted Glass (Glassmorphism)** and **Vibrant Emergency Colors** ensures that critical information is never missed.

---

## 👨‍💻 Development Team
Developed with ❤️ by the **RescueNet AI Team** for a professional Hackathon presentation.

---

### ⭐ Show your support!
If you find this project useful for disaster response or learning, please give it a star on GitHub! 🌟

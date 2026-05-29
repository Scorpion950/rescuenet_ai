# RescueNet AI

**AI-Powered Disaster Management & Emergency Response Platform**

[![Live Demo](https://img.shields.io/badge/Live-rescuenet--ai.netlify.app-success?style=flat-square)](https://rescuenet-ai.netlify.app)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green?style=flat-square)](https://nodejs.org)

---

## Overview

RescueNet AI is an enterprise-grade disaster management platform that bridges the critical communication gap between civilians, emergency responders, and administrators during disaster situations. The platform leverages AI-powered incident triage, real-time geolocation, and automated emergency dispatch to optimize response times and save lives.

**Key Problem Solved:** Eliminates communication delays during emergencies by automatically classifying incident severity, identifying appropriate response teams, and alerting nearby civilians within danger zones.

---

## Core Features

### 🤖 AI-Powered Incident Triage
- **Google Gemini Vision & Pro Integration:** Analyzes text descriptions and media (images/videos) to automatically classify incident severity (Critical → High → Medium → Low)
- **Smart Department Assignment:** Auto-assigns incidents to appropriate response teams (Police, Fire, Medical)
- **Multi-Model Fallback:** Implements model candidacy with graceful degradation for reliability
- **Sub-2-second Response Time:** Optimized for emergency scenarios

### 📍 Intelligent Geolocation Alerts
- **5km Danger Radius Detection:** Automatically calculates affected zone around incident
- **Twilio SMS Integration:** Real-time SMS notifications to all registered users within danger zone
- **Escape Route Guidance:** Provides actionable safety recommendations to civilians
- **Live GPS Tracking:** Real-time incident location monitoring and updates

### 📷 Native Camera Integration
- **Hardware-Accelerated Capture:** Direct access to device camera (flash, zoom, 4K recording)
- **In-App Media Recording:** High-quality photo and video capture without app download
- **Cloudinary Optimization:** Automatic media compression and CDN delivery
- **Evidence Preservation:** Timestamped incident documentation

### 🔐 Multi-Layer Role-Based Access Control
- **Civilian Authentication:** Auth0 OAuth 2.0 (Google) + SMS phone verification
- **Responder Isolation:** Department-specific credentials (Police/Fire/Medical)
- **Admin Hardware Keys:** Secure secondary authentication for administrative access
- **Anonymous Map Access:** Unauthenticated Live Map viewing with read-only permissions

### 📊 Real-Time Incident Dashboard
- **Leaflet.js Interactive Maps:** Custom hazard zone visualization with marker clustering
- **Department-Specific Dashboards:** Tailored views for Civilians, Responders, and Admins
- **Live Status Updates:** WebSocket-powered real-time incident synchronization
- **Automatic Incident Resolution:** Node-Cron scheduled jobs for incident lifecycle management

---

## Technology Stack

### Frontend
| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | React 18 + Vite | Component-based UI with instant HMR |
| **Styling** | Tailwind CSS 4 | Utility-first glassmorphism design system |
| **Routing** | React Router v7 | SPA navigation and protected routes |
| **Mapping** | Leaflet.js + React-Leaflet | Interactive geospatial visualization |
| **Clustering** | React-Leaflet Cluster | Optimized marker rendering at scale |
| **UI Feedback** | React Hot Toast | Non-blocking notifications |
| **Authentication** | Auth0 React SDK | OAuth 2.0 integration |
| **AI Models** | Google Generative AI | Client-side Gemini API calls |

### Backend
| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Runtime** | Node.js 16+ | JavaScript server runtime |
| **Framework** | Express 5 | Minimal web application framework |
| **Database** | Firebase Firestore | Real-time NoSQL document store |
| **Authentication** | Firebase Admin SDK | Server-side auth token verification |
| **AI Models** | Google Generative AI | Gemini Vision + Pro models |
| **SMS Gateway** | Twilio SDK | SMS delivery and management |
| **Media CDN** | Cloudinary | Image/video optimization and delivery |
| **Job Scheduling** | Node-Cron | Scheduled incident lifecycle tasks |
| **Rate Limiting** | Express Rate Limit | API protection against abuse |
| **CORS** | CORS Middleware | Cross-origin request handling |

### Infrastructure & Deployment
- **Frontend Hosting:** Netlify (with Vercel alternative)
- **Database Hosting:** Firebase Cloud
- **Service Accounts:** Firebase Admin SDK configuration
- **Environment Management:** Dotenv for secrets management

---

## Architecture

```
RescueNet AI
├── Frontend (React 18 + Vite)
│   ├── Pages (Report, SOS, Live Map, Admin/Responder Dashboards)
│   ├── Components (AlertCard, MapPopup, Navbar, Protected Routes)
│   ├── Services (AI Analysis, Incident Management, Responder Coordination)
│   ├── Hooks (useNearbyAlerts for real-time updates)
│   └── Layouts (Role-specific UI templates)
│
└── Backend (Node.js + Express)
    ├── Routes (AI, Auth, Incidents, Responders, SMS, SOS, Status)
    ├── Controllers (Business logic for each domain)
    ├── Middleware (Authentication, Authorization, Rate Limiting)
    ├── Services (Gemini AI, Twilio SMS, Distance Calculation)
    ├── Jobs (Auto-resolve, Incident Cleanup)
    └── Data (Predefined emergency response stations)
```

---

## User Roles & Workflows

| Role | Authentication | Primary Functions | Dashboard |
|------|----------------|------------------|-----------|
| **Civilian** | Auth0 + SMS Verify | Create Reports, SOS Alerts, View Live Map, Receive SMS Alerts | Personal Incident History |
| **Responder** | Firebase Auth | Deploy to Incidents, Update Status, Navigate GPS, View Department Queue | Department-Specific Queue |
| **Administrator** | Hardware Key + Firebase | Global Incident Control, Responder Management, System Oversight, Reports | Global Analytics Dashboard |

---

## Project Structure

```
rescuenet_ai/
├── client/                          # React frontend
│   ├── src/
│   │   ├── pages/                   # Route pages
│   │   ├── components/              # Reusable UI components
│   │   ├── layouts/                 # Role-specific layouts
│   │   ├── services/                # API integration layer
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── context/                 # Global state (LocationContext)
│   │   ├── utils/                   # Helpers (constants, AI utils)
│   │   └── firebase.js              # Firebase configuration
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
│
├── server/                          # Node.js backend
│   ├── controllers/                 # Business logic
│   ├── routes/                      # API endpoints
│   ├── middleware/                  # Auth, validation, rate limiting
│   ├── jobs/                        # Scheduled tasks
│   ├── utils/                       # Distance calc, station lookup
│   ├── config/                      # Firebase admin setup
│   ├── data/                        # Seed data (stations)
│   ├── package.json
│   └── index.js
│
└── README.md                        # This file
```

---

## Getting Started

### Prerequisites
- **Node.js** v16 or higher
- **npm** 8+ (or yarn)
- **Firebase Project** (Firestore database enabled)
- **Google Gemini API Key** (from ai.google.dev)
- **Twilio Account** (SID, Auth Token, Phone Number)
- **Auth0 Application** (OAuth 2.0 credentials for Google)
- **Cloudinary Account** (Cloud Name, Upload Preset)

### Installation

#### 1. Clone Repository
```bash
git clone https://github.com/Scorpion950/rescuenet_ai.git
cd rescuenet_ai
```

#### 2. Backend Setup
```bash
cd server
npm install

# Create .env file with required variables:
# GEMINI_API_KEY=your_google_gemini_key
# FIREBASE_PROJECT_ID=your_firebase_project_id
# TWILIO_ACCOUNT_SID=your_twilio_sid
# TWILIO_AUTH_TOKEN=your_twilio_token
# TWILIO_PHONE_NUMBER=your_twilio_number

# Start server (development)
npm run dev

# Or production
npm start
```

Server will run on `http://localhost:5000` (or configured PORT)

#### 3. Frontend Setup
```bash
cd ../client
npm install

# Create .env file:
# VITE_API_BASE_URL=http://localhost:5000
# VITE_FIREBASE_API_KEY=your_firebase_key
# VITE_AUTH0_DOMAIN=your_auth0_domain
# VITE_AUTH0_CLIENT_ID=your_auth0_client_id

# Start development server
npm run dev

# Production build
npm run build
```

Frontend will run on `http://localhost:5173`

---

## API Endpoints

### Incident Management
- `POST /api/incidents` - Create new incident report
- `GET /api/incidents` - Fetch nearby incidents (with geofencing)
- `PUT /api/incidents/:id` - Update incident status
- `GET /api/incidents/:id` - Get incident details

### AI Analysis
- `POST /api/analyze-report` - Analyze incident via Gemini (severity + department)

### Responder Management
- `GET /api/responders` - List active responders
- `PUT /api/responders/:id/status` - Update responder status
- `GET /api/responders/nearest` - Find nearest responder stations

### SMS & Notifications
- `POST /api/sms/send-alert` - Trigger SMS alert to geofenced users
- `POST /api/sos` - Emergency SOS request

### Authentication
- `POST /api/auth/verify` - Verify phone number
- `POST /api/auth/admin-key` - Admin secure key verification

---

## Deployment

### Frontend (Netlify)
```bash
# Automatic deployment from GitHub
# Push to main → Netlify builds and deploys automatically
```

**Live:** https://rescuenet-ai.netlify.app

### Backend (Render / Railway / Heroku)
```bash
# Set environment variables in hosting platform
# Deploy from GitHub repository
```

---

## Performance Optimizations

- **Vite:** Sub-1-second HMR for development, optimized code splitting
- **Leaflet Clustering:** Handles 1000+ incident markers efficiently
- **Firebase Realtime:** Direct WebSocket connection for instant updates
- **Cloudinary CDN:** Auto-optimized media delivery globally
- **Rate Limiting:** Express Rate Limit prevents API abuse
- **Lazy Component Loading:** React.lazy() for route-based code splitting

---

## Security Considerations

✅ **Implemented**
- Auth0 OAuth 2.0 for civilian authentication
- Firebase security rules for Firestore access control
- Phone number verification for account confirmation
- Admin hardware key secondary authentication
- Rate limiting on critical endpoints
- CORS configuration for origin validation
- Environment variable secrets management

⚠️ **Additional Recommendations**
- Enable HTTPS/TLS for all communications
- Implement API key rotation policies
- Add audit logging for admin actions
- Use Firebase backup/restore for disaster recovery
- Implement IP whitelisting for admin endpoints

---

## Development Workflow

### Available Scripts

**Frontend:**
```bash
npm run dev      # Start Vite dev server
npm run build    # Production build
npm run preview  # Preview production build locally
npm run lint     # ESLint code quality checks
```

**Backend:**
```bash
npm run dev      # Start with Nodemon auto-reload
npm start        # Start production server
```

---

## Troubleshooting

### Common Issues

**Issue:** `GEMINI_API_KEY is not configured`
- **Solution:** Verify `.env` file exists in `/server` with `GEMINI_API_KEY` set

**Issue:** Firebase Anonymous Auth fails (403)
- **Solution:** Enable Anonymous Sign-In in Firebase Console → Authentication

**Issue:** Twilio SMS not sending
- **Solution:** Verify Twilio credentials and that the phone number is valid

**Issue:** Leaflet map not displaying
- **Solution:** Ensure Leaflet CSS is loaded; check for CORS issues with tile provider

---

## License

MIT License - See LICENSE file for details

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Support

For issues, questions, or feature requests:
- **GitHub Issues:** [Create an issue](https://github.com/Scorpion950/rescuenet_ai/issues)
- **Documentation:** Refer to individual component comments in source code

---

## 👨‍💻 Development Team
Developed with ❤️ by the **RescueNet AI Team** for a professional Hackathon presentation.

---

### ⭐ Show your support!
If you find this project useful for disaster response or learning, please give it a star on GitHub! 🌟

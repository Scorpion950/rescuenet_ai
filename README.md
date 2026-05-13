# RescueNet_Ai

A comprehensive, multi-agent AI-powered real-time disaster management ecosystem. This system streamlines emergency response from citizen SOS alerts to professional responder dispatch and status tracking, all supported by intelligent routing and incident analysis.

## 🏗️ Architecture

RescueNet_Ai operates as a full-stack MERN application with specialized modules for disaster management.

*   **Frontend**: React + Redux Toolkit
*   **Backend**: Express.js + Node.js
*   **Database**: Firebase Firestore
*   **AI/ML**: Custom AI services for disaster prediction, route optimization, and incident classification
*   **Mapping**: Google Maps Platform (Geocoding, Directions, Map Styling)

## 🚀 Core Features

### Citizen-Facing Features

*   **SOS Alerts**: Instant emergency alerts with real-time location tracking.
*   **Victim Dashboard**: Track the status of your emergency request.
*   **Incident Reports**: View and manage your emergency reports.

### Responder & Dispatch Features

*   **Responder Dashboard**: Monitor incoming SOS requests and active incidents.
*   **Smart Routing**: AI-powered shortest path and traffic-aware routing to incident locations.
*   **Status Management**: Update incident status (Pending, In Progress, Completed) with real-time updates.

### Admin Features

*   **Incident Management**: Overview of all active and historical incidents.
*   **Responder Management**: Onboard, manage, and monitor rescue team members.
*   **Disaster Modeling**: AI-driven insights and prediction models for disaster management.
*   **System Health**: Monitor overall system performance and alerts.

### Security

*   **Role-Based Access**: Secure authentication for Citizens, Responders, and Admins.
*   **Rate Limiting**: Request rate limiting to ensure system stability.

## 🛠️ Tech Stack

### Frontend

*   **UI Framework**: React 18
*   **State Management**: Redux Toolkit
*   **Routing**: React Router
*   **Mapping**: `react-google-maps`
*   **Styling**: Custom CSS + Google Maps custom styling

### Backend

*   **Runtime**: Node.js (v22.18.0)
*   **Framework**: Express.js
*   **Database**: Firebase Admin SDK
*   **Security**: JWT-based authentication, Password Hashing
*   **AI Services**: Custom AI microservices for routing and predictions

### Services & Tools

*   **Google Maps API**: Geocoding, Directions, Static Maps
*   **Firebase Admin SDK**: Real-time database and authentication services

## 🏁 Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

*   Node.js (v20.0.0 or higher)
*   npm (or yarn)
*   Google Cloud Project with Maps Platform APIs enabled
*   Firebase Project with Firestore Database

### 1. Backend Setup

1.  Navigate to the server directory:
    ```bash
    cd server
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure Environment Variables:
    Create a `.env` file in the `server` directory:
    ```env
    PORT=5000
    GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_KEY
    FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
    ```
    *   Get your Google Maps API Key from the Google Cloud Console.
    *   Download the Firebase Admin SDK JSON file and rename it to `serviceAccountKey.json`, then place it in the `server/config` folder.

4.  Start the server:
    ```bash
    node index.js
    ```
    The server will start on `http://localhost:5000`.

### 2. Frontend Setup

1.  Navigate to the client directory:
    ```bash
    cd client
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure Environment Variables:
    Create a `.env` file in the `client` directory:
    ```env
    VITE_API_URL=http://localhost:5000
    VITE_GOOGLE_MAPS_KEY=YOUR_GOOGLE_MAPS_KEY
    ```

4.  Start the development server:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

### 3. Seed Database (Admin Setup)

To use the application, you need an admin user.

1.  Go to `http://localhost:5173` and register a new account (e.g., with email `admin@example.com`).
2.  Access the admin panel at `http://localhost:5173/admin`.
3.  (Optional) Manually promote your account to admin in the Firebase Console Firestore database (`users` collection) or by running a script (not included in this version).

## 📁 Project Structure

```
rescuenet_ai/
├── client/                # React Frontend
│   ├── src/
│   │   ├── components/    # React Components
│   │   ├── pages/       # Page Components
│   │   ├── redux/       # Redux Toolkit Stores
│   │   └── layouts/     # Layouts (Citizen, Responder, Admin)
│   └── package.json
├── server/                # Node.js Backend
│   ├── config/          # Firebase Config & Service Account
│   ├── routes/          # API Routes
│   ├── controllers/     # Request Controllers
│   ├── services/        # Business Logic & AI Services
│   ├── middleware/      # Middleware (Auth, Validation)
│   └── .env             # Environment Variables
├── README.md              # Project Documentation
└── .gitignore             # Git Ignore Rules
```

## 📝 Notes

*   This project uses a **Service Worker** for background location tracking (optional, can be disabled in the browser).
*   **Firebase Firestore** is used for real-time data synchronization across the application.
*   **Rate limiting** is implemented on the backend to prevent abuse.

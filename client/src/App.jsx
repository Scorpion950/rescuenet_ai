import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

/* USER LAYOUT */
import UserLayout from
  "./layouts/UserLayout";

/* ADMIN LAYOUT */
import AdminLayout from
  "./layouts/AdminLayout";

/* RESPONDER LAYOUT */
import ResponderLayout from
  "./layouts/ResponderLayout";

/* PROTECTED ROUTES */
import AdminProtectedRoute from
  "./components/ProtectedRoutes/AdminProtectedRoute";

import UserProtectedRoute from
  "./components/ProtectedRoutes/UserProtectedRoute";

import ResponderProtectedRoute from
  "./components/ProtectedRoutes/ResponderProtectedRoute";

import { LocationProvider } from "./context/LocationContext";

/* USER PAGES */
import Home from
  "./pages/Home";

import Report from
  "./pages/Report";

import LiveMap from
  "./pages/LiveMap";

import SOS from
  "./pages/SOS";

/* ADMIN LOGIN */
import AdminLogin from
  "./pages/AdminLogin";

/* RESPONDER LOGIN */
import ResponderLogin from
  "./pages/ResponderLogin";

/* ADMIN PAGES */
import AdminOverview from
  "./pages/admin/AdminOverview";

import AdminMap from
  "./pages/admin/AdminMap";

import AdminSOS from
  "./pages/admin/AdminSOS";

import AdminReports from
  "./pages/admin/AdminReports";

/* RESPONDER PAGES */
import PoliceDashboard from
  "./pages/responder/PoliceDashboard";

import AmbulanceDashboard from
  "./pages/responder/AmbulanceDashboard";

import FireDashboard from
  "./pages/responder/FireDashboard";

import NotFound from "./pages/NotFound";

function App() {

  return (

    <BrowserRouter>
      <LocationProvider>
        <Routes>

          {/* USER ROUTES */}
          <Route
            element={<UserLayout />}
          >

            <Route
              path="/"
              element={<Home />}
            />

            <Route
              path="/report"
              element={
                <UserProtectedRoute>
                  <Report />
                </UserProtectedRoute>
              }
            />

            <Route
              path="/livemap"
              element={<LiveMap />}
            />

            <Route
              path="/sos"
              element={
                <UserProtectedRoute>
                  <SOS />
                </UserProtectedRoute>
              }
            />

            <Route
              path="/admin-access"
              element={<AdminLogin />}
            />

          </Route>

          {/* ADMIN ROUTES */}
          <Route
            element={<AdminLayout />}
          >

            {/* Overview */}
            <Route

              path="/admin"

              element={

                <AdminProtectedRoute>

                  <AdminOverview />

                </AdminProtectedRoute>

              }

            />

            {/* Admin Map */}
            <Route

              path="/admin/map"

              element={

                <AdminProtectedRoute>

                  <AdminMap />

                </AdminProtectedRoute>

              }

            />

            {/* SOS */}
            <Route

              path="/admin/sos"

              element={

                <AdminProtectedRoute>

                  <AdminSOS />

                </AdminProtectedRoute>

              }

            />

            {/* Reports */}
            <Route

              path="/admin/reports"

              element={

                <AdminProtectedRoute>

                  <AdminReports />

                </AdminProtectedRoute>

              }

            />

          </Route>

          {/* RESPONDER ROUTES */}
          <Route
            element={<ResponderLayout />}
          >

            {/* Responder Login */}
            <Route

              path="/responder"

              element={<ResponderLogin />}

            />

            {/* Police */}
            <Route

              path="/responder/police"

              element={

                <ResponderProtectedRoute

                  responderType="Police"

                >

                  <PoliceDashboard />

                </ResponderProtectedRoute>

              }

            />

            {/* Ambulance */}
            <Route

              path="/responder/ambulance"

              element={

                <ResponderProtectedRoute

                  responderType="Ambulance"

                >

                  <AmbulanceDashboard />

                </ResponderProtectedRoute>

              }

            />


            {/* Fire */}
            <Route

              path="/responder/fire"

              element={

                <ResponderProtectedRoute

                  responderType="Fire Brigade"

                >

                  <FireDashboard />

                </ResponderProtectedRoute>

              }

            />

            {/* Not Found */}
            <Route
              path="*"
              element={<NotFound />}
            />

          </Route>

        </Routes>
      </LocationProvider>
    </BrowserRouter>

  );

}

export default App;
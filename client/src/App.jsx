import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout";
import ResponderLayout from "./layouts/ResponderLayout";
import AdminProtectedRoute from "./components/ProtectedRoutes/AdminProtectedRoute";
import UserProtectedRoute from "./components/ProtectedRoutes/UserProtectedRoute";
import ResponderProtectedRoute from "./components/ProtectedRoutes/ResponderProtectedRoute";
import { LocationProvider } from "./context/LocationContext";

// Keep the map and operations bundles off the initial public home load.
const Home = lazy(() => import("./pages/Home"));
const Report = lazy(() => import("./pages/Report"));
const SOS = lazy(() => import("./pages/SOS"));
const LiveMap = lazy(() => import("./pages/LiveMap"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const ResponderLogin = lazy(() => import("./pages/ResponderLogin"));
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const AdminMap = lazy(() => import("./pages/admin/AdminMap"));
const AdminSOS = lazy(() => import("./pages/admin/AdminSOS"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const PoliceDashboard = lazy(() => import("./pages/responder/PoliceDashboard"));
const AmbulanceDashboard = lazy(() => import("./pages/responder/AmbulanceDashboard"));
const FireDashboard = lazy(() => import("./pages/responder/FireDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

export default function App() {
  return (
    <BrowserRouter>
      <LocationProvider>
        <Suspense fallback={<div className="session-state" role="status">Loading RescueNet…</div>}>
          <Routes>
            <Route element={<UserLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/livemap" element={<LiveMap />} />
              <Route path="/report" element={<UserProtectedRoute><Report /></UserProtectedRoute>} />
              <Route path="/sos" element={<UserProtectedRoute><SOS /></UserProtectedRoute>} />
              <Route path="/admin-access" element={<AdminLogin />} />
            </Route>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminProtectedRoute><AdminOverview /></AdminProtectedRoute>} />
              <Route path="/admin/map" element={<AdminProtectedRoute><AdminMap /></AdminProtectedRoute>} />
              <Route path="/admin/sos" element={<AdminProtectedRoute><AdminSOS /></AdminProtectedRoute>} />
              <Route path="/admin/reports" element={<AdminProtectedRoute><AdminReports /></AdminProtectedRoute>} />
            </Route>
            <Route element={<ResponderLayout />}>
              <Route path="/responder" element={<ResponderLogin />} />
              <Route path="/responder/police" element={<ResponderProtectedRoute responderType="Police">
                <PoliceDashboard /></ResponderProtectedRoute>} />
              <Route path="/responder/ambulance" element={<ResponderProtectedRoute responderType="Ambulance">
                <AmbulanceDashboard /></ResponderProtectedRoute>} />
              <Route path="/responder/fire" element={<ResponderProtectedRoute responderType="Fire Brigade">
                <FireDashboard /></ResponderProtectedRoute>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </LocationProvider>
    </BrowserRouter>
  );
}

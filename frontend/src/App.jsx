import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import RoleProtectedRoute from "./components/RoleProtectedRoute";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import MyReports from "./pages/MyReports";
import ReportPothole from "./pages/ReportPothole";
import PotholeDetails from "./pages/PotholeDetails";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminReports from "./pages/AdminReports";
import AdminPotholeDetails from "./pages/AdminPotholeDetails";

// Helper component for Root Route '/'
const RootRedirect = () => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-medium text-slate-500">Loading OK Driver Portal...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return role === "admin" ? (
    <Navigate to="/admin/dashboard" replace />
  ) : (
    <Navigate to="/dashboard" replace />
  );
};

function AppContent() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Normal User Routes */}
          <Route element={<RoleProtectedRoute allowedRoles={["user"]} />}>
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/my-reports" element={<MyReports />} />
            <Route path="/report" element={<ReportPothole />} />
            <Route path="/potholes/:id" element={<PotholeDetails />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<RoleProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/reports/:id" element={<AdminPotholeDetails />} />
          </Route>

          {/* Fallback Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} OK Driver — Smart Pothole Detection & Reporting Platform</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;

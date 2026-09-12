import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RoleProtectedRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-medium text-slate-500">Checking authorization permissions...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    // If logged in as normal user trying to access admin route, redirect to user dashboard
    // If logged in as admin trying to access restricted route, redirect to admin dashboard
    const fallbackPath = user?.role === "admin" ? "/admin/dashboard" : "/dashboard";
    return <Navigate to={fallbackPath} replace />;
  }

  return children ? children : <Outlet />;
};

export default RoleProtectedRoute;

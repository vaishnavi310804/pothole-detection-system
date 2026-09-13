import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, role, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const homePath = isAuthenticated
    ? role === "admin"
      ? "/admin/dashboard"
      : role === "authority"
      ? "/authority/dashboard"
      : "/dashboard"
    : "/login";

  return (
    <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to={homePath} className="flex items-center space-x-3 group">
          <div>
            <span className="font-extrabold text-lg text-slate-100 tracking-wide block leading-tight">
              OK Driver
            </span>
            <span className="text-[11px] text-amber-400 font-semibold block">
              Pothole Detection & Reporting
            </span>
          </div>
        </Link>

        <nav className="flex items-center space-x-2 sm:space-x-4">
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                  isActive("/login")
                    ? "bg-slate-800 text-amber-400 border border-slate-700"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                Login
              </Link>
              <Link
                to="/register"
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all shadow-xs ${
                  isActive("/register")
                    ? "bg-amber-400 text-slate-950"
                    : "bg-amber-500 hover:bg-amber-400 text-slate-950"
                }`}
              >
                Register
              </Link>
            </>
          ) : role === "admin" ? (
            <>
              <Link
                to="/admin/dashboard"
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  isActive("/admin/dashboard")
                    ? "bg-slate-800 text-amber-400 border border-slate-700 font-bold"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                Admin Dashboard
              </Link>
              <Link
                to="/admin/reports"
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  isActive("/admin/reports")
                    ? "bg-slate-800 text-amber-400 border border-slate-700 font-bold"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                All Reports
              </Link>

              {/* Admin User Info & Logout */}
              <div className="flex items-center pl-2 border-l border-slate-800 space-x-3">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-200">{user?.name}</span>
                  <span className="text-[10px] font-extrabold uppercase text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                    Admin
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-slate-700"
                >
                  Logout
                </button>
              </div>
            </>
          ) : role === "authority" ? (
            <>
              <Link
                to="/authority/dashboard"
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  isActive("/authority/dashboard")
                    ? "bg-slate-800 text-amber-400 border border-slate-700 font-bold"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                Ticket Dashboard
              </Link>

              {/* Authority Info & Logout */}
              <div className="flex items-center pl-2 border-l border-slate-800 space-x-3">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-200">{user?.name}</span>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 truncate max-w-[170px]" title={user?.authorityName}>
                    🏛️ {user?.authorityName || "Authority"}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-slate-700"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  isActive("/dashboard")
                    ? "bg-slate-800 text-amber-400 border border-slate-700 font-bold"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/my-reports"
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  isActive("/my-reports")
                    ? "bg-slate-800 text-amber-400 border border-slate-700 font-bold"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                My Reports
              </Link>
              <Link
                to="/report"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all shadow-xs"
              >
                + Report Pothole
              </Link>

              {/* User Info & Logout */}
              <div className="flex items-center pl-2 border-l border-slate-800 space-x-3">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-200">{user?.name}</span>
                  <span className="text-[10px] font-semibold text-slate-400">User</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-slate-700"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;

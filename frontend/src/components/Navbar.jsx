import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="bg-amber-500 text-slate-950 p-2 rounded-lg font-bold text-xl group-hover:bg-amber-400 transition-colors">
            OK
          </div>
          <div>
            <span className="font-bold text-lg text-slate-100 tracking-wide block leading-tight">
              OK Driver
            </span>
            <span className="text-xs text-amber-400 font-medium block">
              Pothole Detection & Reporting
            </span>
          </div>
        </Link>

        <nav className="flex items-center space-x-2 sm:space-x-4">
          <Link
            to="/"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive("/")
                ? "bg-slate-800 text-amber-400 border border-slate-700"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/report"
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all shadow-sm ${
              isActive("/report")
                ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                : "bg-amber-500 text-slate-950 hover:bg-amber-400"
            }`}
          >
            + Report Pothole
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;

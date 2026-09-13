import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyReports } from "../services/potholeService";
import PotholeCard from "../components/PotholeCard";

const UserDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getMyReports();
      setReports(data || []);
    } catch (err) {
      console.error("Error fetching user reports:", err);
      setError("Failed to load your reports. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isSubscribed = true;
    const fetchUserReports = async () => {
      try {
        setError("");
        const data = await getMyReports();
        if (isSubscribed) {
          setReports(data || []);
        }
      } catch (err) {
        console.error("Error fetching user reports:", err);
        if (isSubscribed) {
          setError("Failed to load your reports. Please try again.");
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    fetchUserReports();

    return () => {
      isSubscribed = false;
    };
  }, []);

  // Calculate metrics for current user
  const totalCount = reports.length;
  const reportedCount = reports.filter((p) => (p.status || p.reportStatus) === "Reported").length;
  const acknowledgedCount = reports.filter((p) => (p.status || p.reportStatus) === "Acknowledged").length;
  const assignedCount = reports.filter((p) => (p.status || p.reportStatus) === "Assigned").length;
  const inProgressCount = reports.filter((p) => (p.status || p.reportStatus) === "In Progress").length;
  const resolvedCount = reports.filter((p) => (p.status || p.reportStatus) === "Resolved").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Banner */}
      <div className="mb-8 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 text-xs font-semibold px-3 py-1 rounded-full mb-3 border border-amber-500/30">
            <span>👤 Normal User Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || "Driver"}!
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Track your submitted pothole reports, monitor repair statuses in real-time, and contribute to safer roads.
          </p>
        </div>

        <Link
          to="/report"
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 text-sm whitespace-nowrap"
        >
          <span>📸</span> Report New Pothole
        </Link>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Total Submitted
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalCount}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/30 shadow-2xs">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block mb-1">
            Reported
          </span>
          <span className="text-2xl sm:text-3xl font-black text-amber-600">{reportedCount}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/30 shadow-2xs">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block mb-1">
            Acknowledged
          </span>
          <span className="text-2xl sm:text-3xl font-black text-blue-600">{acknowledgedCount}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-indigo-200 bg-indigo-50/30 shadow-2xs">
          <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block mb-1">
            Assigned
          </span>
          <span className="text-2xl sm:text-3xl font-black text-indigo-600">{assignedCount}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-200 bg-purple-50/30 shadow-2xs">
          <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block mb-1">
            In Progress
          </span>
          <span className="text-2xl sm:text-3xl font-black text-purple-600">{inProgressCount}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-2xs">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">
            Resolved
          </span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-600">{resolvedCount}</span>
        </div>
      </div>

      {/* Recent Reports Section */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Recent Reports</h2>
          <p className="text-xs text-slate-500">Your latest submitted road hazard reports</p>
        </div>
        {reports.length > 0 && (
          <Link
            to="/my-reports"
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            View All My Reports →
          </Link>
        )}
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm font-medium text-slate-500">Loading your dashboard...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-center">
          <p className="text-rose-700 font-semibold mb-2">{error}</p>
          <button
            onClick={loadReports}
            className="text-xs bg-rose-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : reports.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 shadow-2xs">
          <p className="text-5xl mb-3">🕳️</p>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No Reports Submitted Yet</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            You haven't reported any potholes yet. Help make your community roads safer by reporting your first hazard.
          </p>
          <Link
            to="/report"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-lg text-sm transition-colors shadow-sm"
          >
            + Report a Pothole Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.slice(0, 6).map((pothole) => (
            <PotholeCard key={pothole._id} pothole={pothole} isAdmin={false} />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;

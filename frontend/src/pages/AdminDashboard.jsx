import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAllPotholes, deletePothole } from "../services/potholeService";
import PotholeCard from "../components/PotholeCard";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [potholes, setPotholes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshAllPotholes = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllPotholes();
      setPotholes(data || []);
    } catch (err) {
      console.error("Admin dashboard fetch error:", err);
      setError(
        err.response?.data?.message || "Failed to load administrative reports data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isSubscribed = true;
    const fetchAdminDashboard = async () => {
      try {
        setError("");
        const data = await getAllPotholes();
        if (isSubscribed) {
          setPotholes(data || []);
        }
      } catch (err) {
        console.error("Admin dashboard fetch error:", err);
        if (isSubscribed) {
          setError(
            err.response?.data?.message || "Failed to load administrative reports data."
          );
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    fetchAdminDashboard();

    return () => {
      isSubscribed = false;
    };
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this pothole report permanently?")) {
      return;
    }

    try {
      await deletePothole(id);
      setPotholes((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.response?.data?.message || "Failed to delete pothole report.");
    }
  };

  // Metrics computation for all reports
  const totalCount = potholes.length;
  const reportedCount = potholes.filter((p) => p.reportStatus === "Reported").length;
  const acknowledgedCount = potholes.filter((p) => p.reportStatus === "Acknowledged").length;
  const inProgressCount = potholes.filter((p) => p.reportStatus === "In Progress").length;
  const resolvedCount = potholes.filter((p) => p.reportStatus === "Resolved").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Admin Header Banner */}
      <div className="mb-8 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 rounded-2xl p-6 sm:p-8 text-slate-950 shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-slate-950/15 text-slate-950 text-xs font-extrabold px-3 py-1 rounded-full mb-3 border border-slate-950/20">
            <span>🛡️ Administrative Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
            Admin Dashboard Overview
          </h1>
          <p className="text-sm font-medium text-slate-900 mt-1 max-w-xl">
            Logged in as <span className="font-bold">{user?.name}</span> ({user?.email}). Manage all submitted road hazard reports and update repair status.
          </p>
        </div>

        <Link
          to="/admin/reports"
          className="bg-slate-950 hover:bg-slate-900 text-white font-bold px-5 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 text-sm whitespace-nowrap self-start sm:self-auto"
        >
          📋 Manage All Reports →
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Total Reports
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalCount}</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-amber-200 bg-amber-50/40 shadow-2xs">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">
            Reported
          </span>
          <span className="text-2xl sm:text-3xl font-black text-amber-600">{reportedCount}</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-blue-200 bg-blue-50/40 shadow-2xs">
          <span className="text-xs font-bold text-blue-800 uppercase tracking-wider block mb-1">
            Acknowledged
          </span>
          <span className="text-2xl sm:text-3xl font-black text-blue-600">{acknowledgedCount}</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-purple-200 bg-purple-50/40 shadow-2xs">
          <span className="text-xs font-bold text-purple-800 uppercase tracking-wider block mb-1">
            In Progress
          </span>
          <span className="text-2xl sm:text-3xl font-black text-purple-600">{inProgressCount}</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-emerald-200 bg-emerald-50/40 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1">
            Resolved
          </span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-600">{resolvedCount}</span>
        </div>
      </div>

      {/* Recent Reports Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Recent Hazard Submissions</h2>
          <p className="text-xs text-slate-500">Latest road hazard reports from all users</p>
        </div>
        <Link
          to="/admin/reports"
          className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
        >
          View All ({totalCount}) →
        </Link>
      </div>

      {/* Grid View */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm font-medium text-slate-500">Loading admin dashboard...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-center">
          <p className="text-rose-700 font-semibold mb-2">{error}</p>
          <button
            onClick={refreshAllPotholes}
            className="text-xs bg-rose-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : potholes.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 shadow-2xs">
          <p className="text-5xl mb-3">🧹</p>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No Pothole Reports System-Wide</h3>
          <p className="text-sm text-slate-500">No hazard reports have been submitted by any user yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {potholes.slice(0, 6).map((pothole) => (
            <PotholeCard
              key={pothole._id}
              pothole={pothole}
              onDelete={handleDelete}
              isAdmin={true}
              detailPath={`/admin/reports/${pothole._id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

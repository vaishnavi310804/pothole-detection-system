import { useState, useEffect } from "react";
import { getAllPotholes, deletePothole } from "../services/potholeService";
import PotholeCard from "../components/PotholeCard";

const Dashboard = () => {
  const [potholes, setPotholes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters state
  const [reportStatusFilter, setReportStatusFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");

  const loadPotholes = async () => {
    try {
      setLoading(true);
      setError("");

      const filters = {};
      if (reportStatusFilter) filters.reportStatus = reportStatusFilter;
      if (severityFilter) filters.severity = severityFilter;

      const data = await getAllPotholes(filters);
      setPotholes(data || []);
    } catch (err) {
      console.error("Error fetching potholes:", err);
      setError("Failed to load pothole reports. Make sure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isSubscribed = true;

    const fetchInitialData = async () => {
      try {
        setError("");
        const filters = {};
        if (reportStatusFilter) filters.reportStatus = reportStatusFilter;
        if (severityFilter) filters.severity = severityFilter;

        const data = await getAllPotholes(filters);
        if (isSubscribed) {
          setPotholes(data || []);
        }
      } catch (err) {
        console.error("Error fetching potholes:", err);
        if (isSubscribed) {
          setError("Failed to load pothole reports. Make sure the backend server is running.");
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    fetchInitialData();

    return () => {
      isSubscribed = false;
    };
  }, [reportStatusFilter, severityFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this pothole report?")) {
      return;
    }

    try {
      await deletePothole(id);
      setPotholes((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Error deleting pothole:", err);
      alert(err.response?.data?.message || "Failed to delete pothole report.");
    }
  };

  // Compute metrics
  const totalCount = potholes.length;
  const reportedCount = potholes.filter((p) => p.reportStatus === "Reported").length;
  const inProgressCount = potholes.filter((p) => p.reportStatus === "In Progress" || p.reportStatus === "Acknowledged").length;
  const resolvedCount = potholes.filter((p) => p.reportStatus === "Resolved").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Pothole Detection Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor, inspect, and update real-time road hazard reports
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Total Reports</span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalCount}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-amber-200 bg-amber-50/30 shadow-2xs">
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block mb-1">New / Reported</span>
          <span className="text-2xl sm:text-3xl font-black text-amber-600">{reportedCount}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-purple-200 bg-purple-50/30 shadow-2xs">
          <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider block mb-1">In Progress</span>
          <span className="text-2xl sm:text-3xl font-black text-purple-600">{inProgressCount}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-2xs">
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block mb-1">Resolved</span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-600">{resolvedCount}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 uppercase">Filters:</span>

          <select
            value={reportStatusFilter}
            onChange={(e) => setReportStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All Statuses</option>
            <option value="Reported">Reported</option>
            <option value="Acknowledged">Acknowledged</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All Severities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          {(reportStatusFilter || severityFilter) && (
            <button
              onClick={() => {
                setReportStatusFilter("");
                setSeverityFilter("");
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1"
            >
              Reset Filters
            </button>
          )}
        </div>

        <button
          onClick={loadPotholes}
          className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Main Grid View */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm font-medium text-slate-500">Loading pothole reports...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-center">
          <p className="text-rose-700 font-semibold mb-2">{error}</p>
          <button
            onClick={loadPotholes}
            className="text-xs bg-rose-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : potholes.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-xl border border-slate-200 p-8">
          <p className="text-4xl mb-3">🕳️</p>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No Potholes Found</h3>
          <p className="text-sm text-slate-500 mb-4">
            {reportStatusFilter || severityFilter
              ? "No reports match the selected filters."
              : "No pothole reports have been submitted yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {potholes.map((pothole) => (
            <PotholeCard key={pothole._id} pothole={pothole} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;

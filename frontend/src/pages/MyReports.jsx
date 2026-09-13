import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyReports } from "../services/potholeService";
import PotholeCard from "../components/PotholeCard";

const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reportStatusFilter, setReportStatusFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");

  const refreshReports = async () => {
    try {
      setLoading(true);
      setError("");

      const filters = {};
      if (reportStatusFilter) filters.reportStatus = reportStatusFilter;
      if (severityFilter) filters.severity = severityFilter;

      const data = await getMyReports(filters);
      setReports(data || []);
    } catch (err) {
      console.error("Error fetching user reports:", err);
      setError("Failed to load your reports. Please make sure you are logged in.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isSubscribed = true;

    const fetchMyReports = async () => {
      try {
        setLoading(true);
        setError("");

        const filters = {};
        if (reportStatusFilter) filters.reportStatus = reportStatusFilter;
        if (severityFilter) filters.severity = severityFilter;

        const data = await getMyReports(filters);
        if (isSubscribed) {
          setReports(data || []);
        }
      } catch (err) {
        console.error("Error fetching user reports:", err);
        if (isSubscribed) {
          setError("Failed to load your reports. Please make sure you are logged in.");
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    fetchMyReports();

    return () => {
      isSubscribed = false;
    };
  }, [reportStatusFilter, severityFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Submitted Reports
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            View and monitor all pothole reports submitted by your account
          </p>
        </div>

        <Link
          to="/report"
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-sm transition-colors shadow-sm self-start sm:self-auto"
        >
          + Report Pothole
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 uppercase">Filter My Reports:</span>

          <select
            value={reportStatusFilter}
            onChange={(e) => setReportStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All Statuses</option>
            <option value="Reported">Reported</option>
            <option value="Acknowledged">Acknowledged</option>
            <option value="Assigned">Assigned</option>
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
          onClick={refreshReports}
          className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Grid View */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm font-medium text-slate-500">Loading your reports...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-center">
          <p className="text-rose-700 font-semibold mb-2">{error}</p>
          <button
            onClick={refreshReports}
            className="text-xs bg-rose-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : reports.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8">
          <p className="text-4xl mb-3">🔍</p>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No Matching Reports</h3>
          <p className="text-sm text-slate-500 mb-4">
            {reportStatusFilter || severityFilter
              ? "No submitted reports match your selected filters."
              : "You haven't submitted any pothole reports yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((pothole) => (
            <PotholeCard key={pothole._id} pothole={pothole} isAdmin={false} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReports;

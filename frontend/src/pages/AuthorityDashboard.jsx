import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAuthorityPotholes, updatePotholeStatus } from "../services/potholeService";
import StatusBadge from "../components/StatusBadge";

const AuthorityDashboard = () => {
  const { user } = useAuth();
  const [potholes, setPotholes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchAuthorityTickets = async () => {
    try {
      setLoading(true);
      setError("");
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      const data = await getAuthorityPotholes(filters);
      setPotholes(data || []);
    } catch (err) {
      console.error("Error fetching authority tickets:", err);
      setError(
        err.response?.data?.message || "Failed to load assigned tickets for your authority."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isSubscribed = true;

    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError("");
        const filters = {};
        if (statusFilter) filters.status = statusFilter;
        const data = await getAuthorityPotholes(filters);
        if (isSubscribed) {
          setPotholes(data || []);
        }
      } catch (err) {
        console.error("Error fetching authority tickets:", err);
        if (isSubscribed) {
          setError(
            err.response?.data?.message || "Failed to load assigned tickets for your authority."
          );
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    fetchTickets();

    return () => {
      isSubscribed = false;
    };
  }, [statusFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      const updated = await updatePotholeStatus(id, newStatus);
      setPotholes((prev) =>
        prev.map((item) => (item._id === id ? updated : item))
      );
    } catch (err) {
      console.error("Authority status update error:", err);
      alert(err.response?.data?.message || "Failed to update ticket status.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Metrics computation for logged in authority
  const totalCount = potholes.length;
  const pendingCount = potholes.filter((p) => p.status === "Pending" || p.reportStatus === "Pending").length;
  const assignedCount = potholes.filter((p) => p.status === "Assigned" || p.reportStatus === "Assigned" || p.reportStatus === "Reported" || p.reportStatus === "Acknowledged").length;
  const inProgressCount = potholes.filter((p) => p.status === "In Progress" || p.reportStatus === "In Progress").length;
  const resolvedCount = potholes.filter((p) => p.status === "Resolved" || p.reportStatus === "Resolved").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="mb-8 bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 text-xs font-bold px-3 py-1 rounded-full mb-3 border border-amber-500/30">
            <span>🏛️ Civic Authority Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Authority Ticket Dashboard
          </h1>
          <p className="text-sm font-medium text-slate-300 mt-1 max-w-xl">
            Logged in as: <span className="font-bold text-amber-400">{user?.authorityName || "Civic Authority"}</span> ({user?.email})
          </p>
        </div>

        <button
          onClick={fetchAuthorityTickets}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2.5 rounded-xl border border-slate-700 text-xs transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          🔄 Refresh Tickets
        </button>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Total Assigned
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalCount}</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-amber-200 bg-amber-50/40 shadow-2xs">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">
            Pending
          </span>
          <span className="text-2xl sm:text-3xl font-black text-amber-600">{pendingCount}</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-blue-200 bg-blue-50/40 shadow-2xs">
          <span className="text-xs font-bold text-blue-800 uppercase tracking-wider block mb-1">
            Assigned
          </span>
          <span className="text-2xl sm:text-3xl font-black text-blue-600">{assignedCount}</span>
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

      {/* Filter Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Assigned Road Hazard Tickets</h2>
          <p className="text-xs text-slate-500">Pothole reports automatically assigned to {user?.authorityName}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All Tickets</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm font-medium text-slate-500">Loading authority ticket dashboard...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-center">
          <p className="text-rose-700 font-semibold mb-2">{error}</p>
          <button
            onClick={fetchAuthorityTickets}
            className="text-xs bg-rose-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : potholes.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 shadow-2xs">
          <p className="text-5xl mb-3">🎫</p>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No Assigned Tickets</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            There are currently no pothole reports assigned to {user?.authorityName || "this authority"}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {potholes.map((pothole) => {
            const ticketId = `PH-${pothole._id.slice(-6).toUpperCase()}`;
            const currentStatus = pothole.status || pothole.reportStatus || "Assigned";
            const formattedDate = pothole.createdAt
              ? new Date(pothole.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Unknown Date";

            return (
              <div
                key={pothole._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Ticket Header & Media */}
                  <div className="relative h-44 bg-slate-900 overflow-hidden">
                    {pothole.media?.type === "video" ? (
                      <video src={pothole.media?.url} className="w-full h-full object-cover" controls={false} />
                    ) : pothole.media?.url ? (
                      <img src={pothole.media.url} alt="Pothole hazard" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        No Media Preview
                      </div>
                    )}

                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 pointer-events-none">
                      <span className="bg-slate-950/80 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-xs">
                        #{ticketId}
                      </span>
                      <StatusBadge value={currentStatus} type="status" />
                    </div>
                  </div>

                  {/* Ticket Body Details */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-1" title={pothole.location?.address}>
                        {pothole.location?.address || "Unnamed Location"}
                      </h3>
                      <p className="text-xs font-mono text-slate-500">
                        📍 {pothole.location?.latitude?.toFixed(4)}, {pothole.location?.longitude?.toFixed(4)}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Severity</span>
                        <StatusBadge value={pothole.detection?.severity} type="severity" />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">AI Confidence</span>
                        <span className="font-bold text-slate-800">
                          {pothole.detection?.confidence != null
                            ? `${Math.round(pothole.detection.confidence * 100)}%`
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Reported On</span>
                        <span className="text-slate-700 font-medium">{formattedDate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ticket Action Footer */}
                <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    to={`/authority/reports/${pothole._id}`}
                    className="text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-2 rounded-lg transition-colors"
                  >
                    View Details
                  </Link>

                  {/* Status Action Buttons */}
                  {currentStatus === "Assigned" || currentStatus === "Reported" || currentStatus === "Acknowledged" ? (
                    <button
                      onClick={() => handleStatusChange(pothole._id, "In Progress")}
                      disabled={updatingId === pothole._id}
                      className="text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-2 rounded-lg transition-colors shadow-2xs disabled:opacity-50"
                    >
                      {updatingId === pothole._id ? "Updating..." : "Mark In Progress →"}
                    </button>
                  ) : currentStatus === "In Progress" ? (
                    <button
                      onClick={() => handleStatusChange(pothole._id, "Resolved")}
                      disabled={updatingId === pothole._id}
                      className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-lg transition-colors shadow-2xs disabled:opacity-50"
                    >
                      {updatingId === pothole._id ? "Updating..." : "Mark Resolved ✓"}
                    </button>
                  ) : currentStatus === "Resolved" ? (
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                      ✓ Resolved
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AuthorityDashboard;

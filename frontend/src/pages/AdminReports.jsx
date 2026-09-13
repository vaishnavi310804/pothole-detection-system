import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllPotholes, updatePotholeStatus, deletePothole, reassignAuthority } from "../services/potholeService";
import StatusBadge from "../components/StatusBadge";

const SUPPORTED_AUTHORITY_NAMES = [
  "Municipal Corporation Chandigarh",
  "Municipal Corporation of Delhi",
  "Bruhat Bengaluru Mahanagara Palike",
  "Brihanmumbai Municipal Corporation",
  "Municipal Corporation Mohali",
];

const AdminReports = () => {
  const [potholes, setPotholes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const [reportStatusFilter, setReportStatusFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [authorityFilter, setAuthorityFilter] = useState("");

  const refreshAllPotholes = async () => {
    try {
      setLoading(true);
      setError("");

      const filters = {};
      if (reportStatusFilter) filters.reportStatus = reportStatusFilter;
      if (severityFilter) filters.severity = severityFilter;

      const data = await getAllPotholes(filters);
      setPotholes(data || []);
    } catch (err) {
      console.error("Error fetching all reports for admin:", err);
      setError("Failed to load reports. Make sure you are logged in as an administrator.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isSubscribed = true;

    const fetchAdminReports = async () => {
      try {
        setLoading(true);
        setError("");

        const filters = {};
        if (reportStatusFilter) filters.reportStatus = reportStatusFilter;
        if (severityFilter) filters.severity = severityFilter;

        const data = await getAllPotholes(filters);
        if (isSubscribed) {
          setPotholes(data || []);
        }
      } catch (err) {
        console.error("Error fetching all reports for admin:", err);
        if (isSubscribed) {
          setError("Failed to load reports. Make sure you are logged in as an administrator.");
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    fetchAdminReports();

    return () => {
      isSubscribed = false;
    };
  }, [reportStatusFilter, severityFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      const updated = await updatePotholeStatus(id, newStatus);
      setPotholes((prev) =>
        prev.map((item) => (item._id === id ? updated : item))
      );
    } catch (err) {
      console.error("Status update error:", err);
      alert(err.response?.data?.message || "Failed to update report status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReassign = async (id, newAuthName) => {
    if (!newAuthName) return;
    try {
      setUpdatingId(id);
      const updated = await reassignAuthority(id, newAuthName);
      setPotholes((prev) =>
        prev.map((item) => (item._id === id ? updated : item))
      );
    } catch (err) {
      console.error("Reassign authority error:", err);
      alert(err.response?.data?.message || "Failed to reassign authority.");
    } finally {
      setUpdatingId(null);
    }
  };

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

  // Client-side filtering by authority
  const filteredPotholes = potholes.filter((p) => {
    if (!authorityFilter) return true;
    if (authorityFilter === "Verification Required") {
      return (
        !p.authority?.name ||
        p.authority?.name === "Authority requires verification" ||
        p.authority?.status === "Pending"
      );
    }
    return p.authority?.name === authorityFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded mb-2">
            🛡️ Admin Management & Ticket Control
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            All Pothole Reports & Authority Tickets
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review all reported hazards, monitor assigned civic authorities, and reassign tickets when needed.
          </p>
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

          <select
            value={authorityFilter}
            onChange={(e) => setAuthorityFilter(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-300 rounded-lg bg-amber-50/50 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All Authorities</option>
            {SUPPORTED_AUTHORITY_NAMES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
            <option value="Verification Required">⚠️ Verification Required</option>
          </select>

          {(reportStatusFilter || severityFilter || authorityFilter) && (
            <button
              onClick={() => {
                setReportStatusFilter("");
                setSeverityFilter("");
                setAuthorityFilter("");
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1"
            >
              Reset Filters
            </button>
          )}
        </div>

        <button
          onClick={refreshAllPotholes}
          className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Reports Table / Card List */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm font-medium text-slate-500">Loading all reports...</p>
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
      ) : filteredPotholes.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 shadow-2xs">
          <p className="text-4xl mb-3">📋</p>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No Reports Found</h3>
          <p className="text-sm text-slate-500">No pothole reports match your selected criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[11px] font-bold tracking-wider">
                  <th className="py-3.5 px-4">Media</th>
                  <th className="py-3.5 px-4">Location & Address</th>
                  <th className="py-3.5 px-4">Assigned Authority</th>
                  <th className="py-3.5 px-4">Severity & Confidence</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPotholes.map((pothole) => {
                  const currentStatus = pothole.status || pothole.reportStatus || "Reported";
                  const authName = pothole.authority?.name;
                  const isUnverified =
                    !authName ||
                    authName === "Authority requires verification" ||
                    pothole.authority?.status === "Pending";

                  return (
                    <tr key={pothole._id} className="hover:bg-slate-50 transition-colors">
                      {/* Media Thumbnail */}
                      <td className="py-3 px-4">
                        <div className="w-16 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center">
                          {pothole.media?.type === "video" ? (
                            <video src={pothole.media?.url} className="w-full h-full object-cover" controls={false} />
                          ) : pothole.media?.url ? (
                            <img src={pothole.media.url} alt="Pothole" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] text-slate-400">No media</span>
                          )}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-bold text-slate-900 line-clamp-1" title={pothole.location?.address}>
                          {pothole.location?.address || "Unnamed Location"}
                        </p>
                        <p className="font-mono text-[11px] text-slate-500 mt-0.5">
                          📍 {pothole.location?.latitude?.toFixed(4)}, {pothole.location?.longitude?.toFixed(4)}
                        </p>
                      </td>

                      {/* Authority & Manual Reassign */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="space-y-1">
                          {isUnverified ? (
                            <span className="inline-block text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                              ⚠️ Verification Required
                            </span>
                          ) : (
                            <p className="font-bold text-slate-800 line-clamp-1" title={authName}>
                              🏛️ {authName}
                            </p>
                          )}

                          {currentStatus === "In Progress" || currentStatus === "Resolved" ? (
                            <span className="text-[10px] text-slate-400 italic block">Locked (In Repair)</span>
                          ) : (
                            <select
                              disabled={updatingId === pothole._id}
                              onChange={(e) => handleReassign(pothole._id, e.target.value)}
                              value=""
                              className="text-[11px] px-2 py-1 rounded border border-slate-300 bg-white font-medium text-slate-700 w-full focus:ring-1 focus:ring-amber-500"
                            >
                              <option value="" disabled>
                                Reassign Authority...
                              </option>
                              {SUPPORTED_AUTHORITY_NAMES.map((name) => (
                                <option key={name} value={name}>
                                  {name}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </td>

                      {/* Detection */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          {pothole.detection?.needsManualReview ? (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                              ⚠️ Manual Review
                            </span>
                          ) : (
                            <StatusBadge value={pothole.detection?.severity} type="severity" />
                          )}
                          <span className="text-[11px] text-slate-600 font-medium">
                            Confidence: {pothole.detection?.confidence != null ? `${Math.round(pothole.detection.confidence * 100)}%` : "N/A"}
                          </span>
                        </div>
                      </td>

                      {/* Status Select */}
                      <td className="py-3 px-4">
                        {currentStatus === "In Progress" || currentStatus === "Resolved" ? (
                          <div className="flex flex-col items-start gap-1">
                            <StatusBadge value={currentStatus} type="status" />
                            <span className="text-[10px] text-slate-400 font-medium">Authority Managed</span>
                          </div>
                        ) : (
                          <select
                            value={currentStatus}
                            disabled={updatingId === pothole._id}
                            onChange={(e) => handleStatusChange(pothole._id, e.target.value)}
                            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-amber-500"
                          >
                            <option value="Reported">Reported</option>
                            <option value="Acknowledged">Acknowledged</option>
                            <option value="Assigned">Assigned</option>
                          </select>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/admin/reports/${pothole._id}`}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-2.5 py-1.5 rounded text-[11px] transition-colors"
                          >
                            Details
                          </Link>
                          <button
                            onClick={() => handleDelete(pothole._id)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold px-2 py-1.5 rounded text-[11px] transition-colors"
                            title="Delete Report"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;

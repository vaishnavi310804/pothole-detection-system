import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getPotholeById, updatePotholeStatus, deletePothole } from "../services/potholeService";
import StatusBadge from "../components/StatusBadge";

const AdminPotholeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pothole, setPothole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [mediaError, setMediaError] = useState(false);

  useEffect(() => {
    let isSubscribed = true;

    const fetchDetail = async () => {
      try {
        setError("");
        const data = await getPotholeById(id);
        if (isSubscribed) {
          setPothole(data);
        }
      } catch (err) {
        console.error("Error fetching admin pothole detail:", err);
        if (isSubscribed) {
          setError(err.response?.data?.message || "Failed to load report details.");
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    fetchDetail();

    return () => {
      isSubscribed = false;
    };
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      setStatusMessage("");
      const updated = await updatePotholeStatus(id, newStatus);
      setPothole(updated);
      setStatusMessage(`Report status updated to "${newStatus}"`);
    } catch (err) {
      console.error("Admin status update error:", err);
      alert(err.response?.data?.message || "Failed to update report status.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this pothole report permanently?")) {
      return;
    }

    try {
      await deletePothole(id);
      navigate("/admin/reports");
    } catch (err) {
      console.error("Admin delete error:", err);
      alert(err.response?.data?.message || "Failed to delete pothole report.");
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center max-w-7xl mx-auto px-4">
        <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-medium text-slate-500">Loading admin report details...</p>
      </div>
    );
  }

  if (error || !pothole) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-rose-50 border border-rose-200 p-8 rounded-2xl shadow-sm">
          <p className="text-rose-700 font-semibold mb-4">{error || "Pothole report not found."}</p>
          <Link
            to="/admin/reports"
            className="inline-block bg-slate-900 text-white font-bold px-5 py-2.5 rounded-lg text-sm hover:bg-slate-800 transition-colors shadow-sm"
          >
            ← Back to All Reports
          </Link>
        </div>
      </div>
    );
  }

  const { media, location, detection, authority, reportStatus, createdAt, reportedBy } = pothole;
  const mapUrl = `https://www.google.com/maps?q=${location?.latitude},${location?.longitude}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Back Link & Admin Actions */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/admin/reports"
          className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1"
        >
          ← Back to All Reports
        </Link>
        <button
          onClick={handleDelete}
          className="text-xs bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold px-4 py-2 rounded-lg border border-rose-200 transition-colors shadow-2xs"
        >
          🗑️ Delete Report
        </button>
      </div>

      {statusMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <span>✅</span>
          <span>{statusMessage}</span>
        </div>
      )}

      {detection?.needsManualReview && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <div>
              <p className="font-bold">Manual Review Required</p>
              <p className="text-amber-700">AI could not automatically verify a pothole in this media upload.</p>
            </div>
          </div>
        </div>
      )}


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Media Viewer & Location */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-2">
            <div className="relative rounded-xl overflow-hidden bg-slate-950 min-h-[320px] flex items-center justify-center">
              {mediaError || !media?.url ? (
                <div className="p-12 text-center text-slate-400">
                  <span className="text-4xl block mb-2">🖼️</span>
                  <span className="text-sm font-medium">Media failed to load from S3</span>
                </div>
              ) : media?.type === "video" ? (
                <video
                  src={media.url}
                  controls
                  onError={() => setMediaError(true)}
                  className="w-full max-h-[500px] object-contain"
                />
              ) : (
                <img
                  src={media.url}
                  alt="Pothole full view"
                  onError={() => setMediaError(true)}
                  className="w-full max-h-[500px] object-contain"
                />
              )}
            </div>
          </div>

          {/* Location Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              📍 Location Details
            </h2>
            <p className="text-lg font-semibold text-slate-800 mb-3">
              {location?.address || "Address Not Specified"}
            </p>
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100 mb-4">
              <div>
                <span className="text-slate-500 block mb-0.5">Latitude</span>
                <span className="font-mono font-bold text-slate-800">{location?.latitude}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Longitude</span>
                <span className="font-mono font-bold text-slate-800">{location?.longitude}</span>
              </div>
            </div>
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 font-bold"
            >
              Open Location in Google Maps ↗
            </a>
          </div>
        </div>

        {/* Right 1 Col: Admin Controls & Reporter Info */}
        <div className="space-y-6">
          {/* Status Update Control */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span>🛡️</span> Admin Controls
            </h2>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-500 mb-2">Current Status</label>
              <StatusBadge value={reportStatus} type="status" />
            </div>

            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Change Report Status To</label>
            <select
              value={reportStatus}
              disabled={updating}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
            >
              <option value="Reported">Reported</option>
              <option value="Acknowledged">Acknowledged</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Reporter Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Reporter Information
            </h2>
            <div className="text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Name</span>
                <span className="font-bold text-slate-800">{reportedBy?.name || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email</span>
                <span className="font-medium text-slate-800">{reportedBy?.email || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">User Role</span>
                <span className="font-semibold text-slate-700 capitalize">{reportedBy?.role || "user"}</span>
              </div>
            </div>
          </div>

          {/* Detection & Metadata Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Detection Metrics
            </h2>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Severity Level</span>
              <StatusBadge value={detection?.severity} type="severity" />
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">AI Confidence</span>
              <span className="font-bold text-slate-800">
                {detection?.confidence != null ? `${Math.round(detection.confidence * 100)}%` : "N/A"}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Media Type</span>
              <span className="font-semibold text-slate-700 capitalize">{media?.type || "N/A"}</span>
            </div>

            <div className="flex justify-between items-center text-xs pt-3 border-t border-slate-100">
              <span className="text-slate-500">Submitted On</span>
              <span className="text-slate-700">
                {createdAt ? new Date(createdAt).toLocaleString() : "N/A"}
              </span>
            </div>
          </div>

          {/* Assigned Authority */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>🏛️ Assigned Authority</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  authority?.status === "Assigned"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {authority?.status || "Pending"}
              </span>
            </h2>

            {(authority?.needsManualReview ||
              authority?.status === "Pending" ||
              !authority?.name ||
              authority?.name === "Authority requires verification") && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-1.5 font-medium">
                <span>⚠️</span>
                <span>Authority requires verification</span>
              </div>
            )}

            <div className="text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Name</span>
                <span className="font-bold text-slate-800 text-right">{authority?.name || "Authority requires verification"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Type</span>
                <span className="font-medium text-slate-800">{authority?.type || "Unknown"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jurisdiction</span>
                <span className="font-medium text-slate-800">{authority?.jurisdiction || "Unspecified"}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2">
                <span className="text-slate-500">Source</span>
                <span className="font-medium text-slate-700">{authority?.source || "System Default"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Confidence</span>
                <span className="font-bold text-slate-800">{authority?.confidence || "None"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPotholeDetails;

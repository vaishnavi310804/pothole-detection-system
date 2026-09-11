import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getPotholeById, updatePotholeStatus, deletePothole } from "../services/potholeService";
import StatusBadge from "../components/StatusBadge";

const PotholeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pothole, setPothole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

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
        console.error("Error fetching pothole details:", err);
        if (isSubscribed) {
          setError(err.response?.data?.message || "Failed to load pothole details.");
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
      setStatusMessage(`Status updated to "${newStatus}"`);
    } catch (err) {
      console.error("Error updating status:", err);
      alert(err.response?.data?.message || "Failed to update status.");
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
      navigate("/");
    } catch (err) {
      console.error("Error deleting pothole:", err);
      alert(err.response?.data?.message || "Failed to delete pothole report.");
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center max-w-7xl mx-auto px-4">
        <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-medium text-slate-500">Loading pothole details...</p>
      </div>
    );
  }

  if (error || !pothole) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-rose-50 border border-rose-200 p-8 rounded-xl">
          <p className="text-rose-700 font-semibold mb-4">{error || "Pothole report not found."}</p>
          <Link
            to="/"
            className="inline-block bg-slate-900 text-white font-bold px-4 py-2 rounded-lg text-sm hover:bg-slate-800 transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { media, location, detection, authority, reportStatus, createdAt } = pothole;
  const mapUrl = `https://www.google.com/maps?q=${location?.latitude},${location?.longitude}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Back Link & Header Actions */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1"
        >
          ← Back to Dashboard
        </Link>
        <button
          onClick={handleDelete}
          className="text-xs bg-rose-50 text-rose-600 hover:bg-rose-100 font-semibold px-3 py-1.5 rounded-md border border-rose-200 transition-colors"
        >
          Delete Report
        </button>
      </div>

      {statusMessage && (
        <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium rounded-lg">
          ✅ {statusMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Media Viewer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-2">
            <div className="relative rounded-lg overflow-hidden bg-slate-900 min-h-[300px] flex items-center justify-center">
              {media?.type === "video" ? (
                <video src={media?.url} controls className="w-full max-h-[500px] object-contain" />
              ) : media?.url ? (
                <img src={media.url} alt="Pothole full view" className="w-full max-h-[500px] object-contain" />
              ) : (
                <div className="p-12 text-slate-400 font-medium">No Media Available</div>
              )}
            </div>
          </div>

          {/* Location Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              📍 Location Details
            </h2>
            <p className="text-lg font-semibold text-slate-800 mb-2">
              {location?.address || "Address Not Specified"}
            </p>
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
              <div>
                <span className="text-slate-500 block">Latitude</span>
                <span className="font-mono font-bold text-slate-800">{location?.latitude}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Longitude</span>
                <span className="font-mono font-bold text-slate-800">{location?.longitude}</span>
              </div>
            </div>
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 font-bold"
            >
              Open in Google Maps ↗
            </a>
          </div>
        </div>

        {/* Right 1 Col: Status & Metadata Controls */}
        <div className="space-y-6">
          {/* Status Update Control */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-sm font-bold text-slate-900 mb-4">Update Report Status</h2>
            
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-500 mb-2">Current Status</label>
              <StatusBadge value={reportStatus} type="status" />
            </div>

            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Change Status To</label>
            <select
              value={reportStatus}
              disabled={updating}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
            >
              <option value="Reported">Reported</option>
              <option value="Acknowledged">Acknowledged</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Detection Info */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Detection Summary</h2>
            
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

            <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100">
              <span className="text-slate-500">Reported On</span>
              <span className="text-slate-700">
                {createdAt ? new Date(createdAt).toLocaleString() : "N/A"}
              </span>
            </div>
          </div>

          {/* Authority Info if present */}
          {authority && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-3">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Assigned Authority</h2>
              <div className="text-xs space-y-1">
                <p><span className="text-slate-500">Name:</span> <span className="font-medium text-slate-800">{authority.name || "Unassigned"}</span></p>
                <p><span className="text-slate-500">Type:</span> <span className="font-medium text-slate-800">{authority.type || "N/A"}</span></p>
                <p><span className="text-slate-500">Status:</span> <span className="font-medium text-slate-800">{authority.status || "Pending"}</span></p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PotholeDetails;

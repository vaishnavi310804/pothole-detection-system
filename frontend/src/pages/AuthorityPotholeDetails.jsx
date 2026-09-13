import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getAuthorityPotholeById, updatePotholeStatus } from "../services/potholeService";
import StatusBadge from "../components/StatusBadge";

const AuthorityPotholeDetails = () => {
  const { id } = useParams();
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
        const data = await getAuthorityPotholeById(id);
        if (isSubscribed) {
          setPothole(data);
        }
      } catch (err) {
        console.error("Error fetching authority ticket details:", err);
        if (isSubscribed) {
          setError(
            err.response?.data?.message ||
              "Failed to load ticket details or access denied to this authority ticket."
          );
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
      setStatusMessage(`Ticket status updated to "${newStatus}"`);
    } catch (err) {
      console.error("Authority status update error:", err);
      alert(err.response?.data?.message || "Failed to update ticket status.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center max-w-7xl mx-auto px-4">
        <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-medium text-slate-500">Loading ticket details...</p>
      </div>
    );
  }

  if (error || !pothole) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-rose-50 border border-rose-200 p-8 rounded-2xl shadow-sm">
          <p className="text-4xl mb-3">🔒</p>
          <h3 className="text-lg font-bold text-rose-800 mb-1">Access Restricted</h3>
          <p className="text-rose-700 text-sm mb-6">
            {error || "Pothole report not found or you are not authorized to view this ticket."}
          </p>
          <Link
            to="/authority/dashboard"
            className="inline-block bg-slate-900 text-white font-bold px-5 py-2.5 rounded-lg text-sm hover:bg-slate-800 transition-colors shadow-sm"
          >
            ← Back to Ticket Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { media, location, detection, authority, createdAt, reportedBy } = pothole;
  const currentStatus = pothole.status || pothole.reportStatus || "Assigned";
  const ticketId = `PH-${pothole._id.slice(-6).toUpperCase()}`;
  const mapUrl = `https://www.google.com/maps?q=${location?.latitude},${location?.longitude}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Back Link */}
      <div className="mb-6">
        <Link
          to="/authority/dashboard"
          className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1 w-fit"
        >
          ← Back to Ticket Dashboard
        </Link>
      </div>

      {statusMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <span>✅</span>
          <span>{statusMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Media Viewer & Location */}
        <div className="lg:col-span-2 space-y-6">
          {/* Media Viewer */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-2">
            <div className="relative rounded-xl overflow-hidden bg-slate-950 min-h-[320px] flex items-center justify-center">
              {mediaError || !media?.url ? (
                <div className="p-12 text-center text-slate-400">
                  <span className="text-4xl block mb-2">🖼️</span>
                  <span className="text-sm font-medium">Media unavailable or failed to load</span>
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
                  alt="Pothole hazard detail view"
                  onError={() => setMediaError(true)}
                  className="w-full max-h-[500px] object-contain"
                />
              )}
            </div>
          </div>

          {/* Location Card */}
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

        {/* Right 1 Col: Ticket Actions & Metadata */}
        <div className="space-y-6">
          {/* Ticket Status & Control Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-slate-400 block uppercase">Ticket ID</span>
                <span className="font-mono font-extrabold text-slate-900 text-lg">#{ticketId}</span>
              </div>
              <StatusBadge value={currentStatus} type="status" />
            </div>

            {/* Action Buttons */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Update Ticket Progress</label>
              {currentStatus === "Assigned" || currentStatus === "Reported" || currentStatus === "Acknowledged" ? (
                <button
                  onClick={() => handleStatusChange("In Progress")}
                  disabled={updating}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors shadow-xs disabled:opacity-50"
                >
                  {updating ? "Updating Status..." : "Mark as In Progress →"}
                </button>
              ) : currentStatus === "In Progress" ? (
                <button
                  onClick={() => handleStatusChange("Resolved")}
                  disabled={updating}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors shadow-xs disabled:opacity-50"
                >
                  {updating ? "Updating Status..." : "Mark as Resolved ✓"}
                </button>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold text-center">
                  ✓ Ticket Marked as Resolved
                </div>
              )}
            </div>
          </div>

          {/* AI Detection Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>🤖 AI Detection Result</span>
              <span className="text-xs font-semibold text-slate-500 capitalize">{media?.type || "image"}</span>
            </h2>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Overall Severity</span>
              <StatusBadge value={detection?.severity} type="severity" />
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">
                {media?.type === "video" ? "Max Confidence" : "Confidence"}
              </span>
              <span className="font-bold text-slate-800">
                {detection?.confidence != null ? `${Math.round(detection.confidence * 100)}%` : "N/A"}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">
                {media?.type === "video" ? "Max Potholes Found" : "Potholes Detected"}
              </span>
              <span className="font-bold text-slate-800">{detection?.count || 0}</span>
            </div>

            {/* Video Metadata & Detection Timeline */}
            {media?.type === "video" && (
              <div className="pt-3 border-t border-slate-100 space-y-3">
                {detection?.videoMetadata && (
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-600">
                    <div className="flex justify-between">
                      <span>Video Duration:</span>
                      <span className="font-bold text-slate-800">{detection.videoMetadata.duration}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Frame Rate:</span>
                      <span className="font-bold text-slate-800">{detection.videoMetadata.fps} FPS</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Frames:</span>
                      <span className="font-bold text-slate-800">{detection.videoMetadata.totalFrames}</span>
                    </div>
                  </div>
                )}

                {detection?.videoDetections && detection.videoDetections.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Detection Timeline ({detection.videoDetections.length} events)
                    </h3>
                    <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                      {detection.videoDetections.map((evt, idx) => {
                        const mins = Math.floor((evt.timestamp || 0) / 60);
                        const secs = Math.floor((evt.timestamp || 0) % 60);
                        const tsStr = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
                        return (
                          <div key={idx} className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs flex justify-between items-center">
                            <span className="font-mono font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              ⏱ {tsStr}
                            </span>
                            <span className="font-semibold text-slate-700">
                              {evt.severity || "Low"} Severity ({evt.count} hazard)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between items-center text-xs pt-3 border-t border-slate-100">
              <span className="text-slate-500">Submitted Date</span>
              <span className="text-slate-700 font-medium">
                {createdAt ? new Date(createdAt).toLocaleString() : "N/A"}
              </span>
            </div>
          </div>


          {/* Authority Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Assigned Authority Details
            </h2>
            <div className="text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Authority Name</span>
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
              <div className="flex justify-between">
                <span className="text-slate-500">Assignment Source</span>
                <span className="font-medium text-slate-700">{authority?.source || "System Fallback"}</span>
              </div>
            </div>
          </div>

          {/* Reporter Details */}
          {reportedBy && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-2">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Reporter Information
              </h2>
              <div className="text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Name</span>
                  <span className="font-bold text-slate-800">{reportedBy.name || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email</span>
                  <span className="font-medium text-slate-800">{reportedBy.email || "N/A"}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthorityPotholeDetails;

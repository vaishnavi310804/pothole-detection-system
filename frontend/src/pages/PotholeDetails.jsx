import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getPotholeById } from "../services/potholeService";
import StatusBadge from "../components/StatusBadge";

const PotholeDetails = () => {
  const { id } = useParams();

  const [pothole, setPothole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
        console.error("Error fetching pothole details:", err);
        if (isSubscribed) {
          setError(err.response?.data?.message || "Failed to load pothole details or access denied.");
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

  if (loading) {
    return (
      <div className="py-24 text-center max-w-7xl mx-auto px-4">
        <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-medium text-slate-500">Loading report details...</p>
      </div>
    );
  }

  if (error || !pothole) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-rose-50 border border-rose-200 p-8 rounded-2xl shadow-sm">
          <p className="text-4xl mb-3">🔒</p>
          <h3 className="text-lg font-bold text-rose-800 mb-1">Access Restricted</h3>
          <p className="text-rose-700 text-sm mb-6">{error || "Pothole report not found or access forbidden."}</p>
          <Link
            to="/my-reports"
            className="inline-block bg-slate-900 text-white font-bold px-5 py-2.5 rounded-lg text-sm hover:bg-slate-800 transition-colors shadow-sm"
          >
            ← Back to My Reports
          </Link>
        </div>
      </div>
    );
  }

  const { media, location, detection, authority, reportStatus, createdAt, reportedBy } = pothole;
  const mapUrl = `https://www.google.com/maps?q=${location?.latitude},${location?.longitude}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Back Link */}
      <div className="mb-6">
        <Link
          to="/my-reports"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1 w-fit"
        >
          ← Back to My Reports
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Media Viewer & Location */}
        <div className="lg:col-span-2 space-y-6">
          {/* Media Player / Viewer */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-2">
            <div className="relative rounded-xl overflow-hidden bg-slate-950 min-h-[320px] flex items-center justify-center">
              {mediaError || !media?.url ? (
                <div className="p-12 text-center text-slate-400">
                  <span className="text-4xl block mb-2">🖼️</span>
                  <span className="text-sm font-medium">Media unavailable or failed to load from S3</span>
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
                  alt="Pothole hazard view"
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

        {/* Right 1 Col: Status & Metadata */}
        <div className="space-y-6">
          {/* Current Status Banner */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Report Status
            </h2>
            <div className="mb-3">
              <StatusBadge value={reportStatus} type="status" />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Status updates are processed by municipal administrators as repairs progress.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>AI Detection Analysis ({media?.type || detection?.mediaType || "image"})</span>
              {detection?.detected && (
                <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                  ✓ Verified
                </span>
              )}
            </h2>

            {detection?.needsManualReview || !detection?.detected ? (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1">⚠️ Manual Review Required</p>
                <p className="text-[11px] text-amber-700">No pothole was confidently detected by the AI in this media upload.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Overall Severity</span>
                  <StatusBadge value={detection?.severity} type="severity" />
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">
                    {media?.type === "video" ? "Max Confidence" : "AI Confidence"}
                  </span>
                  <span className="font-bold text-slate-800">
                    {detection?.confidence != null ? `${Math.round(detection.confidence * 100)}%` : "N/A"}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">
                    {media?.type === "video" ? "Max Potholes Found" : "Potholes Detected"}
                  </span>
                  <span className="font-bold text-slate-800">
                    {detection?.count || 1}
                  </span>
                </div>
              </>
            )}

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
              <span className="text-slate-500 font-medium">Media Type</span>
              <span className="font-semibold text-slate-700 capitalize">{media?.type || "N/A"}</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Submitted On</span>
              <span className="text-slate-700 font-medium">
                {createdAt ? new Date(createdAt).toLocaleString() : "N/A"}
              </span>
            </div>

            {reportedBy && (
              <div className="flex justify-between items-center text-xs pt-2">
                <span className="text-slate-500 font-medium">Reported By</span>
                <span className="text-slate-700 font-semibold">{reportedBy.name || reportedBy.email}</span>
              </div>
            )}
          </div>



          {/* Authority Assignment */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>🏛️ Responsible Civic Authority</span>
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
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                <span className="text-sm">⚠️</span>
                <div>
                  <p className="font-bold">Authority requires verification</p>
                  <p className="text-[11px] text-amber-700">
                    Location could not be automatically assigned to a verified municipal region. Manual review required.
                  </p>
                </div>
              </div>
            )}

            <div className="text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Authority Name</span>
                <span className="font-semibold text-slate-800 text-right">
                  {authority?.name || "Authority requires verification"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Authority Type</span>
                <span className="font-medium text-slate-800">{authority?.type || "Unknown"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jurisdiction</span>
                <span className="font-medium text-slate-800">{authority?.jurisdiction || "Unspecified"}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2">
                <span className="text-slate-500">Identification Source</span>
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

export default PotholeDetails;

import { useState } from "react";
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";

const PotholeCard = ({ pothole, onDelete, isAdmin = false, detailPath }) => {
  const { _id, media, location, detection, authority, reportStatus, createdAt, reportedBy } = pothole;
  const [mediaError, setMediaError] = useState(false);

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Unknown Date";

  const targetDetailLink = detailPath || (isAdmin ? `/admin/reports/${_id}` : `/potholes/${_id}`);

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md border border-slate-200 overflow-hidden transition-all flex flex-col h-full">
      {/* Media Preview Container */}
      <div className="relative h-48 bg-slate-900 overflow-hidden">
        {mediaError || !media?.url ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-800 p-4 text-center">
            <span className="text-3xl mb-1">🖼️</span>
            <span className="text-xs font-medium">Media unavailable / load error</span>
          </div>
        ) : media?.type === "video" ? (
          <video
            src={media.url}
            className="w-full h-full object-cover"
            controls
            onError={() => setMediaError(true)}
          />
        ) : (
          <img
            src={media.url}
            alt="Pothole hazard preview"
            onError={() => setMediaError(true)}
            className="w-full h-full object-cover"
          />
        )}

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 pointer-events-none">
          <StatusBadge value={reportStatus} type="status" />
          {detection?.needsManualReview ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-slate-950 border border-amber-400">
              ⚠️ Manual Review
            </span>
          ) : (
            <StatusBadge value={detection?.severity} type="severity" />
          )}
        </div>

      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Location & Address */}
          <h3 className="font-semibold text-slate-900 line-clamp-1 mb-1" title={location?.address}>
            {location?.address || "Unnamed Location"}
          </h3>
          <p className="text-xs font-mono text-slate-500 mb-3">
            📍 {location?.latitude?.toFixed(4)}, {location?.longitude?.toFixed(4)}
          </p>

          {/* Detection & Reporter Info */}
          <div className="bg-slate-50 rounded-lg p-2.5 mb-4 text-xs space-y-1.5 border border-slate-100">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">AI Confidence</span>
              <span className="font-bold text-slate-800">
                {detection?.confidence != null
                  ? `${Math.round(detection.confidence * 100)}%`
                  : "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
              <span className="text-slate-500 font-medium">Authority</span>
              <span
                className="font-semibold text-slate-700 truncate max-w-[140px]"
                title={authority?.name || "Authority requires verification"}
              >
                {authority?.name && authority.name !== "Authority requires verification"
                  ? authority.name
                  : "Verification Required"}
              </span>
            </div>
            {reportedBy && (
              <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                <span className="text-slate-500">Reported By</span>
                <span className="font-medium text-slate-700 truncate max-w-[140px]" title={reportedBy.email}>
                  {reportedBy.name || reportedBy.email}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">{formattedDate}</span>
          <div className="flex items-center space-x-2">
            {onDelete && (
              <button
                onClick={() => onDelete(_id)}
                className="text-xs text-rose-600 hover:text-rose-700 px-2 py-1 rounded hover:bg-rose-50 font-semibold transition-colors"
                title="Delete Report"
              >
                Delete
              </button>
            )}
            <Link
              to={targetDetailLink}
              className="text-xs bg-slate-900 text-white hover:bg-slate-800 px-3 py-1.5 rounded-md font-semibold transition-colors shadow-2xs"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PotholeCard;

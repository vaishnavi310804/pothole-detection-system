import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";

const PotholeCard = ({ pothole, onDelete }) => {
  const { _id, media, location, detection, reportStatus, createdAt } = pothole;

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Unknown Date";

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md border border-slate-200 overflow-hidden transition-all flex flex-col h-full">
      {/* Media Preview Container */}
      <div className="relative h-48 bg-slate-100 overflow-hidden">
        {media?.type === "video" ? (
          <video
            src={media?.url}
            className="w-full h-full object-cover"
            controls={false}
            muted
          />
        ) : media?.url ? (
          <img
            src={media.url}
            alt="Pothole preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium">
            No Media Available
          </div>
        )}

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <StatusBadge value={reportStatus} type="status" />
          <StatusBadge value={detection?.severity} type="severity" />
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

          {/* Detection Info */}
          <div className="bg-slate-50 rounded-lg p-2.5 mb-4 text-xs flex justify-between items-center border border-slate-100">
            <span className="text-slate-600">Confidence Score</span>
            <span className="font-bold text-slate-800">
              {detection?.confidence != null
                ? `${Math.round(detection.confidence * 100)}%`
                : "N/A"}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">{formattedDate}</span>
          <div className="flex items-center space-x-2">
            {onDelete && (
              <button
                onClick={() => onDelete(_id)}
                className="text-xs text-rose-600 hover:text-rose-700 px-2 py-1 rounded hover:bg-rose-50 font-medium transition-colors"
                title="Delete Report"
              >
                Delete
              </button>
            )}
            <Link
              to={`/potholes/${_id}`}
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

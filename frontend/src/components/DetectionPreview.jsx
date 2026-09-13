const formatTimestamp = (seconds) => {
  if (seconds == null || isNaN(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

const DetectionPreview = ({
  detectionResult,
  isAnalyzing,
  isAnalyzingVideo = false,
  detectionError,
  onClearFile,
  onRetry,
}) => {
  if (isAnalyzing) {
    return (
      <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-900 animate-pulse my-4">
        <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
        <div>
          <p className="font-bold text-sm">
            {isAnalyzingVideo
              ? "Analyzing video frames for potholes..."
              : "Analyzing image with AI..."}
          </p>
          <p className="text-xs text-amber-700">
            {isAnalyzingVideo
              ? "Sampling video frames and running YOLOv8 detection. This may take a few moments..."
              : "Please wait while we detect road damage and calculate hazard severity."}
          </p>
        </div>
      </div>
    );
  }

  if (detectionError) {
    return (
      <div className="bg-amber-50/90 border border-amber-300 rounded-xl p-5 my-4 space-y-3">
        <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
          <span>⚠️ AI Service Error / Unavailable</span>
        </div>
        <p className="text-xs text-amber-800 leading-relaxed">
          AI analysis issue: {detectionError}. You can retry or submit this report for manual review.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-md transition-colors"
            >
              🔄 Retry AI Analysis
            </button>
          )}
          {onClearFile && (
            <button
              type="button"
              onClick={onClearFile}
              className="text-xs bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold px-3 py-1.5 rounded-md transition-colors"
            >
              📷 Upload Another File
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!detectionResult) return null;

  const isVideo = detectionResult.mediaType === "video" || Boolean(detectionResult.videoMetadata);
  const videoEvents = detectionResult.videoDetections || (isVideo ? detectionResult.detections : []);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 my-4 space-y-4">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
        <span>AI Detection Results ({isVideo ? "Video" : "Image"})</span>
        {isVideo && detectionResult.videoMetadata && (
          <span className="text-[11px] font-mono text-slate-500 font-normal">
            ⏱ {detectionResult.videoMetadata.duration}s | {detectionResult.videoMetadata.fps} FPS
          </span>
        )}
      </h3>

      {detectionResult.detected ? (
        <>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-full flex items-center gap-1">
              ✓ Pothole Detected
            </span>
            <span className="text-xs font-bold text-slate-500">
              {isVideo
                ? `Max ${detectionResult.count} ${detectionResult.count === 1 ? "hazard" : "hazards"} in frame`
                : `${detectionResult.count} ${detectionResult.count === 1 ? "hazard found" : "hazards found"}`}
            </span>
          </div>

          {/* Metrics Summary Grid */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500 block mb-0.5 font-medium">Overall Severity</span>
              <span
                className={`text-sm font-extrabold ${
                  detectionResult.severity === "High"
                    ? "text-rose-600"
                    : detectionResult.severity === "Medium"
                    ? "text-amber-600"
                    : "text-emerald-600"
                }`}
              >
                {detectionResult.severity || "N/A"}
              </span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500 block mb-0.5 font-medium">
                {isVideo ? "Max Confidence" : "AI Confidence"}
              </span>
              <span className="text-sm font-extrabold text-slate-800">
                {detectionResult.confidence != null
                  ? `${(detectionResult.confidence * 100).toFixed(0)}%`
                  : "N/A"}
              </span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500 block mb-0.5 font-medium">
                {isVideo ? "Max Potholes" : "Potholes Found"}
              </span>
              <span className="text-sm font-extrabold text-slate-800">
                {detectionResult.count || 0}
              </span>
            </div>
          </div>

          {/* Video Metadata & Detection Timeline */}
          {isVideo && (
            <div className="space-y-3 pt-2 border-t border-slate-200">
              {detectionResult.videoMetadata && (
                <div className="flex flex-wrap justify-between text-xs bg-white p-2.5 rounded-lg border border-slate-200 text-slate-600">
                  <span><strong>Duration:</strong> {detectionResult.videoMetadata.duration} seconds</span>
                  <span><strong>FPS:</strong> {detectionResult.videoMetadata.fps}</span>
                  <span><strong>Total Frames:</strong> {detectionResult.videoMetadata.totalFrames}</span>
                </div>
              )}

              {videoEvents && videoEvents.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Detection Timeline ({videoEvents.length} events)</span>
                  </h4>
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                    {videoEvents.map((evt, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                            ⏱ {formatTimestamp(evt.timestamp)}
                          </span>
                          <span
                            className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                              evt.severity === "High"
                                ? "bg-rose-100 text-rose-800"
                                : evt.severity === "Medium"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {evt.severity || "Low"} Severity
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-800">
                            {evt.count} {evt.count === 1 ? "Pothole" : "Potholes"}
                          </span>
                          <span className="text-slate-500 text-[11px] block">
                            Confidence: {Math.round((evt.confidence || 0) * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Image annotated preview */}
          {!isVideo && detectionResult.annotatedImageBase64 && (
            <div>
              <span className="text-xs font-semibold text-slate-600 block mb-1.5">
                AI Annotated Detection Preview:
              </span>
              <img
                src={detectionResult.annotatedImageBase64}
                alt="AI pothole detection result"
                className="w-full max-h-72 object-contain rounded-lg border border-slate-300 shadow-xs bg-slate-900"
              />
            </div>
          )}
        </>
      ) : (
        <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-lg text-amber-900 text-xs leading-relaxed space-y-3">
          <div className="flex items-center gap-1.5 font-bold text-amber-800 text-sm">
            ⚠ No Pothole Detected
          </div>
          <p>
            {isVideo
              ? "We sampled video frames but could not confidently detect potholes. You can upload another file or submit for manual review."
              : "We could not confidently detect a pothole in this image. You can upload another image or continue submitting the report for manual review."}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {onClearFile && (
              <button
                type="button"
                onClick={onClearFile}
                className="text-xs bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold px-3 py-1.5 rounded-md transition-colors"
              >
                Option 1: Upload Another File
              </button>
            )}
            <span className="text-xs text-amber-800 font-semibold px-2 py-1.5 self-center">
              Option 2: Continue for Manual Review (needsManualReview: true)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetectionPreview;


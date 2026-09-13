import { useState } from "react";
import { uploadMedia, createPothole, detectPothole } from "../services/potholeService";
import DetectionPreview from "./DetectionPreview";

const PotholeForm = ({ onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [address, setAddress] = useState("");

  // AI Detection State
  const [detectionResult, setDetectionResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectionError, setDetectionError] = useState("");

  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [error, setError] = useState("");

  const runDetection = async (file) => {
    if (file.type.startsWith("video/")) {
      setDetectionResult({
        detected: false,
        confidence: null,
        severity: null,
        count: 0,
        detections: [],
        needsManualReview: true,
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      setDetectionError("");
      const result = await detectPothole(file);
      setDetectionResult(result);
    } catch (err) {
      console.error("AI Detection error:", err);
      const msg = err.response?.data?.message || err.message || "AI Service Unavailable";
      setDetectionError(msg);
      setDetectionResult({
        detected: false,
        confidence: null,
        severity: null,
        count: 0,
        detections: [],
        needsManualReview: true,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setError("");
    setDetectionError("");
    setDetectionResult(null);

    const isVideo = file.type.startsWith("video/");
    const previewUrl = URL.createObjectURL(file);
    setFilePreview({
      url: previewUrl,
      type: isVideo ? "video" : "image",
    });

    runDetection(file);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setDetectionResult(null);
    setDetectionError("");
  };

  const handleRetryDetection = () => {
    if (selectedFile) {
      runDetection(selectedFile);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setUploadStatus("Getting current location...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        setUploadStatus("");
      },
      (err) => {
        setError(`Failed to retrieve location: ${err.message}`);
        setUploadStatus("");
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedFile) {
      setError("Please select an image or video file of the pothole.");
      return;
    }

    if (!latitude || !longitude) {
      setError("Please provide valid latitude and longitude coordinates.");
      return;
    }

    if (isAnalyzing) {
      setError("Please wait for AI analysis to complete before submitting.");
      return;
    }

    try {
      setLoading(true);
      setUploadStatus("Uploading media to S3 bucket...");
      const uploadResult = await uploadMedia(selectedFile);

      if (!uploadResult?.media?.url) {
        throw new Error("Failed to receive uploaded media details from response.");
      }

      setUploadStatus("Creating pothole report in database...");

      const detectionPayload = detectionResult
        ? {
            detected: !!detectionResult.detected,
            confidence: detectionResult.detected ? parseFloat(detectionResult.confidence) : null,
            severity: detectionResult.detected ? detectionResult.severity : null,
            count: detectionResult.count || 0,
            detections: detectionResult.detections || [],
            needsManualReview: !!detectionResult.needsManualReview,
          }
        : {
            detected: false,
            confidence: null,
            severity: null,
            count: 0,
            detections: [],
            needsManualReview: true,
          };

      const potholePayload = {
        media: {
          key: uploadResult.media.key,
          url: uploadResult.media.url,
          type: uploadResult.media.type,
        },
        location: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          address: address || "Unspecified Location",
        },
        detection: detectionPayload,
      };

      const createdPothole = await createPothole(potholePayload);
      setUploadStatus("Report submitted successfully!");

      if (onSuccess) {
        onSuccess(createdPothole);
      }
    } catch (err) {
      console.error("Submission error:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to submit pothole report."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 rounded text-rose-700 text-sm">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {uploadStatus && !error && (
        <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded text-amber-800 text-sm animate-pulse">
          <p className="font-semibold">Status Update</p>
          <p>{uploadStatus}</p>
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-semibold text-slate-800 mb-2">
          Pothole Image <span className="text-rose-500">*</span>
        </label>
        <div className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-xl p-6 text-center bg-slate-50 transition-colors cursor-pointer relative">
          <input
            type="file"
            accept="image/jpeg,image/png,image/jpg,video/mp4,video/mpeg,video/quicktime"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={loading || isAnalyzing}
          />
          {filePreview ? (
            <div className="flex flex-col items-center">
              {filePreview.type === "video" ? (
                <video src={filePreview.url} className="max-h-48 rounded-lg mb-3 shadow" controls />
              ) : (
                <img src={filePreview.url} alt="Selected file preview" className="max-h-48 rounded-lg mb-3 shadow object-cover" />
              )}
              <span className="text-xs text-slate-600 font-medium">
                Selected file: {selectedFile?.name} ({(selectedFile?.size / (1024 * 1024)).toFixed(2)} MB)
              </span>
              <span className="text-xs text-amber-600 font-semibold mt-1">Click or drag to replace file</span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-4xl text-slate-400">📸</div>
              <p className="text-sm font-medium text-slate-700">
                Click to upload or drag and drop image/video
              </p>
              <p className="text-xs text-slate-400">
                Supports JPG, PNG, MP4, MOV (Max 50MB)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Section 2: AI Detection Preview Component */}
      <DetectionPreview
        detectionResult={detectionResult}
        isAnalyzing={isAnalyzing}
        detectionError={detectionError}
        onClearFile={handleClearFile}
        onRetry={handleRetryDetection}
      />

      {/* Section 3: Location Details */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-semibold text-slate-800">
            Location Details <span className="text-rose-500">*</span>
          </label>
          <button
            type="button"
            onClick={handleGetLocation}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-md border border-slate-300 transition-colors flex items-center gap-1"
          >
            📍Auto-detect GPS
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Latitude</label>
            <input
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="e.g. 30.7333"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Longitude</label>
            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="e.g. 76.7794"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Address / Landmark</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. Sector 17, Chandigarh"
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || isAnalyzing}
        className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 px-6 rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {isAnalyzing
          ? "Analyzing Image with AI..."
          : loading
          ? "Submitting Report..."
          : "Submit Pothole Report"}
      </button>
    </form>
  );
};

export default PotholeForm;

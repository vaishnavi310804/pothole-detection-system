import mongoose from "mongoose";
import Pothole from "../models/Pothole.js";
import uploadToS3, { getPresignedMediaUrl } from "../services/s3Service.js";
import callAIService from "../services/aiService.js";
import determineAuthority, { SUPPORTED_AUTHORITIES } from "../services/authorityService.js";


const reportStatuses = [
  "Reported",
  "Acknowledged",
  "In Progress",
  "Resolved",
];

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Helper to normalize and validate detection payload
const normalizeDetectionData = (detection = {}) => {
  const isDetected = Boolean(detection.detected);
  const mediaType = detection.mediaType || "image";

  let videoMetadata = null;
  if (detection.videoMetadata && typeof detection.videoMetadata === "object") {
    videoMetadata = {
      duration: typeof detection.videoMetadata.duration === "number" ? detection.videoMetadata.duration : 0,
      fps: typeof detection.videoMetadata.fps === "number" ? detection.videoMetadata.fps : 0,
      totalFrames: typeof detection.videoMetadata.totalFrames === "number" ? detection.videoMetadata.totalFrames : 0,
    };
  }

  let videoDetections = Array.isArray(detection.videoDetections)
    ? detection.videoDetections.map((vd) => ({
        timestamp: typeof vd.timestamp === "number" ? vd.timestamp : 0,
        frameNumber: typeof vd.frameNumber === "number" ? vd.frameNumber : 0,
        confidence: typeof vd.confidence === "number" ? vd.confidence : 0,
        count: typeof vd.count === "number" ? vd.count : 1,
        severity: vd.severity || "Low",
      }))
    : Array.isArray(detection.detections) && mediaType === "video"
    ? detection.detections.map((vd) => ({
        timestamp: typeof vd.timestamp === "number" ? vd.timestamp : 0,
        frameNumber: typeof vd.frameNumber === "number" ? vd.frameNumber : 0,
        confidence: typeof vd.confidence === "number" ? vd.confidence : 0,
        count: typeof vd.count === "number" ? vd.count : 1,
        severity: vd.severity || "Low",
      }))
    : [];

  if (isDetected) {
    let conf = typeof detection.confidence === "number" ? detection.confidence : null;
    if (conf !== null) {
      conf = Math.max(0, Math.min(1, conf));
    }

    let sev = ["Low", "Medium", "High"].includes(detection.severity)
      ? detection.severity
      : "Low";

    let cnt = typeof detection.count === "number" ? Math.max(1, detection.count) : 1;

    let dets = Array.isArray(detection.detections)
      ? detection.detections.map((d) => ({
          label: d.label || "pothole",
          confidence: typeof d.confidence === "number" ? d.confidence : conf,
          boundingBox: d.boundingBox || null,
          normalizedBox: d.normalizedBox || null,
          timestamp: d.timestamp,
          frameNumber: d.frameNumber,
          count: d.count,
          severity: d.severity,
        }))
      : [];

    return {
      mediaType,
      detected: true,
      confidence: conf,
      severity: sev,
      count: cnt,
      videoMetadata,
      videoDetections,
      detections: dets,
      needsManualReview: Boolean(detection.needsManualReview),
    };
  } else {
    return {
      mediaType,
      detected: false,
      confidence: null,
      severity: null,
      count: 0,
      videoMetadata,
      videoDetections: [],
      detections: [],
      needsManualReview: true,
    };
  }
};

// Attach fresh presigned URLs to media objects and ensure safe detection defaults
const formatPothole = async (potholeDoc) => {
  if (!potholeDoc) return null;
  const pothole = potholeDoc.toObject ? potholeDoc.toObject() : { ...potholeDoc };

  if (pothole.media?.key) {
    const presignedUrl = await getPresignedMediaUrl(pothole.media.key);
    if (presignedUrl) {
      pothole.media.url = presignedUrl;
    }
  }

  // Ensure safe detection structure for legacy records
  if (pothole.detection) {
    if (!pothole.detection.mediaType) {
      pothole.detection.mediaType = pothole.media?.type || "image";
    }
    if (pothole.detection.detected === undefined) {
      pothole.detection.detected = Boolean(pothole.detection.severity || pothole.detection.confidence);
      pothole.detection.needsManualReview = !pothole.detection.detected;
      pothole.detection.count = pothole.detection.detected ? 1 : 0;
      pothole.detection.detections = pothole.detection.detections || [];
    }
    pothole.detection.videoDetections = pothole.detection.videoDetections || [];
  } else {
    pothole.detection = {
      mediaType: pothole.media?.type || "image",
      detected: false,
      confidence: null,
      severity: null,
      count: 0,
      videoMetadata: null,
      videoDetections: [],
      detections: [],
      needsManualReview: true,
    };
  }

  return pothole;
};


const formatPotholes = async (potholeDocs) => {
  if (!Array.isArray(potholeDocs)) return [];
  return await Promise.all(potholeDocs.map((doc) => formatPothole(doc)));
};

const handleControllerError = (res, error) => {
  if (error.name === "ValidationError") {
    const errors = Object.fromEntries(
      Object.entries(error.errors).map(([field, fieldError]) => [
        field,
        fieldError.message,
      ]),
    );

    return res.status(400).json({
      message: "Validation error",
      errors,
    });
  }

  if (error.name === "CastError") {
    return res.status(400).json({
      message: "Invalid pothole ID",
    });
  }

  console.error(error);
  return res.status(500).json({
    message: "Internal server error",
  });
};

export const createPothole = async (req, res) => {
  try {
    const normalizedDetection = normalizeDetectionData(req.body.detection);
    const authorityData = determineAuthority(req.body.location);
    const initialStatus = authorityData.status === "Assigned" ? "Assigned" : "Pending";

    const potholeData = {
      ...req.body,
      reportedBy: req.user._id,
      detection: normalizedDetection,
      authority: authorityData,
      status: initialStatus,
      reportStatus: initialStatus,
    };

    const pothole = await Pothole.create(potholeData);
    await pothole.populate("reportedBy", "name email");

    const formatted = await formatPothole(pothole);
    return res.status(201).json(formatted);
  } catch (error) {
    return handleControllerError(res, error);
  }
};


export const getMyPotholes = async (req, res) => {
  try {
    const filters = {
      reportedBy: req.user._id,
    };

    if (req.query.reportStatus) {
      filters.reportStatus = req.query.reportStatus;
    }

    if (req.query.severity) {
      filters["detection.severity"] = req.query.severity;
    }

    const potholes = await Pothole.find(filters)
      .sort({ createdAt: -1 })
      .populate("reportedBy", "name email");

    const formattedPotholes = await formatPotholes(potholes);
    return res.status(200).json(formattedPotholes);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const getAllPotholes = async (req, res) => {
  try {
    const filters = {};

    if (req.query.reportStatus) {
      filters.reportStatus = req.query.reportStatus;
    }

    if (req.query.severity) {
      filters["detection.severity"] = req.query.severity;
    }

    const potholes = await Pothole.find(filters)
      .sort({ createdAt: -1 })
      .populate("reportedBy", "name email");

    const formattedPotholes = await formatPotholes(potholes);
    return res.status(200).json(formattedPotholes);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const getAuthorityPotholes = async (req, res) => {
  try {
    if (req.user.role !== "authority" || !req.user.authorityName) {
      return res.status(403).json({
        message: "Forbidden: You are not authorized to access this authority ticket.",
      });
    }

    const filters = {
      "authority.name": req.user.authorityName,
    };

    if (req.query.reportStatus) {
      filters.$or = [
        { reportStatus: req.query.reportStatus },
        { status: req.query.reportStatus },
      ];
    }

    if (req.query.status) {
      filters.status = req.query.status;
    }

    if (req.query.severity) {
      filters["detection.severity"] = req.query.severity;
    }

    const potholes = await Pothole.find(filters)
      .sort({ createdAt: -1 })
      .populate("reportedBy", "name email");

    const formattedPotholes = await formatPotholes(potholes);
    return res.status(200).json(formattedPotholes);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const getAuthorityPotholeById = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid pothole ID" });
  }

  try {
    if (req.user.role !== "authority" || !req.user.authorityName) {
      return res.status(403).json({
        message: "Forbidden: You are not authorized to access this authority ticket.",
      });
    }

    const pothole = await Pothole.findById(req.params.id).populate("reportedBy", "name email");

    if (!pothole) {
      return res.status(404).json({ message: "Pothole not found" });
    }

    if (pothole.authority?.name !== req.user.authorityName) {
      return res.status(403).json({
        message: "You are not authorized to access this authority ticket.",
      });
    }

    const formatted = await formatPothole(pothole);
    return res.status(200).json(formatted);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const getPotholeById = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({
      message: "Invalid pothole ID",
    });
  }

  try {
    const pothole = await Pothole.findById(req.params.id).populate(
      "reportedBy",
      "name email"
    );

    if (!pothole) {
      return res.status(404).json({
        message: "Pothole not found",
      });
    }

    const isReporter = pothole.reportedBy?._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    const isAssignedAuthority =
      req.user.role === "authority" && pothole.authority?.name === req.user.authorityName;

    if (!isAdmin && !isReporter && !isAssignedAuthority) {
      return res.status(403).json({
        message: "You are not authorized to access this authority ticket.",
      });
    }

    const formatted = await formatPothole(pothole);
    return res.status(200).json(formatted);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const updatePotholeStatus = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({
      message: "Invalid pothole ID",
    });
  }

  const newStatus = req.body.reportStatus || req.body.status;
  const allowedStatusValues = ["Reported", "Acknowledged", "Assigned", "In Progress", "Resolved", "Pending"];

  if (!newStatus || !allowedStatusValues.includes(newStatus)) {
    return res.status(400).json({
      message: "Invalid report status",
      allowedStatuses: allowedStatusValues,
    });
  }

  try {
    const pothole = await Pothole.findById(req.params.id).populate("reportedBy", "name email");

    if (!pothole) {
      return res.status(404).json({
        message: "Pothole not found",
      });
    }

    // Check authority access control & status transition permissions
    if (req.user.role === "authority") {
      if (!req.user.authorityName || pothole.authority?.name !== req.user.authorityName) {
        return res.status(403).json({
          message: "You are not authorized to access this authority ticket.",
        });
      }

      const currentStatus = pothole.status || pothole.reportStatus || "Assigned";
      const allowedTransitions = {
        Pending: ["Assigned", "In Progress"],
        Assigned: ["In Progress"],
        "In Progress": ["Resolved"],
        Resolved: [],
        Reported: ["In Progress", "Resolved"],
        Acknowledged: ["In Progress", "Resolved"],
      };

      const allowedNext = allowedTransitions[currentStatus] || ["In Progress", "Resolved"];
      if (!allowedNext.includes(newStatus)) {
        return res.status(400).json({
          message: `Invalid status transition from "${currentStatus}" to "${newStatus}".`,
          allowedNextTransitions: allowedNext,
        });
      }
    }

    pothole.status = newStatus;
    pothole.reportStatus = newStatus;
    await pothole.save();

    const formatted = await formatPothole(pothole);
    return res.status(200).json(formatted);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const reassignPotholeAuthority = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid pothole ID" });
  }

  const { authorityName } = req.body;

  if (!authorityName) {
    return res.status(400).json({ message: "authorityName is required" });
  }

  const matchedConfig = SUPPORTED_AUTHORITIES.find(
    (a) => a.name.toLowerCase() === authorityName.trim().toLowerCase()
  );

  if (!matchedConfig) {
    return res.status(400).json({
      message: "Unsupported authority name for reassignment",
      supportedAuthorities: SUPPORTED_AUTHORITIES.map((a) => a.name),
    });
  }

  try {
    const pothole = await Pothole.findById(req.params.id).populate("reportedBy", "name email");

    if (!pothole) {
      return res.status(404).json({ message: "Pothole not found" });
    }

    pothole.authority = {
      name: matchedConfig.name,
      type: matchedConfig.type,
      jurisdiction: matchedConfig.jurisdiction,
      status: "Assigned",
      source: "Admin Manual Assignment",
      confidence: "High",
      needsManualReview: false,
      assignedAt: new Date(),
    };

    pothole.status = "Assigned";
    pothole.reportStatus = "Assigned";

    await pothole.save();

    const formatted = await formatPothole(pothole);
    return res.status(200).json(formatted);
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const deletePothole = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({
      message: "Invalid pothole ID",
    });
  }

  try {
    const pothole = await Pothole.findByIdAndDelete(req.params.id);

    if (!pothole) {
      return res.status(404).json({
        message: "Pothole not found",
      });
    }

    return res.status(200).json({
      message: "Pothole deleted successfully",
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload an image or video",
      });
    }

    const uploadedFile = await uploadToS3(req.file);

    return res.status(201).json({
      message: "Media uploaded successfully",
      media: uploadedFile,
    });
  } catch (error) {
    console.error("Upload error:", error);

    return res.status(500).json({
      message: "Failed to upload media",
      error: error.message,
    });
  }
};

export const detectPothole = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload an image or video for AI detection",
      });
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
      "video/mp4",
      "video/mpeg",
      "video/quicktime",
      "video/webm",
      "video/x-msvideo",
      "video/avi",
    ];

    if (!allowedTypes.includes(req.file.mimetype) && !req.file.mimetype.startsWith("video/") && !req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({
        message: "Unsupported file type. Please upload a supported image (JPG, PNG) or video (MP4, MOV, AVI, WEBM).",
      });
    }

    const aiResult = await callAIService(req.file);
    return res.status(200).json(aiResult);
  } catch (error) {

    console.error("AI Detection error in controller:", error.message);

    if (error.code === "ETIMEDOUT" || error.name === "AbortError") {
      return res.status(504).json({
        message: "AI detection request timed out",
        detected: false,
        needsManualReview: true,
      });
    }

    if (
      error.code === "ECONNREFUSED" ||
      error.message?.includes("fetch failed") ||
      error.message?.includes("ECONNREFUSED")
    ) {
      return res.status(503).json({
        message: "AI detection service is unavailable",
        detected: false,
        needsManualReview: true,
      });
    }

    return res.status(500).json({
      message: "AI detection failed",
      error: error.message,
      detected: false,
      needsManualReview: true,
    });
  }
};
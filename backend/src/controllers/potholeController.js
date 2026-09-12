import mongoose from "mongoose";
import Pothole from "../models/Pothole.js";
import uploadToS3, { getPresignedMediaUrl } from "../services/s3Service.js";
import callAIService from "../services/aiService.js";


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
        }))
      : [];

    return {
      detected: true,
      confidence: conf,
      severity: sev,
      count: cnt,
      detections: dets,
      needsManualReview: Boolean(detection.needsManualReview),
    };
  } else {
    return {
      detected: false,
      confidence: null,
      severity: null,
      count: 0,
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
    if (pothole.detection.detected === undefined) {
      pothole.detection.detected = Boolean(pothole.detection.severity || pothole.detection.confidence);
      pothole.detection.needsManualReview = !pothole.detection.detected;
      pothole.detection.count = pothole.detection.detected ? 1 : 0;
      pothole.detection.detections = pothole.detection.detections || [];
    }
  } else {
    pothole.detection = {
      detected: false,
      confidence: null,
      severity: null,
      count: 0,
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

    const potholeData = {
      ...req.body,
      reportedBy: req.user._id,
      detection: normalizedDetection,
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

    if (
      req.user.role !== "admin" &&
      pothole.reportedBy?._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Forbidden: You are not authorized to view this report",
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

  const { reportStatus } = req.body;

  if (!reportStatuses.includes(reportStatus)) {
    return res.status(400).json({
      message: "Invalid report status",
      allowedStatuses: reportStatuses,
    });
  }

  try {
    const pothole = await Pothole.findByIdAndUpdate(
      req.params.id,
      { $set: { reportStatus } },
      { new: true, runValidators: true }
    ).populate("reportedBy", "name email");

    if (!pothole) {
      return res.status(404).json({
        message: "Pothole not found",
      });
    }

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
        message: "Please upload an image for AI detection",
      });
    }

    if (req.file.mimetype.startsWith("video/")) {
      return res.status(400).json({
        message: "Video AI detection is not available yet. Please upload an image.",
      });
    }

    const allowedImageTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
    ];

    if (!allowedImageTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        message: "Unsupported file type. Please upload a JPG or PNG image.",
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
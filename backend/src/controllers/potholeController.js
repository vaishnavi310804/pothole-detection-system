import mongoose from "mongoose";
import Pothole from "../models/Pothole.js";
import uploadToS3 from "../services/s3Service.js";

const reportStatuses = [
  "Reported",
  "Acknowledged",
  "In Progress",
  "Resolved",
];

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

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
    const pothole = await Pothole.create(req.body);

    return res.status(201).json(pothole);
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

    const potholes = await Pothole.find(filters).sort({ createdAt: -1 });

    return res.status(200).json(potholes);
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
    const pothole = await Pothole.findById(req.params.id);

    if (!pothole) {
      return res.status(404).json({
        message: "Pothole not found",
      });
    }

    return res.status(200).json(pothole);
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
      { new: true, runValidators: true },
    );

    if (!pothole) {
      return res.status(404).json({
        message: "Pothole not found",
      });
    }

    return res.status(200).json(pothole);
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
import mongoose from "mongoose";

const potholeSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    media: {
      url: {
        type: String,
        required: true,
        trim: true,
      },
      type: {
        type: String,
        required: true,
        enum: ["image", "video"],
      },
      key: {
        type: String,
        trim: true,
      },
    },
    location: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
      address: {
        type: String,
        trim: true,
      },
    },
    detection: {
      mediaType: {
        type: String,
        enum: ["image", "video"],
        default: "image",
      },
      detected: {
        type: Boolean,
        default: false,
      },
      confidence: {
        type: Number,
        default: null,
      },
      severity: {
        type: String,
        enum: ["Low", "Medium", "High", null],
        default: null,
      },
      count: {
        type: Number,
        default: 0,
      },
      videoMetadata: {
        duration: { type: Number },
        fps: { type: Number },
        totalFrames: { type: Number },
      },
      videoDetections: [
        {
          timestamp: { type: Number },
          frameNumber: { type: Number },
          confidence: { type: Number },
          count: { type: Number },
          severity: { type: String },
        },
      ],
      detections: [
        {
          label: { type: String, default: "pothole" },
          confidence: { type: Number },
          boundingBox: {
            x1: { type: Number },
            y1: { type: Number },
            x2: { type: Number },
            y2: { type: Number },
          },
          normalizedBox: {
            x1: { type: Number },
            y1: { type: Number },
            x2: { type: Number },
            y2: { type: Number },
          },
          timestamp: { type: Number },
          frameNumber: { type: Number },
          count: { type: Number },
          severity: { type: String },
        },
      ],
      needsManualReview: {
        type: Boolean,
        default: false,
      },
    },


    authority: {
      name: {
        type: String,
        trim: true,
        default: "Authority requires verification",
      },
      type: {
        type: String,
        trim: true,
        default: "Unknown",
      },
      jurisdiction: {
        type: String,
        trim: true,
        default: "Unspecified",
      },
      status: {
        type: String,
        enum: ["Pending", "Assigned", "Sent"],
        default: "Pending",
      },
      source: {
        type: String,
        trim: true,
        default: "System Fallback",
      },
      confidence: {
        type: String,
        enum: ["High", "Medium", "Low", "None"],
        default: "None",
      },
      needsManualReview: {
        type: Boolean,
        default: true,
      },
      assignedAt: {
        type: Date,
        default: Date.now,
      },
    },
    status: {
      type: String,
      enum: ["Pending", "Assigned", "In Progress", "Resolved"],
      default: "Pending",
    },
    reportStatus: {
      type: String,
      enum: ["Reported", "Acknowledged", "Assigned", "In Progress", "Resolved", "Pending"],
      default: "Reported",
    },
    detectedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

const Pothole = mongoose.model("Pothole", potholeSchema);

export default Pothole;
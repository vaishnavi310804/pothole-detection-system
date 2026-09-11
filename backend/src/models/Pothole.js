import mongoose from "mongoose";

const potholeSchema = new mongoose.Schema(
  {
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
      confidence: {
        type: Number,
        min: 0,
        max: 1,
      },
      severity: {
        type: String,
        required: true,
        enum: ["Low", "Medium", "High"],
      },
    },
    authority: {
      name: {
        type: String,
        trim: true,
      },
      type: {
        type: String,
        trim: true,
      },
      status: {
        type: String,
        enum: ["Pending", "Assigned", "Sent"],
        default: "Pending",
      },
    },
    reportStatus: {
      type: String,
      enum: ["Reported", "Acknowledged", "In Progress", "Resolved"],
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
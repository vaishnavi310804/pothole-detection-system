import express from "express";
import {
  createPothole,
  getMyPotholes,
  getAllPotholes,
  getPotholeById,
  updatePotholeStatus,
  deletePothole,
  uploadMedia,
  detectPothole,
  getAuthorityPotholes,
  getAuthorityPotholeById,
  reassignPotholeAuthority,
} from "../controllers/potholeController.js";
import upload from "../middleware/uploadMiddleware.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Authenticated user routes
router.post("/", protect, createPothole);
router.post("/detect", protect, upload.single("file"), detectPothole);
router.post("/upload", protect, upload.single("file"), uploadMedia);
router.get("/my-reports", protect, getMyPotholes);

// Authority-specific routes
router.get("/authority/my-reports", protect, authorizeRoles("authority"), getAuthorityPotholes);
router.get("/authority/reports/:id", protect, authorizeRoles("authority"), getAuthorityPotholeById);

// Admin-only routes
router.get("/", protect, authorizeRoles("admin"), getAllPotholes);
router.patch("/:id/authority", protect, authorizeRoles("admin"), reassignPotholeAuthority);
router.delete("/:id", protect, authorizeRoles("admin"), deletePothole);

// Status update (Admin & Authority)
router.patch("/:id/status", protect, authorizeRoles("admin", "authority"), updatePotholeStatus);

// Detail route (ownership / role access checked in controller)
router.get("/:id", protect, getPotholeById);

export default router;

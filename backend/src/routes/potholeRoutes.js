import express from "express";
import {
  createPothole,
  getAllPotholes,
  getPotholeById,
  updatePotholeStatus,
  deletePothole,
  uploadMedia,
} from "../controllers/potholeController.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/", createPothole);
router.get("/", getAllPotholes);
router.post("/upload", upload.single("file"), uploadMedia);
router.get("/:id", getPotholeById);
router.patch("/:id/status", updatePotholeStatus);
router.delete("/:id", deletePothole);

export default router;

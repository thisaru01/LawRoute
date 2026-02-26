import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import {
  createDocument,
  getAllDocuments,
  getDocument,
  downloadDocument,
  deleteDocument,
} from "../controllers/documentController.js";

const router = express.Router();

// Public: list and view documents
router.get("/", getAllDocuments);
router.get("/:id", getDocument);
router.get("/:id/download", downloadDocument);

// Admin: upload and delete documents
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  upload.single("file"),
  createDocument,
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteDocument,
);

export default router;

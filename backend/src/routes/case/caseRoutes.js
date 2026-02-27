import express from "express";
import {
  getMyCases,
  getCaseById,
  closeCase,
} from "../../controllers/case/caseController.js";
import {
  uploadCaseDocument,
  getCaseDocuments,
} from "../../controllers/case/caseDocumentController.js";
import { protect, authorizeRoles } from "../../middleware/authMiddleware.js";
import upload from "../../middleware/uploadMiddleware.js";

const router = express.Router();

// Get cases related to the logged-in user
router.get("/my", protect, authorizeRoles("user", "lawyer"), getMyCases);

// Get case details by id
router.get("/:id", protect, authorizeRoles("user", "lawyer"), getCaseById);

// Upload a document for a case
router.post(
  "/:id/documents",
  protect,
  authorizeRoles("user", "lawyer"),
  upload.single("file"),
  uploadCaseDocument,
);

// Get all documents for a case
router.get(
  "/:id/documents",
  protect,
  authorizeRoles("user", "lawyer"),
  getCaseDocuments,
);

// Close case (lawyer only)
router.patch("/:id/close", protect, authorizeRoles("lawyer"), closeCase);

export default router;

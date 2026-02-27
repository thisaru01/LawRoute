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
import {
  scheduleCaseMeeting,
  getCaseMeetings,
  updateCaseMeeting,
} from "../../controllers/case/caseMeetingController.js";
import {
  validateCreateCaseMeeting,
  validateUpdateCaseMeeting,
} from "../../validations/caseMeetingValidation.js";
import { protect, authorizeRoles } from "../../middleware/authMiddleware.js";
import { caseDocumentUpload } from "../../middleware/upload/caseDocumentUpload.js";

const router = express.Router();

// Get cases related to the logged-in user
router.get("/my", protect, authorizeRoles("user", "lawyer"), getMyCases);

// Get case details by id
router.get("/:id", protect, authorizeRoles("user", "lawyer"), getCaseById);

// Schedule a meeting for a case (lawyer only)
router.post(
  "/:id/meetings",
  protect,
  authorizeRoles("lawyer"),
  validateCreateCaseMeeting,
  scheduleCaseMeeting,
);

// Get all meetings for a case
router.get(
  "/:id/meetings",
  protect,
  authorizeRoles("user", "lawyer"),
  getCaseMeetings,
);

// Update a meeting (lawyer only)
router.patch(
  "/meetings/:id",
  protect,
  authorizeRoles("lawyer"),
  validateUpdateCaseMeeting,
  updateCaseMeeting,
);

// Upload a document for a case
router.post(
  "/:id/documents",
  protect,
  authorizeRoles("user", "lawyer"),
  caseDocumentUpload.single("file"),
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

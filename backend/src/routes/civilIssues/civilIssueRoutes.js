import express from "express";

import {
  submitCivilIssue,
  getMyCivilIssues,
  getAssignedCivilIssues,
  getAdminCivilIssues,
  getCivilIssueById,
  updateCivilIssue,
  deleteCivilIssue,
  updateCivilIssueStatus,
  rejectCivilIssue,
  getPublicCivilIssues,
} from "../../controllers/civilIssues/civilIssueController.js";

import { protect, authorizeRoles } from "../../middleware/authMiddleware.js";

import {
  validateSubmitCivilIssue,
  validateUpdateCivilIssue,
  validateUpdateCivilIssueStatus,
  validateRejectCivilIssue,
} from "../../validations/civilIssueValidation.js";

import civilIssueUpload from "../../middleware/upload/civilIssueUpload.js";

const router = express.Router();

// Public: view all publicly visible civil issues (no auth required)
// Must be defined BEFORE /:id to prevent Express treating 'public' as an ID.
router.get("/public", getPublicCivilIssues);

// Citizen: submit a new civil issue (auto-routed to correct authority by category)
router.post(
  "/",
  protect,
  authorizeRoles("user"),
  civilIssueUpload.array("attachments", 5),
  validateSubmitCivilIssue,
  submitCivilIssue,
);

// Citizen: view own submitted civil issues
router.get("/my", protect, authorizeRoles("user"), getMyCivilIssues);

// Authority: view assigned civil issues (optional ?district= filter)
router.get(
  "/assigned",
  protect,
  authorizeRoles("authority"),
  getAssignedCivilIssues,
);

// Admin: view shared civil issues in the "other" triage queue
router.get(
  "/admin",
  protect,
  authorizeRoles("admin"),
  getAdminCivilIssues,
);

// Citizen or Authority: view a single civil issue by ID
router.get(
  "/:id",
  protect,
  authorizeRoles("user", "authority", "admin"),
  getCivilIssueById,
);

// Authority: update the status of an assigned civil issue (must be before /:id)
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("authority", "admin"),
  validateUpdateCivilIssueStatus,
  updateCivilIssueStatus,
);

// Authority/Admin: reject a civil issue with a required note (must be before /:id)
router.patch(
  "/:id/reject",
  protect,
  authorizeRoles("authority", "admin"),
  validateRejectCivilIssue,
  rejectCivilIssue,
);

// Citizen: update own issue fields (only while pending)
router.patch(
  "/:id",
  protect,
  authorizeRoles("user"),
  civilIssueUpload.array("attachments", 5),
  validateUpdateCivilIssue,
  updateCivilIssue,
);

// Citizen: delete own civil issue
router.delete("/:id", protect, authorizeRoles("user"), deleteCivilIssue);

export default router;

import express from "express";

import {
  submitCivilIssue,
  getMyCivilIssues,
  getAssignedCivilIssues,
  getCivilIssueById,
  updateCivilIssue,
  deleteCivilIssue,
  updateCivilIssueStatus,
} from "../../controllers/civilIssues/civilIssueController.js";

import { protect, authorizeRoles } from "../../middleware/authMiddleware.js";

import {
  validateSubmitCivilIssue,
  validateUpdateCivilIssue,
  validateUpdateCivilIssueStatus,
} from "../../validations/civilIssueValidation.js";

const router = express.Router();

// Citizen: submit a new civil issue (auto-routed to correct authority by category)
router.post("/", protect, authorizeRoles("user"), validateSubmitCivilIssue, submitCivilIssue);

// Citizen: view own submitted civil issues
router.get("/my", protect, authorizeRoles("user"), getMyCivilIssues);

// Authority: view assigned civil issues (optional ?district= filter)
router.get(
  "/assigned",
  protect,
  authorizeRoles("authority"),
  getAssignedCivilIssues,
);

// Citizen or Authority: view a single civil issue by ID
router.get(
  "/:id",
  protect,
  authorizeRoles("user", "authority"),
  getCivilIssueById,
);

// Authority: update the status of an assigned civil issue (must be before /:id)
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("authority"),
  validateUpdateCivilIssueStatus,
  updateCivilIssueStatus,
);

// Citizen: update own issue description/district (only while pending)
router.patch("/:id", protect, authorizeRoles("user"), validateUpdateCivilIssue, updateCivilIssue);

// Citizen: delete own civil issue
router.delete("/:id", protect, authorizeRoles("user"), deleteCivilIssue);

export default router;

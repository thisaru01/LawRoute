import express from "express";

import {
  submitCivilIssue,
  getMyCivilIssues,
  getAssignedCivilIssues,
  getCivilIssueById,
  updateCivilIssue,
  deleteCivilIssue,
} from "../../controllers/civilIssues/civilIssueController.js";

import { protect, authorizeRoles } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Citizen: submit a new civil issue (auto-routed to correct authority by category)
router.post("/", protect, authorizeRoles("user"), submitCivilIssue);

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

// Citizen: update own issue description/district (only while pending)
router.patch("/:id", protect, authorizeRoles("user"), updateCivilIssue);

// Citizen: delete own civil issue
router.delete("/:id", protect, authorizeRoles("user"), deleteCivilIssue);

export default router;

import express from "express";

import {
  submitCivilIssue,
  getMyCivilIssues,
  getAssignedCivilIssues,
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

export default router;

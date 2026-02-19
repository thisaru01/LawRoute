const express = require("express");

const router = express.Router();

const {
    submitCivilIssue,
    getMyCivilIssues,
    getAssignedCivilIssues,
} = require("../../controllers/civilIssues/civilIssueController");

const { protect, authorizeRoles } = require("../../middleware/authMiddleware");

// Citizen: submit a new civil issue (auto-routed to correct authority by category)
router.post("/", protect, authorizeRoles("user"), submitCivilIssue);

// Citizen: view own submitted civil issues
router.get("/my", protect, authorizeRoles("user"), getMyCivilIssues);

// Authority: view assigned civil issues (optional ?district= filter)
router.get("/assigned", protect, authorizeRoles("authority"), getAssignedCivilIssues);

module.exports = router;

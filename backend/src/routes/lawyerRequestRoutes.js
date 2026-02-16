const express = require("express");

const router = express.Router();

const {
  createLawyerRequest,
  getMyLawyerRequests,
  getAssignedRequestsForLawyer,
} = require("../controllers/lawyerRequestController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Create a new lawyer request
router.post("/", protect, createLawyerRequest);

// Get requests created by the current user
router.get("/me", protect, getMyLawyerRequests);

// Get requests assigned to the current lawyer
router.get(
  "/lawyer/me",
  protect,
  authorizeRoles("lawyer"),
  getAssignedRequestsForLawyer,
);

module.exports = router;

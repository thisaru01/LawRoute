const express = require("express");

const router = express.Router();

const {
  createLawyerRequest,
  getMyLawyerRequests,
  getAssignedRequestsForLawyer,
  getLawyerRequestById,
  acceptLawyerRequest,
  rejectLawyerRequest,
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

// Get a single lawyer request (only the involved user, lawyer, or admin)
router.get("/:id", protect, getLawyerRequestById);

// Accept a lawyer request (only the assigned lawyer or admin)
router.patch(
  "/:id/accept",
  protect,
  authorizeRoles("lawyer"),
  acceptLawyerRequest,
);

// Reject a lawyer request (only the assigned lawyer or admin)
router.patch(
  "/:id/reject",
  protect,
  authorizeRoles("lawyer"),
  rejectLawyerRequest,
);

module.exports = router;

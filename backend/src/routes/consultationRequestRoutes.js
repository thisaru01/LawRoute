import express from "express";

import {
  createConsultationRequest,
  getMyConsultationRequests,
  getAssignedConsultationRequestsForLawyer,
  getConsultationRequestById,
  updateConsultationRequest,
  acceptConsultationRequest,
  rejectConsultationRequest,
} from "../controllers/consultationRequestController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a new consultation request
router.post("/", protect, createConsultationRequest);

// Get consultation requests created by the current user
router.get("/me", protect, getMyConsultationRequests);

// Get consultation requests assigned to the current lawyer
router.get(
  "/lawyer/me",
  protect,
  authorizeRoles("lawyer"),
  getAssignedConsultationRequestsForLawyer,
);

// Get a single consultation request (only the involved user, lawyer, or admin)
router.get("/:id", protect, getConsultationRequestById);

// Update a consultation request (only the creator and only if pending)
router.put("/:id", protect, updateConsultationRequest);

// Accept a consultation request (only the assigned lawyer or admin)
router.patch(
  "/:id/accept",
  protect,
  authorizeRoles("lawyer"),
  acceptConsultationRequest,
);

// Reject a consultation request (only the assigned lawyer or admin)
router.patch(
  "/:id/reject",
  protect,
  authorizeRoles("lawyer"),
  rejectConsultationRequest,
);

export default router;

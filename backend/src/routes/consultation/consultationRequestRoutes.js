import express from "express";

import {
  createConsultationRequest,
  getMyConsultationRequests,
  getConsultationRequestById,
  updateConsultationRequest,
  deleteConsultationRequest,
} from "../../controllers/consultation/citizenConsultationRequestController.js";

import {
  acceptConsultationRequest,
  rejectConsultationRequest,
} from "../../controllers/consultation/lawyerConsultationRequestController.js";

import { protect, authorizeRoles } from "../../middleware/authMiddleware.js";
import {
  validateCreateConsultationRequest,
  validateUpdateConsultationRequest,
} from "../../validations/consultationRequestValidation.js";

const router = express.Router();

// Create a new consultation request
router.post(
  "/",
  protect,
  authorizeRoles("user"),
  validateCreateConsultationRequest,
  createConsultationRequest,
);

// Get consultation requests related to the current user (citizen or lawyer)
router.get("/me", protect, getMyConsultationRequests);

// Get a single consultation request (only the involved user, lawyer)
router.get("/:id", protect, getConsultationRequestById);

// Update a consultation request (only the creator and only if pending)
router.put(
  "/:id",
  protect,
  validateUpdateConsultationRequest,
  updateConsultationRequest,
);

// Delete a consultation request (only the creator and only if pending)
router.delete("/:id", protect, deleteConsultationRequest);

// Accept a consultation request (only the assigned lawyer)
router.patch(
  "/:id/accept",
  protect,
  authorizeRoles("lawyer"),
  acceptConsultationRequest,
);

// Reject a consultation request (only the assigned lawyer)
router.patch(
  "/:id/reject",
  protect,
  authorizeRoles("lawyer"),
  rejectConsultationRequest,
);

export default router;

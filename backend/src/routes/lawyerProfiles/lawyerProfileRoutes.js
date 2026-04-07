import express from "express";

import {
  getApprovedLawyerProfiles,
  getAllLawyerProfiles,
  getLawyerProfilesForAdmin,
  getMyLawyerProfile,
  updateLawyerVerificationStatus,
  updateLawyerProfile,
  getLawyerProfileById,
} from "../../controllers/lawyerProfiles/lawyerProfileController.js";
import { protect, authorizeRoles } from "../../middleware/authMiddleware.js";
import {
  validateLawyerVerificationStatusUpdate,
  validateUpdateLawyerProfile,
} from "../../validations/lawyerProfiles/lawyerProfileValidation.js";

const router = express.Router();

// Get all lawyer profiles with details
router.get("/", getAllLawyerProfiles);

// Get approved lawyer profiles with details
router.get("/approved", getApprovedLawyerProfiles);

// Get logged-in lawyer profile
router.get("/me", protect, authorizeRoles("lawyer"), getMyLawyerProfile);

// Update logged-in lawyer profile
router.put(
  "/me",
  protect,
  authorizeRoles("lawyer"),
  validateUpdateLawyerProfile,
  updateLawyerProfile,
);

// Get a single lawyer profile by ID
router.get("/:id", getLawyerProfileById);

// Admin: review lawyer profiles (optionally filter by verificationStatus)
router.get(
  "/admin/lawyers",
  protect,
  authorizeRoles("admin"),
  getLawyerProfilesForAdmin,
);

// Admin: verify/reject lawyer status by user id
router.patch(
  "/admin/lawyers/:userId/verification-status",
  protect,
  authorizeRoles("admin"),
  validateLawyerVerificationStatusUpdate,
  updateLawyerVerificationStatus,
);

export default router;

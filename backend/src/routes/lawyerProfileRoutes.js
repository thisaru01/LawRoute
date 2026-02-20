import express from "express";

import {
  getAllLawyerProfiles,
  getMyLawyerProfile,
  updateLawyerProfile,
} from "../controllers/lawyerProfileController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { validateUpdateLawyerProfile } from "../validations/lawyerProfileValidation.js";

const router = express.Router();

// Get all lawyer profiles with details
router.get("/", getAllLawyerProfiles);

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

export default router;

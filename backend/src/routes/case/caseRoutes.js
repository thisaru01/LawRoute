import express from "express";
import {
  getMyCases,
  getCaseById,
} from "../../controllers/case/caseController.js";
import { protect, authorizeRoles } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Get cases related to the logged-in user
router.get("/my", protect, authorizeRoles("user", "lawyer"), getMyCases);

// Get case details by id
router.get("/:id", protect, authorizeRoles("user", "lawyer"), getCaseById);

export default router;

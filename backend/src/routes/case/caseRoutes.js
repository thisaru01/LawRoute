import express from "express";
import { getMyCases } from "../../controllers/case/caseController.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Get cases related to the logged-in user
router.get("/my", protect, getMyCases);

export default router;

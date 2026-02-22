import express from "express";
import { updateMe } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Update logged-in user's basic info (including profilePhoto)
router.put("/me", protect, updateMe);

export default router;

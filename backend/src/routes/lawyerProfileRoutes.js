const express = require("express");

const router = express.Router();

const {
	getAllLawyerProfiles,
	updateLawyerProfile,
} = require("../controllers/lawyerProfileController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Get all lawyer profiles with details
router.get("/", getAllLawyerProfiles);

// Update logged-in lawyer profile
router.put("/me", protect, authorizeRoles("lawyer"), updateLawyerProfile);

module.exports = router;


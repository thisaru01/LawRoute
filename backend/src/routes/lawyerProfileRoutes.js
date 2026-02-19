const express = require("express");

const router = express.Router();

const {
	getAllLawyerProfiles,
	getMyLawyerProfile,
	updateLawyerProfile,
} = require("../controllers/lawyerProfileController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
	validateUpdateLawyerProfile,
} = require("../validations/lawyerProfileValidation");

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

module.exports = router;


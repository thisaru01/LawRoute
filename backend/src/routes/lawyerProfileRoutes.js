const express = require("express");

const router = express.Router();

const { updateLawyerProfile } = require("../controllers/lawyerProfileController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Update logged-in lawyer profile
router.put("/me", protect, authorizeRoles("lawyer"), updateLawyerProfile);

module.exports = router;


const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/profile", protect, authController.getProfile);
router.patch(
  "/lawyer/profile",
  protect,
  authorizeRoles("lawyer"),
  authController.updateLawyerProfile,
);

// Example protected route for testing
router.get("/admin-only", protect, authorizeRoles("admin"), (req, res) => {
  res.json({
    success: true,
    message: "Welcome Admin",
  });
});

module.exports = router;

import express from "express";
import * as authController from "../controllers/authController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { validateUserRegister } from "../validations/userValidation.js";

const router = express.Router();

router.post("/register", validateUserRegister, authController.register);
router.post("/login", authController.login);

// Example protected route for testing
router.get("/admin-only", protect, authorizeRoles("admin"), (req, res) => {
  res.json({
    success: true,
    message: "Welcome Admin",
  });
});

export default router;

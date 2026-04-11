import express from "express";
import { 
  getAuthorityProfiles, 
  deleteAuthority, 
  updateAuthorityPassword 
} from "../../controllers/authority/authorityController.js";
import { protect, authorizeRoles } from "../../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @route   GET /api/authority-profiles/admin
 * @desc    Get all authority profiles (Admin only)
 * @access  Private (Admin)
 */
router.get("/admin", protect, authorizeRoles("admin"), getAuthorityProfiles);

/**
 * @route   PATCH /api/authority-profiles/:id/password
 * @desc    Update an authority's password (Admin only)
 * @access  Private (Admin)
 */
router.patch("/:id/password", protect, authorizeRoles("admin"), updateAuthorityPassword);

/**
 * @route   DELETE /api/authority-profiles/:id
 * @desc    Delete an authority profile and user (Admin only)
 * @access  Private (Admin)
 */
router.delete("/:id", protect, authorizeRoles("admin"), deleteAuthority);

export default router;

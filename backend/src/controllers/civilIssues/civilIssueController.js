import * as civilIssueService from "../../services/civilIssues/civilIssueService.js";
import { cloudinary } from "../../config/cloudinary.js";

// POST /api/civil-issues
// Citizen submits a civil issue; system auto-routes it to the correct authority.
export const submitCivilIssue = async (req, res, next) => {
  try {
    const {
      category,
      subject,
      district,
      exactLocation,
      postalAreaOrZip,
      whatHappened,
      whenItHappened,
      impactOnPeople,
      contactNumber,
    } = req.body;
    // FormData sends booleans as strings, so normalise explicitly.
    const isPublic = req.body.isPublic === "true" || req.body.isPublic === true;

    // Cloudinary automatically provides the secure URLs in the `path` property of each file
    const attachments = req.files ? req.files.map((file) => file.path) : [];

    const issue = await civilIssueService.createIssue({
      reporterId: req.user._id,
      category,
      subject,
      district,
      exactLocation,
      postalAreaOrZip,
      whatHappened,
      whenItHappened,
      impactOnPeople,
      contactNumber,
      attachments,
      isPublic,
    });

    res.status(201).json({
      success: true,
      message: "Civil issue submitted and routed successfully.",
      data: issue,
    });
  } catch (error) {
    // Clean up any files already uploaded to Cloudinary to prevent orphaned assets
    if (req.files?.length > 0) {
      await Promise.allSettled(
        req.files.map((file) => cloudinary.uploader.destroy(file.filename))
      );
    }

    if (error.statusCode) {
      return res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    }
    next(error);
  }
};

// GET /api/civil-issues/my
// Citizen views their own submitted civil issues.
export const getMyCivilIssues = async (req, res, next) => {
  try {
    const issues = await civilIssueService.getIssuesByReporter(req.user._id);
    res.status(200).json({ success: true, data: issues });
  } catch (error) {
    next(error);
  }
};

// GET /api/civil-issues/assigned
// Authority views civil issues assigned to them, with optional ?district= filter.
export const getAssignedCivilIssues = async (req, res, next) => {
  try {
    const issues = await civilIssueService.getIssuesAssignedTo(
      req.user._id,
      req.query.district,
    );
    res.status(200).json({ success: true, data: issues });
  } catch (error) {
    next(error);
  }
};

// GET /api/civil-issues/:id
// Citizen or assigned authority views a single civil issue by ID.
export const getCivilIssueById = async (req, res, next) => {
  try {
    const issue = await civilIssueService.getIssueById({
      issueId: req.params.id,
      currentUserId: req.user._id,
    });
    res.status(200).json({ success: true, data: issue });
  } catch (error) {
    if (error.statusCode) {
      return res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    }
    next(error);
  }
};

// PATCH /api/civil-issues/:id
// Citizen updates their own issue fields (only while pending).
export const updateCivilIssue = async (req, res, next) => {
  try {
    const {
      subject,
      district,
      exactLocation,
      postalAreaOrZip,
      whatHappened,
      whenItHappened,
      impactOnPeople,
      contactNumber,
    } = req.body;

    const issue = await civilIssueService.updateIssue({
      issueId: req.params.id,
      reporterId: req.user._id,
      subject,
      district,
      exactLocation,
      postalAreaOrZip,
      whatHappened,
      whenItHappened,
      impactOnPeople,
      contactNumber,
    });

    res.status(200).json({
      success: true,
      message: "Civil issue updated successfully.",
      data: issue,
    });
  } catch (error) {
    if (error.statusCode) {
      return res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    }
    next(error);
  }
};

// DELETE /api/civil-issues/:id
// Citizen cancels/deletes their own civil issue.
export const deleteCivilIssue = async (req, res, next) => {
  try {
    await civilIssueService.deleteIssue({
      issueId: req.params.id,
      reporterId: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: "Civil issue deleted successfully.",
    });
  } catch (error) {
    if (error.statusCode) {
      return res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    }
    next(error);
  }
};

// PATCH /api/civil-issues/:id/status
// Authority updates the status of a civil issue assigned to them.
export const updateCivilIssueStatus = async (req, res, next) => {
  try {
    const issue = await civilIssueService.updateIssueStatus({
      issueId: req.params.id,
      authorityId: req.user._id,
      status: req.body.status,
    });

    res.status(200).json({
      success: true,
      message: "Civil issue status updated successfully.",
      data: issue,
    });
  } catch (error) {
    if (error.statusCode) {
      return res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    }
    next(error);
  }
};

// GET /api/civil-issues/public
// Returns all publicly visible civil issues. No auth required.
export const getPublicCivilIssues = async (req, res, next) => {
  try {
    const category = typeof req.query.category === "string" ? req.query.category.trim() : "";
    const district = typeof req.query.district === "string" ? req.query.district.trim() : "";
    const location = typeof req.query.location === "string" ? req.query.location.trim() : "";
    const postcode = typeof req.query.postcode === "string" ? req.query.postcode.trim() : "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await civilIssueService.getPublicIssues({
      category: category || undefined,
      district: district || undefined,
      location: location || undefined,
      postcode: postcode || undefined,
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

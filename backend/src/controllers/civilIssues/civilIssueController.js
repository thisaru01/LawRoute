import CivilIssue from "../../models/civilIssues/civilIssueModel.js";
import AuthorityProfile from "../../models/authorityProfileModel.js";

// POST /api/civil-issues
// Citizen submits a civil issue; system auto-routes it to the correct authority.
export const submitCivilIssue = async (req, res, next) => {
  try {
    const { category, district, description } = req.body;

    if (!category || !district || !description) {
      return res.status(400).json({
        success: false,
        message: "category, district, and description are required.",
      });
    }

    const authorityProfile = await AuthorityProfile.findOne({
      managedCategory: category,
    });

    if (!authorityProfile) {
      return res.status(404).json({
        success: false,
        message: "No responsible authority found for this category.",
      });
    }

    const issue = await CivilIssue.create({
      reporterId: req.user._id,
      category,
      district,
      description,
      assignedTo: authorityProfile.user,
    });

    res.status(201).json({
      success: true,
      message: "Civil issue submitted and routed successfully.",
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/civil-issues/my
// Citizen views their own submitted civil issues.
export const getMyCivilIssues = async (req, res, next) => {
  try {
    const issues = await CivilIssue.find({ reporterId: req.user._id })
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: issues });
  } catch (error) {
    next(error);
  }
};

// GET /api/civil-issues/assigned
// Authority views civil issues assigned to them, with optional ?district= filter.
export const getAssignedCivilIssues = async (req, res, next) => {
  try {
    const query = { assignedTo: req.user._id };

    if (req.query.district) {
      query.district = req.query.district;
    }

    const issues = await CivilIssue.find(query)
      .populate("reporterId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: issues });
  } catch (error) {
    next(error);
  }
};

// GET /api/civil-issues/:id
// Citizen or assigned authority views a single civil issue by ID.
export const getCivilIssueById = async (req, res, next) => {
  try {
    const issue = await CivilIssue.findById(req.params.id)
      .populate("reporterId", "name email")
      .populate("assignedTo", "name email");

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Civil issue not found.",
      });
    }

    const isReporter =
      issue.reporterId._id.toString() === req.user._id.toString();
    const isAssigned =
      issue.assignedTo &&
      issue.assignedTo._id.toString() === req.user._id.toString();

    if (!isReporter && !isAssigned) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    res.status(200).json({ success: true, data: issue });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/civil-issues/:id
// Citizen updates their own issue's description or district (only while pending).
export const updateCivilIssue = async (req, res, next) => {
  try {
    const issue = await CivilIssue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Civil issue not found.",
      });
    }

    if (issue.reporterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    if (issue.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Issue can only be edited while it is pending.",
      });
    }

    const { description, district } = req.body;

    if (!description && !district) {
      return res.status(400).json({
        success: false,
        message:
          "Provide at least one field to update: description or district.",
      });
    }

    if (description) issue.description = description;
    if (district) issue.district = district;

    await issue.save();

    res.status(200).json({
      success: true,
      message: "Civil issue updated successfully.",
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/civil-issues/:id
// Citizen cancels/deletes their own civil issue.
export const deleteCivilIssue = async (req, res, next) => {
  try {
    const issue = await CivilIssue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Civil issue not found.",
      });
    }

    if (issue.reporterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    await issue.deleteOne();

    res.status(200).json({
      success: true,
      message: "Civil issue deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

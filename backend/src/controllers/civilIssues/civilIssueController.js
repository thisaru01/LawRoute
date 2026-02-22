import * as civilIssueService from "../../services/civilIssues/civilIssueService.js";

// POST /api/civil-issues
// Citizen submits a civil issue; system auto-routes it to the correct authority.
export const submitCivilIssue = async (req, res, next) => {
  try {
    const { category, district, description } = req.body;

    const issue = await civilIssueService.createIssue({
      reporterId: req.user._id,
      category,
      district,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Civil issue submitted and routed successfully.",
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
// Citizen updates their own issue's description or district (only while pending).
export const updateCivilIssue = async (req, res, next) => {
  try {
    const { description, district } = req.body;

    const issue = await civilIssueService.updateIssue({
      issueId: req.params.id,
      reporterId: req.user._id,
      description,
      district,
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

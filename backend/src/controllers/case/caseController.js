import * as caseService from "../../services/case/caseService.js";

// Get cases for the logged-in user
export const getMyCases = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const cases = await caseService.getMyCases({
      userId: req.user._id,
      role: req.user.role,
    });

    return res.status(200).json({
      success: true,
      data: cases,
    });
  } catch (error) {
    return next(error);
  }
};

// Get case details by id
export const getCaseById = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { id } = req.params;

    const caseDoc = await caseService.getCaseById({
      caseId: id,
      currentUserId: req.user._id,
    });

    return res.status(200).json({
      success: true,
      data: caseDoc,
    });
  } catch (error) {
    return next(error);
  }
};

// Close a case (assigned lawyer)
export const closeCase = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { id } = req.params;

    const caseDoc = await caseService.closeCase({
      caseId: id,
      currentUserId: req.user._id,
    });

    return res.status(200).json({
      success: true,
      data: caseDoc,
    });
  } catch (error) {
    return next(error);
  }
};

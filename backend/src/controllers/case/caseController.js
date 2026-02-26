import * as caseService from "../../services/case/caseService.js";

// Get cases for the logged-in user (citizen or lawyer, admin sees all)
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

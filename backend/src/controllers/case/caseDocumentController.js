import * as caseDocumentsService from "../../services/case/caseDocumentsService.js";

// Upload a document for a case (associated citizen or lawyer)
export const uploadCaseDocument = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const fileUrl = req.file.path;
    const fileType = req.file.mimetype;

    const document = await caseDocumentsService.uploadCaseDocument({
      caseId: id,
      uploadedBy: req.user._id,
      fileUrl,
      fileType,
    });

    return res.status(201).json({
      success: true,
      data: document,
    });
  } catch (error) {
    return next(error);
  }
};

// Get all documents for a case (associated citizen or lawyer)
export const getCaseDocuments = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { id } = req.params;

    const documents = await caseDocumentsService.getCaseDocuments({
      caseId: id,
      currentUserId: req.user._id,
    });

    return res.status(200).json({
      success: true,
      data: documents,
    });
  } catch (error) {
    return next(error);
  }
};

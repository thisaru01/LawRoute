import * as documentService from "../../services/documents/documentService.js";

// Admin: upload PDF document
export const createDocument = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Only admins can upload documents" });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "PDF file is required" });
    }

    if (req.file.mimetype !== "application/pdf") {
      return res
        .status(400)
        .json({ success: false, message: "Only PDF files are allowed" });
    }

    const { title, description } = req.body;
    const fileUrl = req.file.path;
    const filePublicId = req.file.filename;

    const document = await documentService.createDocument({
      title,
      description,
      user: req.user,
      fileUrl,
      filePublicId,
    });

    return res.status(201).json({ success: true, document });
  } catch (err) {
    if (typeof next === "function") return next(err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

// Public: list all documents (for users to see/download)
export const getAllDocuments = async (req, res, next) => {
  try {
    const documents = await documentService.getAllDocuments();
    return res
      .status(200)
      .json({ success: true, count: documents.length, documents });
  } catch (err) {
    if (typeof next === "function") return next(err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

// Public: get a single document
export const getDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const document = await documentService.getDocumentById({ id });
    return res.status(200).json({ success: true, document });
  } catch (err) {
    if (typeof next === "function") return next(err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

// Public: redirect to Cloudinary URL for download
export const downloadDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const document = await documentService.getDocumentById({ id });

    if (!document.fileUrl) {
      return res
        .status(404)
        .json({ success: false, message: "Document file not found" });
    }

    // Proxy the remote file so we can set Content-Disposition with a proper filename
    // and ensure the browser saves it as a .pdf. This avoids changing upload middleware.
    const fileUrl = document.fileUrl;
    const { URL } = await import("url");
    const parsed = new URL(fileUrl);
    const client = parsed.protocol === "https:" ? await import("https") : await import("http");

    const request = client.get(parsed, (cloudRes) => {
      if (cloudRes.statusCode && cloudRes.statusCode >= 400) {
        return res.status(cloudRes.statusCode).end();
      }

      const contentType = cloudRes.headers["content-type"] || "application/pdf";
      res.setHeader("Content-Type", contentType);

      const safeTitle = (document.title || "document").replace(/[^a-z0-9_.-]/gi, "_");
      const filename = safeTitle.endsWith(".pdf") ? safeTitle : `${safeTitle}.pdf`;
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

      cloudRes.pipe(res);
    });

    request.on("error", (err) => {
      console.error("Error proxying document file:", err);
      return res.status(500).json({ success: false, message: "Failed to download document" });
    });
  } catch (err) {
    if (typeof next === "function") return next(err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

// Admin: delete document
export const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await documentService.deleteDocument({ id, user: req.user });
    return res.status(200).json({ success: true, message: result.message });
  } catch (err) {
    if (typeof next === "function") return next(err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

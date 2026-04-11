import { autocompleteUniversities } from "../../services/location/universityService.js";

// GET /api/location/universities?text=...
// Returns university suggestions through the backend so the browser avoids CORS.
export const getUniversityAutocomplete = async (req, res, next) => {
  try {
    const text = typeof req.query.text === "string" ? req.query.text.trim() : "";
    const limit = Number(req.query.limit) || 8;

    if (text.length < 2) {
      return res.status(200).json({ success: true, data: [] });
    }

    const result = await autocompleteUniversities({
      text,
      limit: Math.min(Math.max(limit, 1), 12),
    });

    return res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    return next(error);
  }
};
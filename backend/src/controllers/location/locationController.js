import { autocompleteSriLankaLocations } from "../../services/location/locationService.js";

// GET /api/location/autocomplete?text=...
// Returns Sri Lanka-focused location suggestions for typeahead search.
export const getLocationAutocomplete = async (req, res, next) => {
  try {
    const text = typeof req.query.text === "string" ? req.query.text.trim() : "";
    const limit = Number(req.query.limit) || 5;

    if (text.length < 2) {
      return res.status(200).json({ success: true, data: [] });
    }

    const data = await autocompleteSriLankaLocations({
      text,
      limit: Math.min(Math.max(limit, 1), 10),
    });

    return res.status(200).json({ success: true, data });
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
const VALID_CATEGORIES = [
    "land",
    "police",
    "harassment",
    "public_services",
    "other",
];

const VALID_STATUSES = ["pending", "in_progress", "resolved"];

// POST /api/civil-issues
// Validates the request body when a citizen submits a new civil issue.
export const validateSubmitCivilIssue = (req, res, next) => {
    const { category, district, description } = req.body;

    if (!category || !district || !description) {
        return res.status(400).json({
            success: false,
            message: "category, district, and description are required.",
        });
    }

    if (!VALID_CATEGORIES.includes(category)) {
        return res.status(400).json({
            success: false,
            message: `category must be one of: ${VALID_CATEGORIES.join(", ")}.`,
        });
    }

    if (typeof district !== "string" || district.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: "district must be a non-empty string.",
        });
    }

    if (typeof description !== "string" || description.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: "description must be a non-empty string.",
        });
    }

    if (description.length > 3000) {
        return res.status(400).json({
            success: false,
            message: "description must not exceed 3000 characters.",
        });
    }

    return next();
};

// PATCH /api/civil-issues/:id
// Validates the request body when a citizen updates their own civil issue.
export const validateUpdateCivilIssue = (req, res, next) => {
    const { description, district } = req.body;
    const ALLOWED_FIELDS = ["description", "district"];

    const unknownFields = Object.keys(req.body).filter(
        (key) => !ALLOWED_FIELDS.includes(key),
    );

    if (unknownFields.length > 0) {
        return res.status(400).json({
            success: false,
            message: `Unknown fields: ${unknownFields.join(", ")}. Only description and district can be updated.`,
        });
    }

    if (!description && !district) {
        return res.status(400).json({
            success: false,
            message: "Provide at least one field to update: description or district.",
        });
    }

    if (description !== undefined) {
        if (typeof description !== "string" || description.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "description must be a non-empty string.",
            });
        }

        if (description.length > 3000) {
            return res.status(400).json({
                success: false,
                message: "description must not exceed 3000 characters.",
            });
        }
    }

    if (district !== undefined) {
        if (typeof district !== "string" || district.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "district must be a non-empty string.",
            });
        }
    }

    return next();
};

// PATCH /api/civil-issues/:id/status
// Validates the request body when an authority updates the status of a civil issue.
export const validateUpdateCivilIssueStatus = (req, res, next) => {
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({
            success: false,
            message: "status is required.",
        });
    }

    if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({
            success: false,
            message: `status must be one of: ${VALID_STATUSES.join(", ")}.`,
        });
    }

    return next();
};

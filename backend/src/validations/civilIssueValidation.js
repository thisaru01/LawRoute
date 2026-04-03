import { CIVIL_ISSUE_CATEGORIES, CIVIL_ISSUE_STATUSES } from "../constants/civilIssueConstants.js";

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const isValidDateOnly = (value) => {
    if (!isNonEmptyString(value) || !DATE_ONLY_PATTERN.test(value)) {
        return false;
    }

    const parsed = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime())) {
        return false;
    }

    return parsed.toISOString().slice(0, 10) === value;
};

// POST /api/civil-issues
// Validates the request body when a citizen submits a new civil issue.
export const validateSubmitCivilIssue = (req, res, next) => {
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

    if (!category || !subject || !district) {
        return res.status(400).json({
            success: false,
            message: "category, subject, and district are required.",
        });
    }

    if (!CIVIL_ISSUE_CATEGORIES.includes(category)) {
        return res.status(400).json({
            success: false,
            message: `category must be one of: ${CIVIL_ISSUE_CATEGORIES.join(", ")}.`,
        });
    }

    if (!isNonEmptyString(subject)) {
        return res.status(400).json({
            success: false,
            message: "subject must be a non-empty string.",
        });
    }

    if (subject.length > 120) {
        return res.status(400).json({
            success: false,
            message: "subject must not exceed 120 characters.",
        });
    }

    if (!isNonEmptyString(district)) {
        return res.status(400).json({
            success: false,
            message: "district must be a non-empty string.",
        });
    }

    if (!isNonEmptyString(exactLocation)) {
        return res.status(400).json({
            success: false,
            message: "exactLocation must be a non-empty string.",
        });
    }

    if (!isNonEmptyString(postalAreaOrZip)) {
        return res.status(400).json({
            success: false,
            message: "postalAreaOrZip must be a non-empty string.",
        });
    }

    if (!isNonEmptyString(whatHappened)) {
        return res.status(400).json({
            success: false,
            message: "whatHappened must be a non-empty string.",
        });
    }

    if (!isValidDateOnly(whenItHappened)) {
        return res.status(400).json({
            success: false,
            message: "whenItHappened must be a valid date in YYYY-MM-DD format.",
        });
    }

    if (!isNonEmptyString(impactOnPeople)) {
        return res.status(400).json({
            success: false,
            message: "impactOnPeople must be a non-empty string.",
        });
    }

    if (!isNonEmptyString(contactNumber) || contactNumber.length > 20) {
        return res.status(400).json({
            success: false,
            message: "contactNumber must be a non-empty string up to 20 characters.",
        });
    }

    return next();
};

// PATCH /api/civil-issues/:id
// Validates the request body when a citizen updates their own civil issue.
export const validateUpdateCivilIssue = (req, res, next) => {
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
    const ALLOWED_FIELDS = [
        "subject",
        "district",
        "exactLocation",
        "postalAreaOrZip",
        "whatHappened",
        "whenItHappened",
        "impactOnPeople",
        "contactNumber",
    ];

    const unknownFields = Object.keys(req.body).filter(
        (key) => !ALLOWED_FIELDS.includes(key),
    );

    if (unknownFields.length > 0) {
        return res.status(400).json({
            success: false,
            message: `Unknown fields: ${unknownFields.join(", ")}. Only subject, district, exactLocation, postalAreaOrZip, whatHappened, whenItHappened, impactOnPeople and contactNumber can be updated.`,
        });
    }

    if (
        subject === undefined &&
        district === undefined &&
        exactLocation === undefined &&
        postalAreaOrZip === undefined &&
        whatHappened === undefined &&
        whenItHappened === undefined &&
        impactOnPeople === undefined &&
        contactNumber === undefined
    ) {
        return res.status(400).json({
            success: false,
            message: "Provide at least one field to update.",
        });
    }

    if (subject !== undefined) {
        if (!isNonEmptyString(subject)) {
            return res.status(400).json({
                success: false,
                message: "subject must be a non-empty string.",
            });
        }

        if (subject.length > 120) {
            return res.status(400).json({
                success: false,
                message: "subject must not exceed 120 characters.",
            });
        }
    }

    if (district !== undefined && !isNonEmptyString(district)) {
        return res.status(400).json({
            success: false,
            message: "district must be a non-empty string.",
        });
    }

    if (exactLocation !== undefined && !isNonEmptyString(exactLocation)) {
        return res.status(400).json({
            success: false,
            message: "exactLocation must be a non-empty string.",
        });
    }

    if (postalAreaOrZip !== undefined && !isNonEmptyString(postalAreaOrZip)) {
        return res.status(400).json({
            success: false,
            message: "postalAreaOrZip must be a non-empty string.",
        });
    }

    if (whatHappened !== undefined && !isNonEmptyString(whatHappened)) {
        return res.status(400).json({
            success: false,
            message: "whatHappened must be a non-empty string.",
        });
    }

    if (whenItHappened !== undefined && !isValidDateOnly(whenItHappened)) {
        return res.status(400).json({
            success: false,
            message: "whenItHappened must be a valid date in YYYY-MM-DD format.",
        });
    }

    if (impactOnPeople !== undefined && !isNonEmptyString(impactOnPeople)) {
        return res.status(400).json({
            success: false,
            message: "impactOnPeople must be a non-empty string.",
        });
    }

    if (contactNumber !== undefined && (!isNonEmptyString(contactNumber) || contactNumber.length > 20)) {
        return res.status(400).json({
            success: false,
            message: "contactNumber must be a non-empty string up to 20 characters.",
        });
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

    if (!CIVIL_ISSUE_STATUSES.includes(status)) {
        return res.status(400).json({
            success: false,
            message: `status must be one of: ${CIVIL_ISSUE_STATUSES.join(", ")}.`,
        });
    }

    return next();
};

import { CIVIL_ISSUE_CATEGORIES, CIVIL_ISSUE_STATUSES } from "../constants/civilIssueConstants.js";
import { SRI_LANKA_DISTRICTS } from "../constants/locationConstants.js";

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const POSTCODE_PATTERN = /^\d{5}$/;
const CONTACT_NUMBER_PATTERN = /^\d{10}$/;
const SUBJECT_HAS_LETTER_PATTERN = /\p{L}/u;
const SUBJECT_ALLOWED_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N}\s.,:;()'"/&%+!?-]*$/u;
const EXACT_LOCATION_ALLOWED_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N}\s.'\-/,()]*$/u;
const MIN_EXACT_LOCATION_LENGTH = 2;
const MAX_EXACT_LOCATION_LENGTH = 120;
const MAX_WHAT_HAPPENED_LENGTH = 1200;
const MAX_IMPACT_ON_PEOPLE_LENGTH = 1200;
const BUSINESS_TIME_ZONE = "Asia/Colombo";

const normalizeText = (value) => (typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "");
const isValidDistrict = (value) => SRI_LANKA_DISTRICTS.includes(normalizeText(value));
const isLowSignalSubject = (value) => {
    const compact = normalizeText(value).replace(/[\s.,:;()'"/&%+!?-]/g, "");
    return /([\p{L}\p{N}])\1{3,}/u.test(compact);
};

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

const isFutureDateOnly = (value) => {
    if (!isValidDateOnly(value)) {
        return false;
    }

    const parts = new Intl.DateTimeFormat("en", {
        timeZone: BUSINESS_TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date());

    const year = parts.find((part) => part.type === "year")?.value || "0000";
    const month = parts.find((part) => part.type === "month")?.value || "01";
    const day = parts.find((part) => part.type === "day")?.value || "01";
    const todayDateOnly = `${year}-${month}-${day}`;
    return value > todayDateOnly;
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
    const ALLOWED_FIELDS = [
        "category",
        "subject",
        "district",
        "exactLocation",
        "postalAreaOrZip",
        "whatHappened",
        "whenItHappened",
        "impactOnPeople",
        "contactNumber",
        "isPublic",
    ];

    const unknownFields = Object.keys(req.body).filter(
        (key) => !ALLOWED_FIELDS.includes(key),
    );

    if (unknownFields.length > 0) {
        return res.status(400).json({
            success: false,
            message: `Unknown fields: ${unknownFields.join(", ")}. Only category, subject, district, exactLocation, postalAreaOrZip, whatHappened, whenItHappened, impactOnPeople, contactNumber and isPublic are allowed.`,
        });
    }

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

    if (!SUBJECT_HAS_LETTER_PATTERN.test(subject.trim())) {
        return res.status(400).json({
            success: false,
            message: "subject must include at least one letter.",
        });
    }

    if (!SUBJECT_ALLOWED_PATTERN.test(normalizeText(subject))) {
        return res.status(400).json({
            success: false,
            message: "subject contains invalid characters.",
        });
    }

    if (isLowSignalSubject(subject)) {
        return res.status(400).json({
            success: false,
            message: "subject looks too repetitive. Please enter a meaningful title.",
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

    if (!isValidDistrict(district)) {
        return res.status(400).json({
            success: false,
            message: `district must be one of: ${SRI_LANKA_DISTRICTS.join(", ")}.`,
        });
    }

    if (!isNonEmptyString(exactLocation)) {
        return res.status(400).json({
            success: false,
            message: "exactLocation must be a non-empty string.",
        });
    }

    const normalizedExactLocation = normalizeText(exactLocation);
    if (normalizedExactLocation.length < MIN_EXACT_LOCATION_LENGTH) {
        return res.status(400).json({
            success: false,
            message: `exactLocation must be at least ${MIN_EXACT_LOCATION_LENGTH} characters.`,
        });
    }

    if (normalizedExactLocation.length > MAX_EXACT_LOCATION_LENGTH) {
        return res.status(400).json({
            success: false,
            message: `exactLocation must be ${MAX_EXACT_LOCATION_LENGTH} characters or fewer.`,
        });
    }

    if (!EXACT_LOCATION_ALLOWED_PATTERN.test(normalizedExactLocation)) {
        return res.status(400).json({
            success: false,
            message: "exactLocation contains invalid characters.",
        });
    }

    if (!isNonEmptyString(postalAreaOrZip) || !POSTCODE_PATTERN.test(postalAreaOrZip.trim())) {
        return res.status(400).json({
            success: false,
            message: "postalAreaOrZip must be exactly 5 digits.",
        });
    }

    if (!isNonEmptyString(whatHappened)) {
        return res.status(400).json({
            success: false,
            message: "whatHappened must be a non-empty string.",
        });
    }

    if (normalizeText(whatHappened).length > MAX_WHAT_HAPPENED_LENGTH) {
        return res.status(400).json({
            success: false,
            message: `whatHappened must be ${MAX_WHAT_HAPPENED_LENGTH} characters or fewer.`,
        });
    }

    if (!isValidDateOnly(whenItHappened)) {
        return res.status(400).json({
            success: false,
            message: "whenItHappened must be a valid date in YYYY-MM-DD format.",
        });
    }

    if (isFutureDateOnly(whenItHappened)) {
        return res.status(400).json({
            success: false,
            message: "whenItHappened cannot be a future date.",
        });
    }

    if (!isNonEmptyString(impactOnPeople)) {
        return res.status(400).json({
            success: false,
            message: "impactOnPeople must be a non-empty string.",
        });
    }

    if (normalizeText(impactOnPeople).length > MAX_IMPACT_ON_PEOPLE_LENGTH) {
        return res.status(400).json({
            success: false,
            message: `impactOnPeople must be ${MAX_IMPACT_ON_PEOPLE_LENGTH} characters or fewer.`,
        });
    }

    if (!isNonEmptyString(contactNumber) || !CONTACT_NUMBER_PATTERN.test(contactNumber.trim())) {
        return res.status(400).json({
            success: false,
            message: "contactNumber must be exactly 10 digits.",
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

        if (!SUBJECT_HAS_LETTER_PATTERN.test(subject.trim())) {
            return res.status(400).json({
                success: false,
                message: "subject must include at least one letter.",
            });
        }

        if (!SUBJECT_ALLOWED_PATTERN.test(normalizeText(subject))) {
            return res.status(400).json({
                success: false,
                message: "subject contains invalid characters.",
            });
        }

        if (isLowSignalSubject(subject)) {
            return res.status(400).json({
                success: false,
                message: "subject looks too repetitive. Please enter a meaningful title.",
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

    if (district !== undefined && !isValidDistrict(district)) {
        return res.status(400).json({
            success: false,
            message: `district must be one of: ${SRI_LANKA_DISTRICTS.join(", ")}.`,
        });
    }

    if (exactLocation !== undefined && !isNonEmptyString(exactLocation)) {
        return res.status(400).json({
            success: false,
            message: "exactLocation must be a non-empty string.",
        });
    }

    if (exactLocation !== undefined) {
        const normalizedExactLocation = normalizeText(exactLocation);

        if (normalizedExactLocation.length < MIN_EXACT_LOCATION_LENGTH) {
            return res.status(400).json({
                success: false,
                message: `exactLocation must be at least ${MIN_EXACT_LOCATION_LENGTH} characters.`,
            });
        }

        if (normalizedExactLocation.length > MAX_EXACT_LOCATION_LENGTH) {
            return res.status(400).json({
                success: false,
                message: `exactLocation must be ${MAX_EXACT_LOCATION_LENGTH} characters or fewer.`,
            });
        }

        if (!EXACT_LOCATION_ALLOWED_PATTERN.test(normalizedExactLocation)) {
            return res.status(400).json({
                success: false,
                message: "exactLocation contains invalid characters.",
            });
        }
    }

    if (
        postalAreaOrZip !== undefined
        && (!isNonEmptyString(postalAreaOrZip) || !POSTCODE_PATTERN.test(postalAreaOrZip.trim()))
    ) {
        return res.status(400).json({
            success: false,
            message: "postalAreaOrZip must be exactly 5 digits.",
        });
    }

    if (whatHappened !== undefined && !isNonEmptyString(whatHappened)) {
        return res.status(400).json({
            success: false,
            message: "whatHappened must be a non-empty string.",
        });
    }

    if (
        whatHappened !== undefined
        && normalizeText(whatHappened).length > MAX_WHAT_HAPPENED_LENGTH
    ) {
        return res.status(400).json({
            success: false,
            message: `whatHappened must be ${MAX_WHAT_HAPPENED_LENGTH} characters or fewer.`,
        });
    }

    if (whenItHappened !== undefined && !isValidDateOnly(whenItHappened)) {
        return res.status(400).json({
            success: false,
            message: "whenItHappened must be a valid date in YYYY-MM-DD format.",
        });
    }

    if (whenItHappened !== undefined && isFutureDateOnly(whenItHappened)) {
        return res.status(400).json({
            success: false,
            message: "whenItHappened cannot be a future date.",
        });
    }

    if (impactOnPeople !== undefined && !isNonEmptyString(impactOnPeople)) {
        return res.status(400).json({
            success: false,
            message: "impactOnPeople must be a non-empty string.",
        });
    }

    if (
        impactOnPeople !== undefined
        && normalizeText(impactOnPeople).length > MAX_IMPACT_ON_PEOPLE_LENGTH
    ) {
        return res.status(400).json({
            success: false,
            message: `impactOnPeople must be ${MAX_IMPACT_ON_PEOPLE_LENGTH} characters or fewer.`,
        });
    }

    if (
        contactNumber !== undefined
        && (!isNonEmptyString(contactNumber) || !CONTACT_NUMBER_PATTERN.test(contactNumber.trim()))
    ) {
        return res.status(400).json({
            success: false,
            message: "contactNumber must be exactly 10 digits.",
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
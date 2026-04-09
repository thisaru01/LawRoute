import CivilIssue from "../../models/civilIssues/civilIssueModel.js";
import AuthorityProfile from "../../models/authorityProfileModel.js";
import User from "../../models/userModel.js";
import { sendEmail } from "../email/emailService.js";
import { statusUpdateTemplate, issueUpdatedCitizenTemplate, issueSubmittedTemplate } from "../email/civilIssueEmailTemplates.js";
import { autocompleteSriLankaLocations } from "../location/locationService.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseDateOnlyToUtcDate = (value) => {
    if (!value) {
        return null;
    }

    if (value instanceof Date) {
        return value;
    }

    return new Date(`${value}T00:00:00.000Z`);
};

const normalizeText = (value) => {
    if (typeof value !== "string") {
        return value;
    }

    return value.trim().replace(/\s+/g, " ");
};

const normalizeDistrictText = (value) =>
    (typeof value === "string" ? value.trim().toLowerCase().replace(/\s+/g, " ") : "")
        .replace(/\s+district$/, "")
        .trim();

const isDistrictMatch = (districtValue, districtTarget) => {
    const district = normalizeDistrictText(districtValue);
    const target = normalizeDistrictText(districtTarget);

    if (!district || !target) {
        return false;
    }

    return district === target || district.includes(target) || target.includes(district);
};

const verifyLocationDistrictConsistency = async ({ district, exactLocation, postalAreaOrZip }) => {
    const normalizedDistrict = normalizeText(district);
    const normalizedLocation = normalizeText(exactLocation);

    if (!normalizedDistrict || !normalizedLocation) {
        return;
    }

    let result;
    try {
        result = await autocompleteSriLankaLocations({
            text: normalizedLocation,
            limit: 8,
        });
    } catch (error) {
        // Do not block submissions when external location verification is unavailable.
        return;
    }

    const suggestions = Array.isArray(result?.data) ? result.data : [];
    if (suggestions.length === 0) {
        return;
    }

    const normalizedPostcode = normalizeText(postalAreaOrZip);
    const locationAligned = suggestions.filter((item) =>
        normalizeText(item?.locationName) === normalizedLocation
    );

    const postcodeAligned = normalizedPostcode
        ? suggestions.filter((item) => normalizeText(item?.postcode) === normalizedPostcode)
        : [];

    const evidencePool = locationAligned.length > 0
        ? locationAligned
        : postcodeAligned.length > 0
            ? postcodeAligned
            : suggestions;

    const hasDistrictEvidence = evidencePool.some((item) =>
        isDistrictMatch(item?.district, normalizedDistrict)
    );

    if (!hasDistrictEvidence) {
        const error = new Error(
            `${normalizedLocation} does not appear to be in ${normalizedDistrict}. Please verify the district or choose a matching location.`
        );
        error.statusCode = 400;
        throw error;
    }
};

const formatDateOnly = (value) => {
    if (!value) {
        return "";
    }

    const parsed = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return "";
    }

    return parsed.toISOString().slice(0, 10);
};

const normalizeIssuePayload = ({
    exactLocation,
    postalAreaOrZip,
    whatHappened,
    whenItHappened,
    impactOnPeople,
    contactNumber,
}) => ({
    exactLocation: normalizeText(exactLocation) ?? "",
    postalAreaOrZip: normalizeText(postalAreaOrZip) ?? "",
    whatHappened: normalizeText(whatHappened) ?? "",
    whenItHappened: parseDateOnlyToUtcDate(whenItHappened),
    impactOnPeople: normalizeText(impactOnPeople) ?? "",
    contactNumber: normalizeText(contactNumber) ?? "",
});

// Create a new civil issue, auto-routing to the correct authority by category.
export async function createIssue({ reporterId, category, subject, district, exactLocation, postalAreaOrZip, whatHappened, whenItHappened, impactOnPeople, contactNumber, attachments = [], isPublic = false }) {
    let assignedTo;

    if (category !== "other") {
        const authorityProfile = await AuthorityProfile.findOne({
            managedCategory: category,
        });

        if (!authorityProfile) {
            const error = new Error("No responsible authority found for this category.");
            error.statusCode = 404;
            throw error;
        }

        assignedTo = authorityProfile.user;
    }

    const structuredIssue = normalizeIssuePayload({
        exactLocation,
        postalAreaOrZip,
        whatHappened,
        whenItHappened,
        impactOnPeople,
        contactNumber,
    });

    await verifyLocationDistrictConsistency({
        district,
        exactLocation: structuredIssue.exactLocation,
        postalAreaOrZip: structuredIssue.postalAreaOrZip,
    });

    const issue = await CivilIssue.create({
        reporterId,
        category,
        subject: normalizeText(subject),
        district: normalizeText(district),
        ...structuredIssue,
        attachments,
        isPublic,
        assignedTo,
    });

    // Send acknowledgement email to the citizen on successful submission.
    const reporter = await User.findById(reporterId, "email").lean();
    if (reporter?.email) {
        const { subject, html } = issueSubmittedTemplate({
            category,
            district,
            ...structuredIssue,
            whenItHappened: formatDateOnly(structuredIssue.whenItHappened),
        });
        sendEmail({ to: reporter.email, subject, html }).catch((err) =>
            console.error("[Email] Failed to send submission acknowledgement:", err.message)
        );
    }

    return issue;
}

// Get all civil issues submitted by a specific citizen.
export async function getIssuesByReporter(userId) {
    const issues = await CivilIssue.find({ reporterId: userId })
        .populate("assignedTo", "name email")
        .sort({ createdAt: -1 });

    return issues;
}

// Get all civil issues assigned to a specific authority, with optional district filter.
export async function getIssuesAssignedTo(userId, district) {
    const query = { assignedTo: userId };

    if (district) {
        query.district = district;
    }

    const issues = await CivilIssue.find(query)
        .populate("reporterId", "name email")
        .sort({ createdAt: -1 });

    return issues;
}

// Get all civil issues in the admin triage queue (shared "other" category issues).
export async function getAdminCivilIssues(status) {
    const query = { category: "other" };

    if (status) {
        query.status = status;
    }

    const issues = await CivilIssue.find(query)
        .populate("reporterId", "name email")
        .sort({ createdAt: -1 });

    return issues;
}

// Get a single civil issue by ID, ensuring the requester is the reporter or assigned authority.
export async function getIssueById({ issueId, currentUserId, currentUserRole }) {
    const issue = await CivilIssue.findById(issueId)
        .populate("reporterId", "name email")
        .populate("assignedTo", "name email");

    if (!issue) {
        const error = new Error("Civil issue not found.");
        error.statusCode = 404;
        throw error;
    }

    const isReporter =
        issue.reporterId._id.toString() === currentUserId.toString();
    const isAssigned =
        issue.assignedTo &&
        issue.assignedTo._id.toString() === currentUserId.toString();
    const isAdminForOtherIssue =
        currentUserRole === "admin" && issue.category === "other";

    if (!isReporter && !isAssigned && !isAdminForOtherIssue) {
        const error = new Error("Access denied.");
        error.statusCode = 403;
        throw error;
    }

    return issue;
}

// Update a civil issue (reporter only, pending status only).
export async function updateIssue({
    issueId,
    reporterId,
    subject,
    district,
    exactLocation,
    postalAreaOrZip,
    whatHappened,
    whenItHappened,
    impactOnPeople,
    contactNumber,
    isPublic,
}) {
    const issue = await CivilIssue.findById(issueId)
        .populate("reporterId", "name email");

    if (!issue) {
        const error = new Error("Civil issue not found.");
        error.statusCode = 404;
        throw error;
    }

    if (issue.reporterId._id.toString() !== reporterId.toString()) {
        const error = new Error("Access denied.");
        error.statusCode = 403;
        throw error;
    }

    if (issue.status !== "pending") {
        const error = new Error("Issue can only be edited while it is pending.");
        error.statusCode = 400;
        throw error;
    }

    const resolvedDistrict = district !== undefined ? normalizeText(district) : issue.district;
    const resolvedExactLocation = exactLocation !== undefined ? normalizeText(exactLocation) : issue.exactLocation;
    const resolvedPostalCode = postalAreaOrZip !== undefined ? normalizeText(postalAreaOrZip) : issue.postalAreaOrZip;

    if (district !== undefined || exactLocation !== undefined || postalAreaOrZip !== undefined) {
        await verifyLocationDistrictConsistency({
            district: resolvedDistrict,
            exactLocation: resolvedExactLocation,
            postalAreaOrZip: resolvedPostalCode,
        });
    }

    if (subject !== undefined) issue.subject = normalizeText(subject);
    if (district !== undefined) issue.district = normalizeText(district);
    if (exactLocation !== undefined) issue.exactLocation = normalizeText(exactLocation);
    if (postalAreaOrZip !== undefined) issue.postalAreaOrZip = normalizeText(postalAreaOrZip);
    if (whatHappened !== undefined) issue.whatHappened = normalizeText(whatHappened);
    if (whenItHappened !== undefined) issue.whenItHappened = parseDateOnlyToUtcDate(whenItHappened);
    if (impactOnPeople !== undefined) issue.impactOnPeople = normalizeText(impactOnPeople);
    if (contactNumber !== undefined) issue.contactNumber = normalizeText(contactNumber);
    if (isPublic !== undefined) issue.isPublic = isPublic;

    await issue.save();

    // Notify the reporter that their issue was updated successfully.
    if (issue.reporterId?.email) {
        const { subject, html } = issueUpdatedCitizenTemplate({
            category: issue.category,
            district: issue.district,
            exactLocation: issue.exactLocation,
            postalAreaOrZip: issue.postalAreaOrZip,
            whatHappened: issue.whatHappened,
            whenItHappened: formatDateOnly(issue.whenItHappened),
            impactOnPeople: issue.impactOnPeople,
            contactNumber: issue.contactNumber,
        });

        sendEmail({ to: issue.reporterId.email, subject, html }).catch((err) =>
            console.error("[Email] Failed to send issue update confirmation:", err.message)
        );
    }

    return issue;
}

// Delete a civil issue (reporter only).
export async function deleteIssue({ issueId, reporterId }) {
    const issue = await CivilIssue.findById(issueId);

    if (!issue) {
        const error = new Error("Civil issue not found.");
        error.statusCode = 404;
        throw error;
    }

    if (issue.reporterId.toString() !== reporterId.toString()) {
        const error = new Error("Access denied.");
        error.statusCode = 403;
        throw error;
    }

    await issue.deleteOne();
}

// Update the status of a civil issue (assigned authority only).
export async function updateIssueStatus({
    issueId,
    authorityId,
    actorRole,
    status,
    note,
    resolutionSummary,
}) {
    const issue = await CivilIssue.findById(issueId)
        .populate("reporterId", "name email");

    if (!issue) {
        const error = new Error("Civil issue not found.");
        error.statusCode = 404;
        throw error;
    }

    const isAssignedAuthority =
        issue.assignedTo &&
        issue.assignedTo.toString() === authorityId.toString();
    const isAdminForOtherIssue =
        actorRole === "admin" && issue.category === "other";

    if (!isAssignedAuthority && !isAdminForOtherIssue) {
        const error = new Error(
            "Access denied. You are not assigned to this issue.",
        );
        error.statusCode = 403;
        throw error;
    }

    if (issue.status === status) {
        const error = new Error("Issue is already in the requested status.");
        error.statusCode = 400;
        throw error;
    }

    const oldStatus = issue.status;
    const normalizedNote = normalizeText(note) ?? "";
    const normalizedResolutionSummary = normalizeText(resolutionSummary) ?? "";

    issue.status = status;
    if (status === "resolved") {
        issue.resolutionSummary = normalizedResolutionSummary;
    } else {
        issue.resolutionSummary = "";
    }
    issue.statusHistory.push({
        fromStatus: oldStatus,
        toStatus: status,
        note: normalizedNote,
        resolutionSummary: normalizedResolutionSummary,
        updatedBy: authorityId,
        updatedAt: new Date(),
    });
    await issue.save();

    // Non-blocking email notification — a mail failure must never fail the API response.
    if (issue.reporterId?.email) {
        const { subject, html } = statusUpdateTemplate({
            category: issue.category,
            district: issue.district,
            oldStatus,
            newStatus: status,
            note: normalizedNote,
            resolutionSummary: normalizedResolutionSummary,
        });

        sendEmail({ to: issue.reporterId.email, subject, html }).catch((err) =>
            console.error("[Email] Failed to send status update email:", err.message)
        );
    }

    return issue;
}

// Reject a civil issue (assigned authority for normal categories, admin for "other").
export async function rejectIssue({ issueId, actorId, actorRole, note }) {
    const issue = await CivilIssue.findById(issueId)
        .populate("reporterId", "name email");

    if (!issue) {
        const error = new Error("Civil issue not found.");
        error.statusCode = 404;
        throw error;
    }

    const isAssignedAuthority =
        issue.assignedTo &&
        issue.assignedTo.toString() === actorId.toString();
    const isAdminForOtherIssue =
        actorRole === "admin" && issue.category === "other";

    if (!isAssignedAuthority && !isAdminForOtherIssue) {
        const error = new Error("Access denied. You cannot reject this issue.");
        error.statusCode = 403;
        throw error;
    }

    if (issue.status === "rejected") {
        const error = new Error("Issue is already rejected.");
        error.statusCode = 400;
        throw error;
    }

    const oldStatus = issue.status;
    const normalizedNote = normalizeText(note) ?? "";

    issue.status = "rejected";
    issue.resolutionSummary = "";
    issue.statusHistory.push({
        fromStatus: oldStatus,
        toStatus: "rejected",
        note: normalizedNote,
        resolutionSummary: "",
        updatedBy: actorId,
        updatedAt: new Date(),
    });
    await issue.save();

    if (issue.reporterId?.email) {
        const { subject, html } = statusUpdateTemplate({
            category: issue.category,
            district: issue.district,
            oldStatus,
            newStatus: "rejected",
            note: normalizedNote,
            resolutionSummary: "",
        });

        sendEmail({ to: issue.reporterId.email, subject, html }).catch((err) =>
            console.error("[Email] Failed to send rejection email:", err.message)
        );
    }

    return issue;
}

// Get all publicly visible civil issues (no auth required).
// Reporter identity is intentionally excluded to preserve anonymity.
export async function getPublicIssues({ category, district, location, postcode, page = 1, limit = 10 }) {
    const baseQuery = { isPublic: true };

    if (category) {
        baseQuery.category = category;
    }

    if (district) {
        baseQuery.district = district;
    }

    const selectedFields = "category subject district exactLocation postalAreaOrZip whatHappened whenItHappened impactOnPeople status createdAt";

    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
    const skip = (safePage - 1) * safeLimit;

    let effectiveQuery = { ...baseQuery };

    if (postcode) {
        const postcodeQuery = {
            ...baseQuery,
            postalAreaOrZip: { $regex: new RegExp(escapeRegex(postcode), "i") },
        };

        const postcodeCount = await CivilIssue.countDocuments(postcodeQuery);

        if (postcodeCount > 0 || !location) {
            effectiveQuery = postcodeQuery;
        } else {
            effectiveQuery = {
                ...baseQuery,
                exactLocation: { $regex: new RegExp(escapeRegex(location), "i") },
            };
        }
    } else if (location) {
        effectiveQuery = {
            ...baseQuery,
            exactLocation: { $regex: new RegExp(escapeRegex(location), "i") },
        };
    }

    const total = await CivilIssue.countDocuments(effectiveQuery);
    const items = await CivilIssue.find(effectiveQuery)
        .select(selectedFields)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit);

    const totalPages = total > 0 ? Math.ceil(total / safeLimit) : 0;

    return {
        items,
        pagination: {
            page: safePage,
            limit: safeLimit,
            total,
            totalPages,
            hasNextPage: safePage < totalPages,
        },
    };
}

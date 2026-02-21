import CivilIssue from "../models/civilIssues/civilIssueModel.js";
import AuthorityProfile from "../models/authorityProfileModel.js";

// Create a new civil issue, auto-routing to the correct authority by category.
export async function createIssue({ reporterId, category, district, description }) {
    const authorityProfile = await AuthorityProfile.findOne({
        managedCategory: category,
    });

    if (!authorityProfile) {
        const error = new Error("No responsible authority found for this category.");
        error.statusCode = 404;
        throw error;
    }

    const issue = await CivilIssue.create({
        reporterId,
        category,
        district,
        description,
        assignedTo: authorityProfile.user,
    });

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

// Get a single civil issue by ID, ensuring the requester is the reporter or assigned authority.
export async function getIssueById({ issueId, currentUserId }) {
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

    if (!isReporter && !isAssigned) {
        const error = new Error("Access denied.");
        error.statusCode = 403;
        throw error;
    }

    return issue;
}

// Update a civil issue's description or district (reporter only, pending status only).
export async function updateIssue({ issueId, reporterId, description, district }) {
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

    if (issue.status !== "pending") {
        const error = new Error("Issue can only be edited while it is pending.");
        error.statusCode = 400;
        throw error;
    }

    if (description) issue.description = description;
    if (district) issue.district = district;

    await issue.save();

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
export async function updateIssueStatus({ issueId, authorityId, status }) {
    const issue = await CivilIssue.findById(issueId);

    if (!issue) {
        const error = new Error("Civil issue not found.");
        error.statusCode = 404;
        throw error;
    }

    if (
        !issue.assignedTo ||
        issue.assignedTo.toString() !== authorityId.toString()
    ) {
        const error = new Error(
            "Access denied. You are not assigned to this issue.",
        );
        error.statusCode = 403;
        throw error;
    }

    issue.status = status;
    await issue.save();

    return issue;
}

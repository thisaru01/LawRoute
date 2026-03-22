import CivilIssue from "../../models/civilIssues/civilIssueModel.js";
import AuthorityProfile from "../../models/authorityProfileModel.js";
import User from "../../models/userModel.js";
import { sendEmail } from "../email/emailService.js";
import { statusUpdateTemplate, issueUpdatedCitizenTemplate, issueSubmittedTemplate } from "../email/civilIssueEmailTemplates.js";

// Create a new civil issue, auto-routing to the correct authority by category.
export async function createIssue({ reporterId, category, district, description, attachments = [] }) {
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
        attachments,
        assignedTo: authorityProfile.user,
    });

    // Send acknowledgement email to the citizen on successful submission.
    const reporter = await User.findById(reporterId, "email").lean();
    if (reporter?.email) {
        const { subject, html } = issueSubmittedTemplate({ category, district, description });
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

    if (description) issue.description = description;
    if (district) issue.district = district;

    await issue.save();

    // Notify the reporter that their issue was updated successfully.
    if (issue.reporterId?.email) {
        const { subject, html } = issueUpdatedCitizenTemplate({
            category: issue.category,
            district: issue.district,
            description: issue.description,
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
export async function updateIssueStatus({ issueId, authorityId, status }) {
    const issue = await CivilIssue.findById(issueId)
        .populate("reporterId", "name email");

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

    const oldStatus = issue.status;
    issue.status = status;
    await issue.save();

    // Non-blocking email notification — a mail failure must never fail the API response.
    if (issue.reporterId?.email) {
        const { subject, html } = statusUpdateTemplate({
            category: issue.category,
            district: issue.district,
            oldStatus,
            newStatus: status,
        });

        sendEmail({ to: issue.reporterId.email, subject, html }).catch((err) =>
            console.error("[Email] Failed to send status update email:", err.message)
        );
    }

    return issue;
}

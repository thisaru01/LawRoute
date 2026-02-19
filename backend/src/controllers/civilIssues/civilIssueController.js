const CivilIssue = require("../../models/civilIssues/civilIssueModel");
const AuthorityProfile = require("../../models/authorityProfileModel");

// POST /api/civil-issues
// Citizen submits a civil issue; system auto-routes it to the correct authority.
exports.submitCivilIssue = async (req, res, next) => {
    try {
        const { category, district, description } = req.body;

        if (!category || !district || !description) {
            return res.status(400).json({
                success: false,
                message: "category, district, and description are required.",
            });
        }

        const authorityProfile = await AuthorityProfile.findOne({ managedCategory: category });

        if (!authorityProfile) {
            return res.status(404).json({
                success: false,
                message: "No responsible authority found for this category.",
            });
        }

        const issue = await CivilIssue.create({
            reporterId: req.user._id,
            category,
            district,
            description,
            assignedTo: authorityProfile.user,
        });

        res.status(201).json({
            success: true,
            message: "Civil issue submitted and routed successfully.",
            data: issue,
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/civil-issues/my
// Citizen views their own submitted civil issues.
exports.getMyCivilIssues = async (req, res, next) => {
    try {
        const issues = await CivilIssue.find({ reporterId: req.user._id })
            .populate("assignedTo", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: issues });
    } catch (error) {
        next(error);
    }
};

// GET /api/civil-issues/assigned
// Authority views civil issues assigned to them, with optional ?district= filter.
exports.getAssignedCivilIssues = async (req, res, next) => {
    try {
        const query = { assignedTo: req.user._id };

        if (req.query.district) {
            query.district = req.query.district;
        }

        const issues = await CivilIssue.find(query)
            .populate("reporterId", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: issues });
    } catch (error) {
        next(error);
    }
};

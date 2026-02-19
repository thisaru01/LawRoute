const mongoose = require("mongoose");

const { Schema } = mongoose;

const CATEGORIES = ["land", "police", "harassment", "public_services", "other"];

const civilIssueSchema = new Schema(
    {
        reporterId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        category: {
            type: String,
            enum: CATEGORIES,
            required: true,
        },
        district: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 3000,
        },
        assignedTo: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        status: {
            type: String,
            enum: ["pending", "in_progress", "resolved"],
            default: "pending",
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model("CivilIssue", civilIssueSchema);

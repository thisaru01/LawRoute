import mongoose from "mongoose";
import { CIVIL_ISSUE_CATEGORIES, CIVIL_ISSUE_STATUSES } from "../../constants/civilIssueConstants.js";

const { Schema } = mongoose;

const civilIssueSchema = new Schema(
  {
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      enum: CIVIL_ISSUE_CATEGORIES,
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
      enum: CIVIL_ISSUE_STATUSES,
      default: "pending",
    },
    attachments: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);

export default mongoose.model("CivilIssue", civilIssueSchema);

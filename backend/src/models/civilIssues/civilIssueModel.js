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
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    district: {
      type: String,
      required: true,
      trim: true,
    },
    exactLocation: {
      type: String,
      trim: true,
      default: "",
    },
    postalAreaOrZip: {
      type: String,
      trim: true,
      default: "",
    },
    whatHappened: {
      type: String,
      trim: true,
      default: "",
    },
    whenItHappened: {
      type: Date,
      default: null,
    },
    impactOnPeople: {
      type: String,
      trim: true,
      default: "",
    },
    contactNumber: {
      type: String,
      trim: true,
      default: "",
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
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model("CivilIssue", civilIssueSchema);

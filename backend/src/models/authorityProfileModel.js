import mongoose from "mongoose";
import { CIVIL_ISSUE_CATEGORIES } from "../constants/civilIssueConstants.js";

const { Schema } = mongoose;

const authorityProfileSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    managedCategory: {
      type: String,
      enum: CIVIL_ISSUE_CATEGORIES,
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("AuthorityProfile", authorityProfileSchema);

import mongoose from "mongoose";

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
      enum: ["land", "police", "harassment", "public_services", "other"],
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("AuthorityProfile", authorityProfileSchema);

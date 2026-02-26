import mongoose from "mongoose";

const { Schema } = mongoose;

const CaseSchema = new Schema(
  {
    consultationRequest: {
      type: Schema.Types.ObjectId,
      ref: "ConsultationRequest",
      required: true,
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lawyer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    summary: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Case", CaseSchema);

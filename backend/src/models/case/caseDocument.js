import mongoose from "mongoose";

const { Schema } = mongoose;

const CaseDocumentSchema = new Schema(
  {
    caseId: {
      type: Schema.Types.ObjectId,
      ref: "Case",
      required: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("CaseDocument", CaseDocumentSchema);

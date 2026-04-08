import mongoose from "mongoose";

const { Schema } = mongoose;

const DocumentSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  fileUrl: { type: String, required: true },
  filePublicId: { type: String, required: true },
  fileType: { type: String },
  thumbnailUrl: { type: String },
  uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Document", DocumentSchema);

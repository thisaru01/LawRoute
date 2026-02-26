import mongoose from "mongoose";

const { Schema } = mongoose;

const ConsultationRequestSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  lawyer: { type: Schema.Types.ObjectId, ref: "User", required: true },
  summary: { type: String, required: true, trim: true, maxlength: 2000 },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ConsultationRequestSchema.pre("save", function () {
  this.updatedAt = Date.now();
});

export default mongoose.model("ConsultationRequest", ConsultationRequestSchema);

import mongoose from "mongoose";

const { Schema } = mongoose;

const ArticleSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  authorRole: { type: String, enum: ["admin", "lawyer"], required: true },
  status: {
    type: String,
    enum: ["pending", "published", "rejected", "archived"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ArticleSchema.pre("save", function () {
  this.updatedAt = Date.now();
});

export default mongoose.model("Article", ArticleSchema);

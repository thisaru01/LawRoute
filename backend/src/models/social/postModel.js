import mongoose from "mongoose";

const { Schema } = mongoose;

export const POST_TYPES = [
  "legal_awareness",
  "achievement_announcement",
  "event_participation",
  "legal_advice_article",
  "social_justice_work",
];

const postSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    postType: {
      type: String,
      enum: POST_TYPES,
      required: true,
    },
    content: {
      type: String,
      trim: true,
      required: true,
      maxlength: 5000,
    },
    visibility: {
      type: String,
      enum: ["public", "followers", "private"],
      default: "public",
    },
    tags: {
      type: [String],
      default: [],
    },
    stats: {
      likeCount: { type: Number, default: 0, min: 0 },
      commentCount: { type: Number, default: 0, min: 0 },
      shareCount: { type: Number, default: 0, min: 0 },
    },
  },
  { timestamps: true },
);

postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });

export default mongoose.model("Post", postSchema);

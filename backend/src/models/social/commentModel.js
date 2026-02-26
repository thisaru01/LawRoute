import mongoose from "mongoose";

const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    content: {
      type: String,
      trim: true,
      required: true,
      maxlength: 2000,
    },
  },
  { timestamps: true },
);

commentSchema.index({ post: 1, createdAt: -1 });

export default mongoose.model("Comment", commentSchema);

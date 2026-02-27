import mongoose from "mongoose";

const { Schema } = mongoose;

const postLikeSchema = new Schema(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

postLikeSchema.index({ post: 1, user: 1 }, { unique: true });
postLikeSchema.index({ post: 1, createdAt: -1 });

export default mongoose.model("PostLike", postLikeSchema);

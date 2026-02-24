import {
  createPostByLawyer,
  findFeedPosts,
} from "../../services/social/postService.js";

export const createPost = async (req, res, next) => {
  try {
    const post = await createPostByLawyer(req.user, req.body);

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    return next(error);
  }
};

export const getPublicFeed = async (req, res, next) => {
  try {
    const limit = req.query.limit;
    const cursor = req.query.cursor;
    const visibility = req.query.visibility || "public";

    const posts = await findFeedPosts({ limit, cursor, visibility });

    const nextCursor =
      posts.length > 0 ? posts[posts.length - 1].createdAt : null;

    return res.status(200).json({
      success: true,
      count: posts.length,
      nextCursor,
      posts,
    });
  } catch (error) {
    return next(error);
  }
};

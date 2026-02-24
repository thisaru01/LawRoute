import {
  createPostByLawyer,
  findMyPosts,
  findPublicPosts,
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
    const limit = Number(req.query.limit) || 20;
    const cursor = req.query.cursor;

    const posts = await findPublicPosts({ limit, cursor });

    return res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    return next(error);
  }
};

export const getMyPosts = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 20;
    const cursor = req.query.cursor;

    const posts = await findMyPosts(req.user, { limit, cursor });

    return res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    return next(error);
  }
};

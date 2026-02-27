import {
  createPostByLawyer,
  deletePostByLawyer,
  findFeedPosts,
  findFeedPostsForLoggedUser,
  findMyPosts,
  findPostsByLawyer,
  updatePostByLawyer,
} from "../../services/social/postService.js";

// Read pagination query values with safe defaults. 
const readPagination = (req) => ({
  limit: Number(req.query.limit) || 20,
  cursor: req.query.cursor,
});

// Create a new post for the authenticated lawyer. 
export const createPost = async (req, res, next) => {
  try {
    const post = await createPostByLawyer(req.user, req.body, req.files);

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    return next(error);
  }
};

// Return posts authored by the authenticated lawyer.
export const getMyPosts = async (req, res, next) => {
  try {
    const posts = await findMyPosts(req.user, readPagination(req));

    return res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    return next(error);
  }
};

// Return the public social feed.
export const getFeed = async (req, res, next) => {
  try {
    const posts = await findFeedPosts(readPagination(req));

    return res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    return next(error);
  }
};

// Return personalized feed for logged users. 
export const getFeedForLoggedUser = async (req, res, next) => {
  try {
    const posts = await findFeedPostsForLoggedUser(req.user, readPagination(req));

    return res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    return next(error);
  }
};

// Return public posts of a single lawyer profile. 
export const getLawyerPosts = async (req, res, next) => {
  try {
    const posts = await findPostsByLawyer(req.params.lawyerId, readPagination(req));

    return res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    return next(error);
  }
};

// Update a post owned by the authenticated lawyer. 
export const updatePost = async (req, res, next) => {
  try {
    const post = await updatePostByLawyer(
      req.user,
      req.params.id,
      req.body,
      req.files,
    );

    return res.status(200).json({
      success: true,
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    return next(error);
  }
};

// Delete a post owned by the authenticated lawyer. 
export const deletePost = async (req, res, next) => {
  try {
    await deletePostByLawyer(req.user, req.params.id);

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

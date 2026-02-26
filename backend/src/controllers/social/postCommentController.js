import {
  createCommentByUser,
  deleteCommentByUser,
  findCommentsByPost,
} from "../../services/social/postCommentService.js";

const readPagination = (req) => ({
  limit: Number(req.query.limit) || 20,
  cursor: req.query.cursor,
});

export const createComment = async (req, res, next) => {
  try {
    const comment = await createCommentByUser(req.user, req.params.id, req.body);

    return res.status(201).json({
      success: true,
      message: "Comment created successfully",
      comment,
    });
  } catch (error) {
    return next(error);
  }
};

export const getPostComments = async (req, res, next) => {
  try {
    const comments = await findCommentsByPost(req.params.id, readPagination(req));

    return res.status(200).json({
      success: true,
      count: comments.length,
      comments,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    await deleteCommentByUser(req.user, req.params.commentId);

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

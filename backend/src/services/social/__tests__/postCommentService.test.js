import { jest } from "@jest/globals";
import mongoose from "mongoose";

import Post from "../../../models/social/postModel.js";
import Comment from "../../../models/social/commentModel.js";
import {
  createCommentByUser,
  findCommentsByPost,
  deleteCommentByUser,
} from "../postCommentService.js";

const USER_ID = "507f1f77bcf86cd799439011";
const OTHER_USER_ID = "507f1f77bcf86cd799439012";
const POST_ID = "507f1f77bcf86cd799439013";
const COMMENT_ID = "507f1f77bcf86cd799439014";

const mockPostSelect = (postDoc) => ({
  select: jest.fn().mockResolvedValue(postDoc),
});

const mockCommentFindByIdPopulateLean = (commentDoc) => ({
  populate: jest.fn().mockReturnValue({
    lean: jest.fn().mockResolvedValue(commentDoc),
  }),
});

const mockCommentFindChain = (rows) => ({
  populate: jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({
      limit: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(rows),
      }),
    }),
  }),
});

describe("postCommentService", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe("createCommentByUser", () => {
    it("throws 401 when auth user is missing", async () => {
      await expect(createCommentByUser(null, POST_ID, { content: "hello" })).rejects.toMatchObject({
        statusCode: 401,
        message: "Unauthorized",
      });
    });

    it("throws 400 when post id is invalid", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(false);

      await expect(createCommentByUser({ _id: USER_ID }, "bad-id", { content: "hello" })).rejects.toMatchObject({
        statusCode: 400,
        message: "Invalid post id",
      });
    });

    it("throws 404 when post does not exist", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      jest.spyOn(Post, "findById").mockReturnValue(mockPostSelect(null));

      await expect(createCommentByUser({ _id: USER_ID }, POST_ID, { content: "hello" })).rejects.toMatchObject({
        statusCode: 404,
        message: "Post not found",
      });
    });

    it("creates comment, increments count, and returns populated comment", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      jest.spyOn(Post, "findById").mockReturnValue(mockPostSelect({ _id: POST_ID }));
      jest.spyOn(Comment, "create").mockResolvedValue({ _id: COMMENT_ID });
      const updateSpy = jest.spyOn(Post, "updateOne").mockResolvedValue({ modifiedCount: 1 });
      jest.spyOn(Comment, "findById").mockReturnValue(
        mockCommentFindByIdPopulateLean({
          _id: COMMENT_ID,
          post: POST_ID,
          content: "hello",
          author: { _id: USER_ID, name: "User" },
        }),
      );

      const res = await createCommentByUser(
        { _id: USER_ID },
        POST_ID,
        { content: "hello" },
      );

      expect(Comment.create).toHaveBeenCalledWith({
        post: POST_ID,
        author: USER_ID,
        content: "hello",
      });
      expect(updateSpy).toHaveBeenCalledWith(
        { _id: POST_ID },
        { $inc: { "stats.commentCount": 1 } },
      );
      expect(res).toMatchObject({ _id: COMMENT_ID, content: "hello" });
    });
  });

  describe("findCommentsByPost", () => {
    it("throws 400 when post id is invalid", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(false);

      await expect(findCommentsByPost("bad-id")).rejects.toMatchObject({
        statusCode: 400,
        message: "Invalid post id",
      });
    });

    it("throws 404 when post does not exist", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      jest.spyOn(Post, "findById").mockReturnValue(mockPostSelect(null));

      await expect(findCommentsByPost(POST_ID)).rejects.toMatchObject({
        statusCode: 404,
        message: "Post not found",
      });
    });

    it("uses default limit 20 for invalid input", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      jest.spyOn(Post, "findById").mockReturnValue(mockPostSelect({ _id: POST_ID }));

      const limitSpy = jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
      jest.spyOn(Comment, "find").mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: limitSpy,
          }),
        }),
      });

      await findCommentsByPost(POST_ID, { limit: "abc" });

      expect(limitSpy).toHaveBeenCalledWith(20);
    });

    it("clamps limit to 50", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      jest.spyOn(Post, "findById").mockReturnValue(mockPostSelect({ _id: POST_ID }));

      const limitSpy = jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
      jest.spyOn(Comment, "find").mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: limitSpy,
          }),
        }),
      });

      await findCommentsByPost(POST_ID, { limit: 999 });

      expect(limitSpy).toHaveBeenCalledWith(50);
    });

    it("throws 400 for invalid cursor", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      jest.spyOn(Post, "findById").mockReturnValue(mockPostSelect({ _id: POST_ID }));

      await expect(
        findCommentsByPost(POST_ID, { cursor: "not-a-date" }),
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "Invalid cursor",
      });
    });

    it("applies cursor and returns comments", async () => {
      const rows = [{ _id: COMMENT_ID, content: "c1" }];
      const cursor = "2026-02-01T00:00:00.000Z";

      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      jest.spyOn(Post, "findById").mockReturnValue(mockPostSelect({ _id: POST_ID }));
      jest.spyOn(Comment, "find").mockReturnValue(mockCommentFindChain(rows));

      const res = await findCommentsByPost(POST_ID, { cursor, limit: 10 });

      expect(Comment.find).toHaveBeenCalledWith({
        post: POST_ID,
        createdAt: { $lt: new Date(cursor) },
      });
      expect(res).toBe(rows);
    });
  });

  describe("deleteCommentByUser", () => {
    it("throws 401 when auth user is missing", async () => {
      await expect(deleteCommentByUser(null, COMMENT_ID)).rejects.toMatchObject({
        statusCode: 401,
        message: "Unauthorized",
      });
    });

    it("throws 400 when comment id is invalid", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(false);

      await expect(deleteCommentByUser({ _id: USER_ID }, "bad-id")).rejects.toMatchObject({
        statusCode: 400,
        message: "Invalid comment id",
      });
    });

    it("throws 404 when comment does not exist", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      jest.spyOn(Comment, "findById").mockResolvedValue(null);

      await expect(deleteCommentByUser({ _id: USER_ID }, COMMENT_ID)).rejects.toMatchObject({
        statusCode: 404,
        message: "Comment not found",
      });
    });

    it("throws 403 when user does not own comment", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      jest.spyOn(Comment, "findById").mockResolvedValue({
        _id: COMMENT_ID,
        post: POST_ID,
        author: { toString: () => OTHER_USER_ID },
      });

      await expect(deleteCommentByUser({ _id: USER_ID }, COMMENT_ID)).rejects.toMatchObject({
        statusCode: 403,
        message: "Access denied. You can only delete your own comments",
      });
    });

    it("deletes comment and decrements post stats", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      jest.spyOn(Comment, "findById").mockResolvedValue({
        _id: COMMENT_ID,
        post: POST_ID,
        author: { toString: () => USER_ID },
      });
      const deleteSpy = jest.spyOn(Comment, "deleteOne").mockResolvedValue({ deletedCount: 1 });
      const updateSpy = jest.spyOn(Post, "updateOne").mockResolvedValue({ modifiedCount: 1 });

      await expect(deleteCommentByUser({ _id: USER_ID }, COMMENT_ID)).resolves.toBeUndefined();

      expect(deleteSpy).toHaveBeenCalledWith({ _id: COMMENT_ID });
      expect(updateSpy).toHaveBeenCalledWith(
        { _id: POST_ID, "stats.commentCount": { $gt: 0 } },
        { $inc: { "stats.commentCount": -1 } },
      );
    });
  });
});

import { jest } from "@jest/globals";
import mongoose from "mongoose";

import Post from "../../../models/social/postModel.js";
import PostLike from "../../../models/social/postLikeModel.js";
import { likePostByUser, unlikePostByUser } from "../postLikeService.js";

const USER_ID = "507f1f77bcf86cd799439011";
const POST_ID = "507f1f77bcf86cd799439012";

const mockFindByIdSelectDoc = (doc) => ({
  select: jest.fn().mockResolvedValue(doc),
});

const mockFindByIdSelectLean = (doc) => ({
  select: jest.fn().mockReturnValue({
    lean: jest.fn().mockResolvedValue(doc),
  }),
});

describe("postLikeService", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe("likePostByUser", () => {
    it("throws 401 when auth user is missing", async () => {
      await expect(likePostByUser(null, POST_ID)).rejects.toMatchObject({
        statusCode: 401,
        message: "Unauthorized",
      });
    });

    it("throws 400 for invalid post id", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(false);

      await expect(likePostByUser({ _id: USER_ID }, "bad-id")).rejects.toMatchObject({
        statusCode: 400,
        message: "Invalid post id",
      });
    });

    it("throws 404 when target post does not exist", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      jest.spyOn(Post, "findById").mockReturnValue(mockFindByIdSelectDoc(null));

      await expect(likePostByUser({ _id: USER_ID }, POST_ID)).rejects.toMatchObject({
        statusCode: 404,
        message: "Post not found",
      });
    });

    it("increments likeCount when a new like is inserted", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      jest
        .spyOn(Post, "findById")
        .mockReturnValueOnce(mockFindByIdSelectDoc({ _id: POST_ID, stats: { likeCount: 2 } }))
        .mockReturnValueOnce(mockFindByIdSelectLean({ _id: POST_ID, stats: { likeCount: 3 } }));
      jest.spyOn(PostLike, "updateOne").mockResolvedValue({ upsertedCount: 1 });
      const postUpdateSpy = jest.spyOn(Post, "updateOne").mockResolvedValue({ modifiedCount: 1 });

      const res = await likePostByUser({ _id: USER_ID }, POST_ID);

      expect(PostLike.updateOne).toHaveBeenCalledWith(
        { post: POST_ID, user: USER_ID },
        { $setOnInsert: { post: POST_ID, user: USER_ID } },
        { upsert: true },
      );
      expect(postUpdateSpy).toHaveBeenCalledWith(
        { _id: POST_ID },
        { $inc: { "stats.likeCount": 1 } },
      );
      expect(res).toEqual({
        postId: POST_ID,
        liked: true,
        likeCount: 3,
      });
    });

    it("does not increment likeCount when like already exists", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      jest
        .spyOn(Post, "findById")
        .mockReturnValueOnce(mockFindByIdSelectDoc({ _id: POST_ID, stats: { likeCount: 5 } }))
        .mockReturnValueOnce(mockFindByIdSelectLean({ _id: POST_ID, stats: { likeCount: 5 } }));
      jest.spyOn(PostLike, "updateOne").mockResolvedValue({ upsertedCount: 0 });
      const postUpdateSpy = jest.spyOn(Post, "updateOne").mockResolvedValue({ modifiedCount: 0 });

      const res = await likePostByUser({ _id: USER_ID }, POST_ID);

      expect(postUpdateSpy).not.toHaveBeenCalled();
      expect(res.likeCount).toBe(5);
      expect(res.liked).toBe(true);
    });

    it("swallows duplicate-key race errors and returns latest count", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      jest
        .spyOn(Post, "findById")
        .mockReturnValueOnce(mockFindByIdSelectDoc({ _id: POST_ID, stats: { likeCount: 7 } }))
        .mockReturnValueOnce(mockFindByIdSelectLean({ _id: POST_ID, stats: { likeCount: 7 } }));

      const duplicateError = new Error("duplicate key");
      duplicateError.code = 11000;
      jest.spyOn(PostLike, "updateOne").mockRejectedValue(duplicateError);
      const postUpdateSpy = jest.spyOn(Post, "updateOne").mockResolvedValue({ modifiedCount: 0 });

      const res = await likePostByUser({ _id: USER_ID }, POST_ID);

      expect(postUpdateSpy).not.toHaveBeenCalled();
      expect(res).toEqual({ postId: POST_ID, liked: true, likeCount: 7 });
    });

    it("rethrows non-duplicate write errors", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      jest.spyOn(Post, "findById").mockReturnValue(mockFindByIdSelectDoc({ _id: POST_ID }));

      const dbError = new Error("db write failed");
      dbError.code = 12345;
      jest.spyOn(PostLike, "updateOne").mockRejectedValue(dbError);

      await expect(likePostByUser({ _id: USER_ID }, POST_ID)).rejects.toThrow("db write failed");
    });

    it("returns likeCount 0 when updated post has no stats", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      jest
        .spyOn(Post, "findById")
        .mockReturnValueOnce(mockFindByIdSelectDoc({ _id: POST_ID }))
        .mockReturnValueOnce(mockFindByIdSelectLean({ _id: POST_ID }));
      jest.spyOn(PostLike, "updateOne").mockResolvedValue({ upsertedCount: 0 });

      const res = await likePostByUser({ _id: USER_ID }, POST_ID);

      expect(res.likeCount).toBe(0);
      expect(res.liked).toBe(true);
    });
  });

  describe("unlikePostByUser", () => {
    it("throws 401 when auth user is missing", async () => {
      await expect(unlikePostByUser(null, POST_ID)).rejects.toMatchObject({
        statusCode: 401,
        message: "Unauthorized",
      });
    });

    it("throws 400 for invalid post id", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(false);

      await expect(unlikePostByUser({ _id: USER_ID }, "bad-id")).rejects.toMatchObject({
        statusCode: 400,
        message: "Invalid post id",
      });
    });

    it("throws 404 when target post does not exist", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      jest.spyOn(Post, "findById").mockReturnValue(mockFindByIdSelectDoc(null));

      await expect(unlikePostByUser({ _id: USER_ID }, POST_ID)).rejects.toMatchObject({
        statusCode: 404,
        message: "Post not found",
      });
    });

    it("decrements likeCount when a like is deleted", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      jest
        .spyOn(Post, "findById")
        .mockReturnValueOnce(mockFindByIdSelectDoc({ _id: POST_ID, stats: { likeCount: 6 } }))
        .mockReturnValueOnce(mockFindByIdSelectLean({ _id: POST_ID, stats: { likeCount: 5 } }));
      jest.spyOn(PostLike, "deleteOne").mockResolvedValue({ deletedCount: 1 });
      const postUpdateSpy = jest.spyOn(Post, "updateOne").mockResolvedValue({ modifiedCount: 1 });

      const res = await unlikePostByUser({ _id: USER_ID }, POST_ID);

      expect(PostLike.deleteOne).toHaveBeenCalledWith({ post: POST_ID, user: USER_ID });
      expect(postUpdateSpy).toHaveBeenCalledWith(
        { _id: POST_ID, "stats.likeCount": { $gt: 0 } },
        { $inc: { "stats.likeCount": -1 } },
      );
      expect(res).toEqual({
        postId: POST_ID,
        liked: false,
        likeCount: 5,
      });
    });

    it("does not decrement when there is nothing to delete", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      jest
        .spyOn(Post, "findById")
        .mockReturnValueOnce(mockFindByIdSelectDoc({ _id: POST_ID, stats: { likeCount: 4 } }))
        .mockReturnValueOnce(mockFindByIdSelectLean({ _id: POST_ID, stats: { likeCount: 4 } }));
      jest.spyOn(PostLike, "deleteOne").mockResolvedValue({ deletedCount: 0 });
      const postUpdateSpy = jest.spyOn(Post, "updateOne").mockResolvedValue({ modifiedCount: 0 });

      const res = await unlikePostByUser({ _id: USER_ID }, POST_ID);

      expect(postUpdateSpy).not.toHaveBeenCalled();
      expect(res).toEqual({ postId: POST_ID, liked: false, likeCount: 4 });
    });

    it("returns likeCount 0 when updated post has no stats", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      jest
        .spyOn(Post, "findById")
        .mockReturnValueOnce(mockFindByIdSelectDoc({ _id: POST_ID }))
        .mockReturnValueOnce(mockFindByIdSelectLean({ _id: POST_ID }));
      jest.spyOn(PostLike, "deleteOne").mockResolvedValue({ deletedCount: 0 });

      const res = await unlikePostByUser({ _id: USER_ID }, POST_ID);

      expect(res.likeCount).toBe(0);
      expect(res.liked).toBe(false);
    });
  });
});

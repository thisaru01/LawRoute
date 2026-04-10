import { jest } from "@jest/globals";
import mongoose from "mongoose";

import User from "../../../models/userModel.js";
import LawyerProfile from "../../../models/lawyerProfiles/lawyerProfileModel.js";
import Post from "../../../models/social/postModel.js";
import { cloudinary } from "../../../config/cloudinary.js";
import {
  createPostByLawyer,
  findFeedPosts,
  findFeedPostsForLoggedUser,
  findMyPosts,
  findPostsByLawyer,
  updatePostByLawyer,
  deletePostByLawyer,
} from "../postService.js";

const LAWYER_ID = "507f1f77bcf86cd799439011";
const OTHER_USER_ID = "507f1f77bcf86cd799439012";
const POST_ID = "507f1f77bcf86cd799439013";

const makeUser = (overrides = {}) => ({
  _id: LAWYER_ID,
  name: "Lawyer One",
  email: "lawyer@example.com",
  role: "lawyer",
  profilePhoto: "https://img.example.com/photo.png",
  ...overrides,
});

const makeProfile = (overrides = {}) => ({
  _id: "507f1f77bcf86cd799439099",
  user: LAWYER_ID,
  verificationStatus: "approved",
  ...overrides,
});

const makePost = (overrides = {}) => ({
  _id: POST_ID,
  author: { toString: () => LAWYER_ID },
  postType: "legal_awareness",
  content: "Existing content",
  visibility: "public",
  tags: ["law"],
  media: [],
  save: jest.fn().mockResolvedValue(true),
  deleteOne: jest.fn().mockResolvedValue(true),
  ...overrides,
});

const mockFindChain = (result) => ({
  populate: jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({
      limit: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(result),
      }),
    }),
  }),
});

const mockFindByIdPopulateLean = (result) => ({
  populate: jest.fn().mockReturnValue({
    lean: jest.fn().mockResolvedValue(result),
  }),
});

describe("postService", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe("createPostByLawyer", () => {
    it("throws 401 when auth user missing", async () => {
      await expect(createPostByLawyer(null, {})).rejects.toMatchObject({
        statusCode: 401,
        message: "Unauthorized",
      });
    });

    it("throws 403 for non-lawyer user", async () => {
      jest.spyOn(User, "findById").mockResolvedValue(makeUser({ role: "user" }));

      await expect(
        createPostByLawyer({ _id: LAWYER_ID }, { postType: "legal_awareness", content: "hello" }),
      ).rejects.toMatchObject({
        statusCode: 403,
        message: "Only lawyers can create posts",
      });
    });

    it("creates post and maps uploaded media", async () => {
      jest.spyOn(User, "findById").mockResolvedValue(makeUser());
      jest.spyOn(LawyerProfile, "findOne").mockResolvedValue(makeProfile());
      jest.spyOn(Post, "create").mockResolvedValue({ _id: POST_ID });
      jest.spyOn(Post, "findById").mockReturnValue(
        mockFindByIdPopulateLean({ _id: POST_ID, content: "trimmed", media: [{ publicId: "p1" }] }),
      );

      const uploadedFiles = [
        {
          path: "https://res.cloudinary.com/x/image/upload/v1/demo.jpg",
          filename: "public-id-1",
          resource_type: "image",
          format: "jpg",
          originalname: "demo.jpg",
          size: 123,
        },
        { filename: "ignore-no-path" },
      ];

      const payload = {
        postType: "legal_awareness",
        content: "   trimmed   ",
        tags: ["civil"],
      };

      await createPostByLawyer({ _id: LAWYER_ID }, payload, uploadedFiles);

      expect(Post.create).toHaveBeenCalledWith(
        expect.objectContaining({
          author: LAWYER_ID,
          content: "trimmed",
          visibility: "public",
          tags: ["civil"],
          media: [
            expect.objectContaining({
              publicId: "public-id-1",
              resourceType: "image",
              bytes: 123,
            }),
          ],
        }),
      );
    });
  });

  describe("findFeedPosts", () => {
    it("uses default visibility and default limit", async () => {
      const rows = [makePost()];
      jest.spyOn(Post, "find").mockReturnValue(mockFindChain(rows));

      const res = await findFeedPosts();

      expect(Post.find).toHaveBeenCalledWith({ visibility: "public" });
      expect(res).toBe(rows);
    });

    it("throws 400 on invalid cursor", async () => {
      await expect(findFeedPosts({ cursor: "not-a-date" })).rejects.toMatchObject({
        statusCode: 400,
        message: "Invalid cursor",
      });
    });

    it("clamps limit to 50", async () => {
      const limitMock = jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
      jest.spyOn(Post, "find").mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: limitMock,
          }),
        }),
      });

      await findFeedPosts({ limit: 999 });

      expect(limitMock).toHaveBeenCalledWith(50);
    });
  });

  describe("findFeedPostsForLoggedUser", () => {
    it("throws 401 for missing auth", async () => {
      await expect(findFeedPostsForLoggedUser(null)).rejects.toMatchObject({
        statusCode: 401,
        message: "Unauthorized",
      });
    });

    it("builds OR visibility query with own private posts", async () => {
      jest.spyOn(Post, "find").mockReturnValue(mockFindChain([]));

      await findFeedPostsForLoggedUser({ _id: LAWYER_ID }, { limit: 10 });

      expect(Post.find).toHaveBeenCalledWith({
        $or: [
          { visibility: "public" },
          { author: LAWYER_ID, visibility: { $in: ["public", "private"] } },
        ],
      });
    });
  });

  describe("findMyPosts", () => {
    it("requires lawyer role", async () => {
      jest.spyOn(User, "findById").mockResolvedValue(makeUser({ role: "user" }));

      await expect(findMyPosts({ _id: LAWYER_ID })).rejects.toMatchObject({
        statusCode: 403,
        message: "Only lawyers can create posts",
      });
    });

    it("returns posts for the authenticated lawyer", async () => {
      const rows = [makePost()];
      jest.spyOn(User, "findById").mockResolvedValue(makeUser());
      jest.spyOn(Post, "find").mockReturnValue(mockFindChain(rows));

      const res = await findMyPosts({ _id: LAWYER_ID }, { cursor: "2026-01-01T00:00:00.000Z" });

      expect(Post.find).toHaveBeenCalledWith({
        author: LAWYER_ID,
        createdAt: { $lt: new Date("2026-01-01T00:00:00.000Z") },
      });
      expect(res).toBe(rows);
    });
  });

  describe("findPostsByLawyer", () => {
    it("throws 400 for invalid lawyer id", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(false);

      await expect(findPostsByLawyer("bad-id")).rejects.toMatchObject({
        statusCode: 400,
        message: "Invalid lawyer id",
      });
    });

    it("throws 404 when lawyer user missing", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      jest.spyOn(User, "findById").mockResolvedValue(null);

      await expect(findPostsByLawyer(LAWYER_ID)).rejects.toMatchObject({
        statusCode: 404,
        message: "Lawyer not found",
      });
    });

    it("throws 400 when target user is not a lawyer", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      jest.spyOn(User, "findById").mockResolvedValue(makeUser({ role: "user" }));

      await expect(findPostsByLawyer(LAWYER_ID)).rejects.toMatchObject({
        statusCode: 400,
        message: "Target user is not a lawyer",
      });
    });
  });

  describe("updatePostByLawyer", () => {
    it("throws 403 when trying to update someone else's post", async () => {
      jest.spyOn(User, "findById").mockResolvedValue(makeUser());
      jest.spyOn(LawyerProfile, "findOne").mockResolvedValue(makeProfile());
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      jest.spyOn(Post, "findById").mockResolvedValue(
        makePost({ author: { toString: () => OTHER_USER_ID } }),
      );

      await expect(
        updatePostByLawyer({ _id: LAWYER_ID }, POST_ID, { content: "x" }),
      ).rejects.toMatchObject({
        statusCode: 403,
      });
    });

    it("replaces media, deletes cloudinary assets, and appends new uploads", async () => {
      const destroyMock = jest
        .spyOn(cloudinary.uploader, "destroy")
        .mockResolvedValue({ result: "ok" });

      jest.spyOn(User, "findById").mockResolvedValue(makeUser());
      jest.spyOn(LawyerProfile, "findOne").mockResolvedValue(makeProfile());
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

      const postDoc = makePost({
        media: [
          { publicId: "old-1" },
          { publicId: "old-2" },
          { publicId: "old-2" },
        ],
      });
      jest.spyOn(Post, "findById")
        .mockResolvedValueOnce(postDoc)
        .mockReturnValueOnce(mockFindByIdPopulateLean({ _id: POST_ID, media: [{ publicId: "new-1" }] }));

      const payload = {
        content: "  updated content  ",
        replaceMedia: true,
      };

      const uploaded = [
        { path: "https://res.cloudinary.com/new.jpg", filename: "new-1", size: 10 },
      ];

      const res = await updatePostByLawyer({ _id: LAWYER_ID }, POST_ID, payload, uploaded);

      expect(postDoc.save).toHaveBeenCalled();
      expect(destroyMock).toHaveBeenCalled();
      expect(res).toMatchObject({ _id: POST_ID });
    });
  });

  describe("deletePostByLawyer", () => {
    it("deletes owned post and destroys media", async () => {
      const destroyMock = jest
        .spyOn(cloudinary.uploader, "destroy")
        .mockResolvedValue({ result: "ok" });

      jest.spyOn(User, "findById").mockResolvedValue(makeUser());
      jest.spyOn(LawyerProfile, "findOne").mockResolvedValue(makeProfile());
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

      const postDoc = makePost({
        media: [{ publicId: "m1" }, { publicId: "m2" }],
      });
      jest.spyOn(Post, "findById").mockResolvedValue(postDoc);

      await deletePostByLawyer({ _id: LAWYER_ID }, POST_ID);

      expect(destroyMock).toHaveBeenCalled();
      expect(postDoc.deleteOne).toHaveBeenCalled();
    });
  });
});

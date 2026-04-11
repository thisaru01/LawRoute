import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";

import socialRoutes from "../socialRoutes.js";
import errorMiddleware from "../../../middleware/errorMiddleware.js";
import User from "../../../models/userModel.js";
import LawyerProfile from "../../../models/lawyerProfiles/lawyerProfileModel.js";
import Post from "../../../models/social/postModel.js";
import PostLike from "../../../models/social/postLikeModel.js";
import Comment from "../../../models/social/commentModel.js";

const JWT_SECRET = "test-secret";
const LAWYER_ID = "507f1f77bcf86cd799439011";
const USER_ID = "507f1f77bcf86cd799439021";
const OTHER_ID = "507f1f77bcf86cd799439031";
const POST_ID = "507f1f77bcf86cd799439041";
const COMMENT_ID = "507f1f77bcf86cd799439051";

process.env.JWT_SECRET = JWT_SECRET;

const lawyerToken = jwt.sign({ id: LAWYER_ID }, JWT_SECRET);
const userToken = jwt.sign({ id: USER_ID }, JWT_SECRET);

const makeUser = (overrides = {}) => ({
  _id: LAWYER_ID,
  name: "Lawyer One",
  email: "lawyer@example.com",
  role: "lawyer",
  profilePhoto: "https://cdn.example.com/lawyer.png",
  ...overrides,
});

const makePost = (overrides = {}) => ({
  _id: POST_ID,
  author: { toString: () => LAWYER_ID },
  postType: "legal_awareness",
  content: "Test post",
  visibility: "public",
  tags: ["civil"],
  media: [],
  stats: { likeCount: 1, commentCount: 1 },
  save: jest.fn().mockResolvedValue(true),
  deleteOne: jest.fn().mockResolvedValue(true),
  ...overrides,
});

const mockFindChain = (rows) => ({
  populate: jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({
      limit: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(rows),
      }),
    }),
  }),
});

const mockFindByIdPopulateLean = (doc) => ({
  populate: jest.fn().mockReturnValue({
    lean: jest.fn().mockResolvedValue(doc),
  }),
});

const mockFindByIdSelectDoc = (doc) => ({
  select: jest.fn().mockResolvedValue(doc),
});

const mockFindByIdSelectLean = (doc) => ({
  select: jest.fn().mockReturnValue({
    lean: jest.fn().mockResolvedValue(doc),
  }),
});

describe("Social Routes", () => {
  let app;

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();

    app = express();
    app.use(express.json());
    app.use("/api/social", socialRoutes);
    app.use(errorMiddleware);
  });

  describe("GET /api/social/feed", () => {
    it("returns public feed", async () => {
      jest.spyOn(Post, "find").mockReturnValue(mockFindChain([makePost()]));

      const res = await request(app).get("/api/social/feed");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
    });

    it("returns 400 for invalid cursor", async () => {
      const res = await request(app).get("/api/social/feed").query({ cursor: "bad-date" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid cursor");
    });
  });

  describe("GET /api/social/feed/me", () => {
    it("returns 401 when token is missing", async () => {
      const res = await request(app).get("/api/social/feed/me");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Not authorized, no token");
    });

    it("returns personalized feed for logged user", async () => {
      jest.spyOn(User, "findById").mockResolvedValue(makeUser({ _id: USER_ID, role: "user" }));
      jest.spyOn(Post, "find").mockReturnValue(mockFindChain([makePost()]));

      const res = await request(app)
        .get("/api/social/feed/me")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
    });
  });

  describe("GET /api/social/lawyers/:lawyerId/posts", () => {
    it("returns 400 for invalid lawyer id", async () => {
      const res = await request(app).get("/api/social/lawyers/bad-id/posts");

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid lawyer id");
    });

    it("returns posts for valid lawyer", async () => {
      jest.spyOn(User, "findById").mockResolvedValue(makeUser({ _id: LAWYER_ID, role: "lawyer" }));
      jest.spyOn(Post, "find").mockReturnValue(mockFindChain([makePost()]));

      const res = await request(app).get(`/api/social/lawyers/${LAWYER_ID}/posts`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
    });
  });

  describe("POST /api/social/posts", () => {
    it("returns 403 for non-lawyer role", async () => {
      jest.spyOn(User, "findById").mockResolvedValue(makeUser({ _id: USER_ID, role: "user" }));

      const res = await request(app)
        .post("/api/social/posts")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ postType: "legal_awareness", content: "Hello world" });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Access denied");
    });

    it("returns 400 for invalid postType", async () => {
      jest.spyOn(User, "findById").mockResolvedValue(makeUser({ _id: LAWYER_ID, role: "lawyer" }));

      const res = await request(app)
        .post("/api/social/posts")
        .set("Authorization", `Bearer ${lawyerToken}`)
        .send({ postType: "invalid", content: "Hello world" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid postType");
    });

    it("creates a post for approved lawyer", async () => {
      jest.spyOn(User, "findById").mockResolvedValue(makeUser({ _id: LAWYER_ID, role: "lawyer" }));
      jest
        .spyOn(LawyerProfile, "findOne")
        .mockResolvedValue({ user: LAWYER_ID, verificationStatus: "approved" });
      jest.spyOn(Post, "create").mockResolvedValue({ _id: POST_ID });
      jest.spyOn(Post, "findById").mockReturnValue(mockFindByIdPopulateLean(makePost()));

      const res = await request(app)
        .post("/api/social/posts")
        .set("Authorization", `Bearer ${lawyerToken}`)
        .send({ postType: "legal_awareness", content: "  Hello world  " });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Post created successfully");
    });
  });

  describe("PUT /api/social/posts/:id", () => {
    it("returns 400 when update payload is empty", async () => {
      jest.spyOn(User, "findById").mockResolvedValue(makeUser({ _id: LAWYER_ID, role: "lawyer" }));

      const res = await request(app)
        .put(`/api/social/posts/${POST_ID}`)
        .set("Authorization", `Bearer ${lawyerToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("At least one field or media file is required to update");
    });

    it("updates owned post successfully", async () => {
      jest.spyOn(User, "findById").mockResolvedValue(makeUser({ _id: LAWYER_ID, role: "lawyer" }));
      jest
        .spyOn(LawyerProfile, "findOne")
        .mockResolvedValue({ user: LAWYER_ID, verificationStatus: "approved" });

      const postDoc = makePost({ save: jest.fn().mockResolvedValue(true) });
      jest.spyOn(Post, "findById")
        .mockResolvedValueOnce(postDoc)
        .mockReturnValueOnce(mockFindByIdPopulateLean(makePost({ content: "Updated content" })));

      const res = await request(app)
        .put(`/api/social/posts/${POST_ID}`)
        .set("Authorization", `Bearer ${lawyerToken}`)
        .send({ content: "Updated content" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Post updated successfully");
      expect(postDoc.save).toHaveBeenCalled();
    });
  });

  describe("DELETE /api/social/posts/:id", () => {
    it("returns 403 when lawyer does not own post", async () => {
      jest.spyOn(User, "findById").mockResolvedValue(makeUser({ _id: LAWYER_ID, role: "lawyer" }));
      jest
        .spyOn(LawyerProfile, "findOne")
        .mockResolvedValue({ user: LAWYER_ID, verificationStatus: "approved" });
      jest.spyOn(Post, "findById").mockResolvedValue(
        makePost({ author: { toString: () => OTHER_ID } }),
      );

      const res = await request(app)
        .delete(`/api/social/posts/${POST_ID}`)
        .set("Authorization", `Bearer ${lawyerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("deletes owned post", async () => {
      jest.spyOn(User, "findById").mockResolvedValue(makeUser({ _id: LAWYER_ID, role: "lawyer" }));
      jest
        .spyOn(LawyerProfile, "findOne")
        .mockResolvedValue({ user: LAWYER_ID, verificationStatus: "approved" });

      const postDoc = makePost({ deleteOne: jest.fn().mockResolvedValue(true) });
      jest.spyOn(Post, "findById").mockResolvedValue(postDoc);

      const res = await request(app)
        .delete(`/api/social/posts/${POST_ID}`)
        .set("Authorization", `Bearer ${lawyerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Post deleted successfully");
      expect(postDoc.deleteOne).toHaveBeenCalled();
    });
  });

  describe("POST/DELETE /api/social/posts/:id/like", () => {
    it("likes a post for authenticated user", async () => {
      jest.spyOn(User, "findById").mockResolvedValue(makeUser({ _id: USER_ID, role: "user" }));
      jest.spyOn(Post, "findById")
        .mockReturnValueOnce(mockFindByIdSelectDoc({ _id: POST_ID, stats: { likeCount: 0 } }))
        .mockReturnValueOnce(mockFindByIdSelectLean({ _id: POST_ID, stats: { likeCount: 1 } }));
      jest.spyOn(PostLike, "updateOne").mockResolvedValue({ upsertedCount: 1 });
      jest.spyOn(Post, "updateOne").mockResolvedValue({ modifiedCount: 1 });

      const res = await request(app)
        .post(`/api/social/posts/${POST_ID}/like`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Post liked successfully");
      expect(res.body.liked).toBe(true);
      expect(res.body.likeCount).toBe(1);
    });

    it("unlikes a post for authenticated user", async () => {
      jest.spyOn(User, "findById").mockResolvedValue(makeUser({ _id: USER_ID, role: "user" }));
      jest.spyOn(Post, "findById")
        .mockReturnValueOnce(mockFindByIdSelectDoc({ _id: POST_ID, stats: { likeCount: 2 } }))
        .mockReturnValueOnce(mockFindByIdSelectLean({ _id: POST_ID, stats: { likeCount: 1 } }));
      jest.spyOn(PostLike, "deleteOne").mockResolvedValue({ deletedCount: 1 });
      jest.spyOn(Post, "updateOne").mockResolvedValue({ modifiedCount: 1 });

      const res = await request(app)
        .delete(`/api/social/posts/${POST_ID}/like`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Post unliked successfully");
      expect(res.body.liked).toBe(false);
      expect(res.body.likeCount).toBe(1);
    });
  });

  describe("Comments routes", () => {
    it("creates comment with auth and valid body", async () => {
      jest.spyOn(User, "findById").mockResolvedValue(makeUser({ _id: USER_ID, role: "user" }));
      jest.spyOn(Post, "findById").mockReturnValue(mockFindByIdSelectDoc({ _id: POST_ID }));
      jest.spyOn(Comment, "create").mockResolvedValue({ _id: COMMENT_ID });
      jest.spyOn(Post, "updateOne").mockResolvedValue({ modifiedCount: 1 });
      jest.spyOn(Comment, "findById").mockReturnValue(
        mockFindByIdPopulateLean({ _id: COMMENT_ID, content: "Nice post" }),
      );

      const res = await request(app)
        .post(`/api/social/posts/${POST_ID}/comments`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ content: "Nice post" });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Comment created successfully");
    });

    it("returns 400 for invalid comment payload", async () => {
      jest.spyOn(User, "findById").mockResolvedValue(makeUser({ _id: USER_ID, role: "user" }));

      const res = await request(app)
        .post(`/api/social/posts/${POST_ID}/comments`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ text: "wrong key" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Request contains invalid fields");
    });

    it("lists post comments", async () => {
      jest.spyOn(Post, "findById").mockReturnValue(mockFindByIdSelectDoc({ _id: POST_ID }));
      jest.spyOn(Comment, "find").mockReturnValue(
        mockFindChain([{ _id: COMMENT_ID, content: "Nice post" }]),
      );

      const res = await request(app).get(`/api/social/posts/${POST_ID}/comments`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
    });

    it("deletes own comment", async () => {
      jest.spyOn(User, "findById").mockResolvedValue(makeUser({ _id: USER_ID, role: "user" }));
      jest.spyOn(Comment, "findById").mockResolvedValue({
        _id: COMMENT_ID,
        post: POST_ID,
        author: { toString: () => USER_ID },
      });
      jest.spyOn(Comment, "deleteOne").mockResolvedValue({ deletedCount: 1 });
      jest.spyOn(Post, "updateOne").mockResolvedValue({ modifiedCount: 1 });

      const res = await request(app)
        .delete(`/api/social/comments/${COMMENT_ID}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Comment deleted successfully");
    });
  });
});

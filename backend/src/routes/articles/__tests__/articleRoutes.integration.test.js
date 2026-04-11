import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";

import articleRoutes from "../articleRoutes.js";
import Article from "../../../models/articles/articleModel.js";
import User from "../../../models/userModel.js";

const JWT_SECRET = "test-secret";
const TEST_ADMIN_ID = "admin1";
const TEST_AUTHOR_ID = "507f1f77bcf86cd799439011";
const TEST_ARTICLE_ID = "507f1f77bcf86cd799439012";

process.env.JWT_SECRET = JWT_SECRET;

const adminToken = jwt.sign({ id: TEST_ADMIN_ID }, JWT_SECRET);
const authorToken = jwt.sign({ id: TEST_AUTHOR_ID }, JWT_SECRET);

// Top-level: article routes integration behaviour (HTTP + controllers + services mocked at model layer)
describe("Article Routes", () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();

    app = express();
    app.use(express.json());
    app.use("/api/articles", articleRoutes);
  });

  // GET /api/articles/published
  describe("GET /api/articles/published", () => {
    it("returns only published articles", async () => {
      const fakeArticles = [
        { _id: "a1", status: "published" },
        { _id: "a2", status: "published" },
      ];

      jest.spyOn(Article, "find").mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(fakeArticles),
        }),
      });

      const res = await request(app).get("/api/articles/published");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.articles).toEqual(fakeArticles);
    });
  });

  // GET /api/articles/me
  describe("GET /api/articles/me", () => {
    it("returns 403 when authenticated user is not admin or lawyer", async () => {
      const fakeArticles = [{ _id: "a1" }, { _id: "a2" }];

      jest.spyOn(User, "findById").mockResolvedValue({
        _id: TEST_AUTHOR_ID,
        role: "user",
      });

      jest.spyOn(Article, "find").mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(fakeArticles),
        }),
      });

      const res = await request(app)
        .get("/api/articles/me")
        .set("Authorization", `Bearer ${authorToken}`);

      expect(res.status).toBe(403);
    });

    it("returns 401 when no token is provided", async () => {
      const res = await request(app).get("/api/articles/me");

      expect(res.status).toBe(401);
    });
  });

  // PATCH /api/articles/:id/status
  describe("PATCH /api/articles/:id/status", () => {
    it("allows an admin to publish another user's pending article", async () => {
      const saveMock = jest.fn().mockResolvedValue(true);
      const populateMock = jest.fn().mockResolvedValue(true);

      const article = {
        _id: TEST_ARTICLE_ID,
        author: TEST_AUTHOR_ID,
        status: "pending",
        save: saveMock,
        populate: populateMock,
      };

      jest.spyOn(User, "findById").mockImplementation((id) => {
        if (id === TEST_ADMIN_ID) {
          // Used by protect() to attach req.user
          return Promise.resolve({ _id: TEST_ADMIN_ID, role: "admin" });
        }

        if (id === TEST_AUTHOR_ID) {
          // Used by updateArticleStatus() when preparing the optional status email
          const leanMock = jest.fn().mockResolvedValue({ name: "Alice Author" });
          return {
            select: jest.fn().mockReturnValue({ lean: leanMock }),
          };
        }

        return Promise.resolve(null);
      });

      jest.spyOn(Article, "findById").mockResolvedValue(article);

      const res = await request(app)
        .patch(`/api/articles/${TEST_ARTICLE_ID}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "published" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(saveMock).toHaveBeenCalled();
      expect(res.body.article.status).toBe("published");
    });

    it("returns 400 when status in body is missing or invalid", async () => {
      jest.spyOn(User, "findById").mockResolvedValue({
        _id: TEST_ADMIN_ID,
        role: "admin",
      });

      const res = await request(app)
        .patch(`/api/articles/${TEST_ARTICLE_ID}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "" });

      expect(res.status).toBe(400);
    });
  });
});

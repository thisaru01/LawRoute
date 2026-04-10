import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";

import Article from "../../../models/articles/articleModel.js";
import User from "../../../models/userModel.js";
import {
  createArticle,
  getAllArticles,
  getArticleById,
  updateArticleStatus,
  deleteArticle,
} from "../articleService.js";

const JWT_SECRET = "test-secret";
const TEST_USER_ID = "507f1f77bcf86cd799439011";

process.env.JWT_SECRET = JWT_SECRET;

describe("articleService", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe("createArticle", () => {
    it("throws 401 when user is missing", async () => {
      await expect(
        createArticle({
          title: "t",
          content: "c",
          category: "cat",
          user: null,
          imageUrl: "img.jpg",
          imagecardUrl: "card.jpg",
        }),
      ).rejects.toMatchObject({ status: 401, message: "Unauthorized" });
    });

    it("throws 403 when role is not admin or lawyer", async () => {
      await expect(
        createArticle({
          title: "t",
          content: "c",
          category: "cat",
          user: { _id: TEST_USER_ID, role: "user" },
          imageUrl: "img.jpg",
          imagecardUrl: "card.jpg",
        }),
      ).rejects.toMatchObject({
        status: 403,
        message: "Only admins or lawyers can create articles",
      });
    });

    it("throws 400 when required fields are missing", async () => {
      await expect(
        createArticle({
          title: "",
          content: "c",
          category: "cat",
          user: { _id: TEST_USER_ID, role: "admin" },
          imageUrl: null,
          imagecardUrl: null,
        }),
      ).rejects.toMatchObject({
        status: 400,
        message:
          "Title, content, category, image, and imagecard files are required",
      });
    });

    it("creates an article when data is valid", async () => {
      const saveMock = jest.fn().mockResolvedValue(true);

      jest.spyOn(Article.prototype, "save").mockImplementation(saveMock);

      const result = await createArticle({
        title: "Test title",
        content: "Body",
        category: "Work",
        user: { _id: TEST_USER_ID, role: "admin" },
        imageUrl: "img.jpg",
        imagePublicId: "img-public-id",
        imagecardUrl: "card.jpg",
        imagecardPublicId: "card-public-id",
      });

      expect(saveMock).toHaveBeenCalled();
      expect(result.title).toBe("Test title");
      expect(result.author.toString()).toBe(TEST_USER_ID);
      expect(result.authorRole).toBe("admin");
      expect(result.status).toBe("pending");
    });
  });

  describe("getAllArticles", () => {
    it("returns only published articles for public users", async () => {
      const fakeArticles = [{ _id: "a1", status: "published" }];

      jest.spyOn(Article, "find").mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(fakeArticles),
        }),
      });

      const res = await getAllArticles({ authHeader: null, query: {} });

      expect(Article.find).toHaveBeenCalledWith({ status: "published" });
      expect(res).toBe(fakeArticles);
    });

    it("allows admin to see all articles when authenticated", async () => {
      const token = jwt.sign({ id: TEST_USER_ID }, JWT_SECRET);
      const fakeArticles = [{ _id: "a1" }, { _id: "a2" }];

      jest
        .spyOn(User, "findById")
        .mockReturnValue({ select: jest.fn().mockResolvedValue({ role: "admin" }) });

      jest.spyOn(Article, "find").mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(fakeArticles),
        }),
      });

      const res = await getAllArticles({
        authHeader: `Bearer ${token}`,
        query: {},
      });

      expect(Article.find).toHaveBeenCalledWith({});
      expect(res).toBe(fakeArticles);
    });
  });

  describe("getArticleById", () => {
    it("throws 400 for invalid id", async () => {
      await expect(
        getArticleById({ id: "not-an-id", authHeader: null }),
      ).rejects.toMatchObject({ status: 400, message: "Invalid article id" });
    });

    it("throws 404 when article not found", async () => {
      jest.spyOn(Article, "findById").mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      await expect(
        getArticleById({
          id: "507f1f77bcf86cd799439011",
          authHeader: null,
        }),
      ).rejects.toMatchObject({ status: 404, message: "Article not found" });
    });

    it("returns unpublished article for owner", async () => {
      const article = {
        _id: "507f1f77bcf86cd799439011",
        status: "pending",
        author: { _id: TEST_USER_ID },
      };

      jest.spyOn(Article, "findById").mockReturnValue({
        populate: jest.fn().mockResolvedValue(article),
      });

      const token = jwt.sign({ id: TEST_USER_ID }, JWT_SECRET);

      jest
        .spyOn(User, "findById")
        .mockReturnValue({ select: jest.fn().mockResolvedValue({ role: "user" }) });

      const res = await getArticleById({
        id: "507f1f77bcf86cd799439011",
        authHeader: `Bearer ${token}`,
      });

      expect(res).toBe(article);
    });

    it("throws 403 for unpublished article when requester is not owner or admin", async () => {
      const article = {
        _id: "507f1f77bcf86cd799439011",
        status: "pending",
        author: { _id: "another-user" },
      };

      jest.spyOn(Article, "findById").mockReturnValue({
        populate: jest.fn().mockResolvedValue(article),
      });

      const token = jwt.sign({ id: TEST_USER_ID }, JWT_SECRET);

      jest
        .spyOn(User, "findById")
        .mockReturnValue({ select: jest.fn().mockResolvedValue({ role: "user" }) });

      await expect(
        getArticleById({
          id: "507f1f77bcf86cd799439011",
          authHeader: `Bearer ${token}`,
        }),
      ).rejects.toMatchObject({ status: 403, message: "Article not available" });
    });
  });

  describe("updateArticleStatus", () => {
    it("throws 400 for invalid id", async () => {
      await expect(
        updateArticleStatus({ id: "bad", status: "published", user: {} }),
      ).rejects.toMatchObject({ status: 400, message: "Invalid article id" });
    });

    it("throws 400 for invalid status", async () => {
      await expect(
        updateArticleStatus({
          id: "507f1f77bcf86cd799439011",
          status: "weird",
          user: {},
        }),
      ).rejects.toMatchObject({ status: 400, message: "Invalid status" });
    });

    it("throws 404 when article not found", async () => {
      jest.spyOn(Article, "findById").mockResolvedValue(null);

      await expect(
        updateArticleStatus({
          id: "507f1f77bcf86cd799439011",
          status: "published",
          user: { _id: TEST_USER_ID, role: "admin" },
        }),
      ).rejects.toMatchObject({ status: 404, message: "Article not found" });
    });

    it("prevents reverting published article back to pending", async () => {
      jest.spyOn(Article, "findById").mockResolvedValue({ status: "published" });

      await expect(
        updateArticleStatus({
          id: "507f1f77bcf86cd799439011",
          status: "pending",
          user: { _id: TEST_USER_ID, role: "admin" },
        }),
      ).rejects.toMatchObject({
        status: 400,
        message: "Published articles cannot be changed back to pending",
      });
    });

    it("allows author to archive their own article", async () => {
      const saveMock = jest.fn().mockResolvedValue(true);
      const article = {
        _id: "a1",
        author: TEST_USER_ID,
        status: "pending",
        save: saveMock,
      };

      jest.spyOn(Article, "findById").mockResolvedValue(article);

      const res = await updateArticleStatus({
        id: "507f1f77bcf86cd799439011",
        status: "archived",
        user: { _id: TEST_USER_ID, role: "admin" },
      });

      expect(saveMock).toHaveBeenCalled();
      expect(res.deleted).toBe(false);
      expect(res.article.status).toBe("archived");
    });
  });

  describe("deleteArticle", () => {
    it("throws 400 for invalid id", async () => {
      await expect(
        deleteArticle({ id: "bad", user: { _id: TEST_USER_ID, role: "admin" } }),
      ).rejects.toMatchObject({ status: 400, message: "Invalid article id" });
    });

    it("throws 401 when user is not provided", async () => {
      await expect(
        deleteArticle({ id: "507f1f77bcf86cd799439011", user: null }),
      ).rejects.toMatchObject({ status: 401, message: "Unauthorized" });
    });

    it("throws 404 when article not found", async () => {
      jest.spyOn(Article, "findById").mockResolvedValue(null);

      await expect(
        deleteArticle({
          id: "507f1f77bcf86cd799439011",
          user: { _id: TEST_USER_ID, role: "admin" },
        }),
      ).rejects.toMatchObject({ status: 404, message: "Article not found" });
    });

    it("allows owner to delete pending article", async () => {
      const deleteOneMock = jest.fn().mockResolvedValue(true);
      const article = {
        _id: "a1",
        author: TEST_USER_ID,
        status: "pending",
        deleteOne: deleteOneMock,
      };

      jest.spyOn(Article, "findById").mockResolvedValue(article);

      const res = await deleteArticle({
        id: "507f1f77bcf86cd799439011",
        user: { _id: TEST_USER_ID, role: "admin" },
      });

      expect(deleteOneMock).toHaveBeenCalled();
      expect(res).toEqual({ success: true, message: "Article deleted successfully" });
    });
  });
});

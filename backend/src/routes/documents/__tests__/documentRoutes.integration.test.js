import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";

import documentRoutes from "../documentRoutes.js";
import Document from "../../../models/documents/documentModel.js";
import User from "../../../models/userModel.js";

const JWT_SECRET = "test-secret";
const TEST_ADMIN_ID = "admin1";
const TEST_DOCUMENT_ID = "507f1f77bcf86cd799439011";

process.env.JWT_SECRET = JWT_SECRET;

const adminToken = jwt.sign({ id: TEST_ADMIN_ID }, JWT_SECRET);

// Integration-style tests: Express routing + controllers + services, with models mocked

describe("Document Routes", () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();

    app = express();
    app.use(express.json());
    app.use("/api/documents", documentRoutes);
  });

  describe("GET /api/documents", () => {
    it("returns all documents sorted by createdAt desc", async () => {
      const fakeDocs = [
        { _id: "d1", title: "Doc 1" },
        { _id: "d2", title: "Doc 2" },
      ];

      jest.spyOn(Document, "find").mockReturnValue({
        sort: jest.fn().mockResolvedValue(fakeDocs),
      });

      const res = await request(app).get("/api/documents");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.documents).toEqual(fakeDocs);
    });
  });

  describe("GET /api/documents/:id", () => {
    it("returns 400 for invalid id", async () => {
      const res = await request(app).get("/api/documents/not-a-valid-id");

      expect(res.status).toBe(400);
      // getDocument forwards service error as 500 default wrapper, but our service throws with status 400
      // and errorMiddleware is not used here, so we only reliably assert on status code
    });

    it("returns 404 when document not found", async () => {
      jest.spyOn(Document, "findById").mockResolvedValue(null);

      const res = await request(app).get(`/api/documents/${TEST_DOCUMENT_ID}`);
      expect(res.status).toBe(404);
    });

    it("returns document when found", async () => {
      const fake = { _id: TEST_DOCUMENT_ID, title: "Doc" };
      jest.spyOn(Document, "findById").mockResolvedValue(fake);

      const res = await request(app).get(`/api/documents/${TEST_DOCUMENT_ID}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.document).toEqual(fake);
    });
  });

  describe("PATCH /api/documents/:id", () => {
    it("returns 401 when no token is provided", async () => {
      const res = await request(app)
        .patch(`/api/documents/${TEST_DOCUMENT_ID}`)
        .send({ title: "New title" });

      expect(res.status).toBe(401);
    });

    it("returns 403 when authenticated user is not admin", async () => {
      jest.spyOn(User, "findById").mockResolvedValue({ _id: TEST_ADMIN_ID, role: "user" });

      const token = jwt.sign({ id: TEST_ADMIN_ID }, JWT_SECRET);

      const res = await request(app)
        .patch(`/api/documents/${TEST_DOCUMENT_ID}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "New title" });

      expect(res.status).toBe(403);
    });

    it("allows admin to update document title/description", async () => {
      jest.spyOn(User, "findById").mockResolvedValue({ _id: TEST_ADMIN_ID, role: "admin" });

      const saveMock = jest.fn().mockResolvedValue(true);
      const doc = {
        _id: TEST_DOCUMENT_ID,
        title: "Old",
        description: "Old",
        save: saveMock,
      };
      jest.spyOn(Document, "findById").mockResolvedValue(doc);

      const res = await request(app)
        .patch(`/api/documents/${TEST_DOCUMENT_ID}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ title: "New", description: "New" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(saveMock).toHaveBeenCalled();
      expect(res.body.document.title).toBe("New");
      expect(res.body.document.description).toBe("New");
    });
  });

  describe("DELETE /api/documents/:id", () => {
    it("returns 401 when no token is provided", async () => {
      const res = await request(app).delete(`/api/documents/${TEST_DOCUMENT_ID}`);

      expect(res.status).toBe(401);
    });

    it("allows admin to delete a document", async () => {
      jest.spyOn(User, "findById").mockResolvedValue({ _id: TEST_ADMIN_ID, role: "admin" });

      const deleteOneMock = jest.fn().mockResolvedValue(true);
      const doc = { _id: TEST_DOCUMENT_ID, filePublicId: null, deleteOne: deleteOneMock };
      jest.spyOn(Document, "findById").mockResolvedValue(doc);

      const res = await request(app)
        .delete(`/api/documents/${TEST_DOCUMENT_ID}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(deleteOneMock).toHaveBeenCalled();
    });
  });
});

import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";

import consultationRequestRoutes from "../consultationRequestRoutes.js";
import ConsultationRequest from "../../../models/consultation/consultationRequestModel.js";
import User from "../../../models/userModel.js";

const JWT_SECRET = "test-secret";
const TEST_USER_ID = "user1";
const TEST_LAWYER_ID = "507f1f77bcf86cd799439011";

process.env.JWT_SECRET = JWT_SECRET;

const authToken = jwt.sign({ id: TEST_USER_ID }, JWT_SECRET);

// Top-level: consultation request route suite
describe("Consultation Request Routes", () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();

    app = express();
    app.use(express.json());
    app.use("/api/consultation-requests", consultationRequestRoutes);
  });

  // POST endpoints for creating consultation requests
  describe("POST /api/consultation-requests", () => {
    // creates a consultation request successfully
    it("creates a consultation request and returns 201", async () => {
      const fakeRequest = {
        _id: "r1",
        summary: "Test",
        lawyer: TEST_LAWYER_ID,
      };

      jest.spyOn(User, "findById").mockImplementation((id) => {
        if (id === TEST_USER_ID) {
          return Promise.resolve({ _id: TEST_USER_ID, role: "user" });
        }

        if (id === TEST_LAWYER_ID) {
          return {
            select: jest
              .fn()
              .mockResolvedValue({ _id: TEST_LAWYER_ID, role: "lawyer" }),
          };
        }

        return Promise.resolve(null);
      });

      const createSpy = jest
        .spyOn(ConsultationRequest, "create")
        .mockResolvedValue(fakeRequest);

      const res = await request(app)
        .post("/api/consultation-requests")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ summary: "Need help", lawyerId: TEST_LAWYER_ID });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(fakeRequest);

      expect(createSpy).toHaveBeenCalledWith({
        user: TEST_USER_ID,
        lawyer: TEST_LAWYER_ID,
        summary: "Need help",
      });
    });

    // rejects creation when no auth token provided
    it("returns 401 if no token is provided", async () => {
      const res = await request(app)
        .post("/api/consultation-requests")
        .send({ summary: "Test", lawyerId: TEST_LAWYER_ID });

      expect(res.status).toBe(401);
    });

    // validates request body and rejects missing summary
    it("returns 400 when request body is invalid (missing summary)", async () => {
      jest
        .spyOn(User, "findById")
        .mockResolvedValue({ _id: TEST_USER_ID, role: "user" });

      const res = await request(app)
        .post("/api/consultation-requests")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ lawyerId: TEST_LAWYER_ID });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Summary is required");
    });
  });

  // GET endpoint for fetching current user's consultation requests
  describe("GET /api/consultation-requests/me", () => {
    // returns list of requests for the logged-in user
    it("returns consultation requests for the logged-in user", async () => {
      const fakeRequests = [{ _id: "r1" }, { _id: "r2" }];
      jest
        .spyOn(User, "findById")
        .mockResolvedValue({ _id: TEST_USER_ID, role: "user" });

      jest.spyOn(ConsultationRequest, "find").mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(fakeRequests),
        }),
      });

      const res = await request(app)
        .get("/api/consultation-requests/me")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(fakeRequests);

      expect(ConsultationRequest.find).toHaveBeenCalledWith({
        user: TEST_USER_ID,
      });
    });
  });

  // GET endpoint for fetching a single consultation request by id
  describe("GET /api/consultation-requests/:id", () => {
    // returns single request when user is related
    it("returns a consultation request by id when accessible", async () => {
      const fakeRequest = {
        _id: "r1",
        summary: "Test",
        user: { _id: TEST_USER_ID },
        lawyer: { _id: TEST_LAWYER_ID },
      };
      jest
        .spyOn(User, "findById")
        .mockResolvedValue({ _id: TEST_USER_ID, role: "user" });

      jest.spyOn(ConsultationRequest, "findById").mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(fakeRequest),
        }),
      });

      const res = await request(app)
        .get("/api/consultation-requests/r1")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(fakeRequest);

      expect(ConsultationRequest.findById).toHaveBeenCalledWith("r1");
    });

    // returns 403 when current user is not authorized to view
    it("returns 403 when user is not allowed to access request", async () => {
      const fakeRequest = {
        user: { _id: "anotherUser" },
        lawyer: { _id: "anotherLawyer" },
      };

      jest.spyOn(ConsultationRequest, "findById").mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(fakeRequest),
        }),
      });

      const res = await request(app)
        .get("/api/consultation-requests/r1")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(403);
    });

    // returns 404 when the request does not exist
    it("returns 404 when consultation request is not found", async () => {
      jest
        .spyOn(User, "findById")
        .mockResolvedValue({ _id: TEST_USER_ID, role: "user" });

      jest.spyOn(ConsultationRequest, "findById").mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(null),
        }),
      });

      const res = await request(app)
        .get("/api/consultation-requests/missing")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Request not found");
    });
  });
});

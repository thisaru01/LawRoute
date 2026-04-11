import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";

import caseRoutes from "../caseRoutes.js";
import Case from "../../../models/case/caseModel.js";
import CaseMeeting from "../../../models/case/caseMeeting.js";
import User from "../../../models/userModel.js";

const JWT_SECRET = "test-secret";
const TEST_USER_ID = "user1";
const TEST_LAWYER_ID = "507f1f77bcf86cd799439011";

process.env.JWT_SECRET = JWT_SECRET;
const userToken = jwt.sign({ id: TEST_USER_ID }, JWT_SECRET);
const lawyerToken = jwt.sign({ id: TEST_LAWYER_ID }, JWT_SECRET);

// Top-level: case routes
describe("Case Routes", () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();

    app = express();
    app.use(express.json());
    app.use("/api/cases", caseRoutes);
  });

  // GET /api/cases/my
  describe("GET /api/cases/my", () => {
    // returns cases for logged-in user
    it("returns cases for the logged-in user", async () => {
      const fakeCases = [{ _id: "c1" }, { _id: "c2" }];

      jest.spyOn(User, "findById").mockResolvedValue({
        _id: TEST_USER_ID,
        role: "user",
      });

      jest.spyOn(Case, "find").mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              sort: jest.fn().mockResolvedValue(fakeCases),
            }),
          }),
        }),
      });

      const res = await request(app)
        .get("/api/cases/my")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(fakeCases);

      expect(Case.find).toHaveBeenCalledWith({ user: TEST_USER_ID });
    });
  });

  // GET /api/cases/:id
  describe("GET /api/cases/:id", () => {
    // returns case when current user is related
    it("returns case when user is related", async () => {
      const fakeCase = { _id: "c1", user: { _id: TEST_USER_ID } };

      jest.spyOn(User, "findById").mockResolvedValue({
        _id: TEST_USER_ID,
        role: "user",
      });

      jest.spyOn(Case, "findById").mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(fakeCase),
          }),
        }),
      });

      const res = await request(app)
        .get("/api/cases/c1")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(fakeCase);

      expect(Case.findById).toHaveBeenCalledWith("c1");
    });

    // returns 403 when not related
    it("returns 403 when user is not related to the case", async () => {
      const fakeCase = {
        _id: "c1",
        user: { _id: "other" },
        lawyer: { _id: "other2" },
      };

      jest.spyOn(User, "findById").mockResolvedValue({
        _id: TEST_USER_ID,
        role: "user",
      });

      jest.spyOn(Case, "findById").mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(fakeCase),
          }),
        }),
      });

      const res = await request(app)
        .get("/api/cases/c1")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  // PATCH /api/cases/:id/close
  describe("PATCH /api/cases/:id/close", () => {
    // closes case when lawyer is assigned
    it("closes a case when requested by assigned lawyer", async () => {
      const fakeCase = {
        _id: "c1",
        lawyer: { _id: TEST_LAWYER_ID },
        status: "open",
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(User, "findById").mockResolvedValue({
        _id: TEST_LAWYER_ID,
        role: "lawyer",
      });

      jest.spyOn(Case, "findById").mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(fakeCase),
          }),
        }),
      });

      const res = await request(app)
        .patch("/api/cases/c1/close")
        .set("Authorization", `Bearer ${lawyerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("closed");

      expect(fakeCase.save).toHaveBeenCalled();
    });
  });

  // POST /api/cases/:id/meetings
  describe("POST /api/cases/:id/meetings", () => {
    // schedule a meeting successfully
    it("schedules a meeting when requested by assigned lawyer", async () => {
      const fakeMeeting = { _id: "m1", date: "2026-04-09", time: "11:00" };

      jest.spyOn(User, "findById").mockResolvedValue({
        _id: TEST_LAWYER_ID,
        role: "lawyer",
      });

      jest.spyOn(Case, "findById").mockImplementation((id) => {
        if (id === "c1") {
          return {
            select: jest.fn().mockResolvedValue({
              _id: "c1",
              lawyer: TEST_LAWYER_ID,
              status: "open",
            }),
          };
        }
        return Promise.resolve(null);
      });

      jest.spyOn(CaseMeeting, "create").mockResolvedValue(fakeMeeting);

      const res = await request(app)
        .post("/api/cases/c1/meetings")
        .set("Authorization", `Bearer ${lawyerToken}`)
        .send({
          date: "2026-04-09",
          time: "11:00",
          method: "online",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(fakeMeeting);
    });

    // missing required fields
    it("returns 400 when required fields missing", async () => {
      jest.spyOn(User, "findById").mockResolvedValue({
        _id: TEST_LAWYER_ID,
        role: "lawyer",
      });

      const res = await request(app)
        .post("/api/cases/c1/meetings")
        .set("Authorization", `Bearer ${lawyerToken}`)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  // GET /api/cases/:id/meetings
  describe("GET /api/cases/:id/meetings", () => {
    it("should get meetings for a case", async () => {
      const fakeMeetings = [{ _id: "m1" }, { _id: "m2" }];

      // mock user lookup
      jest.spyOn(User, "findById").mockResolvedValue({
        _id: TEST_USER_ID,
        role: "user",
      });

      // mock Case.findById used by service to authorize access
      jest.spyOn(Case, "findById").mockImplementation((id) => {
        if (id === "r1") {
          return {
            select: jest.fn().mockResolvedValue({
              _id: "r1",
              user: TEST_USER_ID,
              lawyer: TEST_LAWYER_ID,
            }),
          };
        }
        return Promise.resolve(null);
      });

      // mock CaseMeeting.find (used by service) to return meetings
      jest.spyOn(CaseMeeting, "find").mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(fakeMeetings),
        }),
      });

      const res = await request(app)
        .get("/api/cases/r1/meetings")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
    });
  });
});

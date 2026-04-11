import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";

import User from "../../../models/userModel.js";
import AuthorityProfile from "../../../models/authorityProfileModel.js";

jest.unstable_mockModule("../../../services/civilIssues/civilIssueService.js", () => ({
  createIssue: jest.fn(),
  getIssuesByReporter: jest.fn(),
  getIssuesAssignedTo: jest.fn(),
  getAdminCivilIssues: jest.fn(),
  getAdminCivilIssueStats: jest.fn(),
  getCategoryStats: jest.fn(),
  getIssueById: jest.fn(),
  updateIssue: jest.fn(),
  deleteIssue: jest.fn(),
  updateIssueStatus: jest.fn(),
  rejectIssue: jest.fn(),
  getPublicIssues: jest.fn(),
}));

const civilIssueService = await import("../../../services/civilIssues/civilIssueService.js");
const civilIssueRoutes = (await import("../civilIssueRoutes.js")).default;

const JWT_SECRET = "test-secret";
const USER_ID = "user1";
const AUTHORITY_ID = "authority1";
const ADMIN_ID = "admin1";

process.env.JWT_SECRET = JWT_SECRET;

const userToken = jwt.sign({ id: USER_ID }, JWT_SECRET);
const authorityToken = jwt.sign({ id: AUTHORITY_ID }, JWT_SECRET);
const adminToken = jwt.sign({ id: ADMIN_ID }, JWT_SECRET);

const validSubmitPayload = {
  category: "land",
  subject: "Road collapse near school",
  district: "Colombo",
  exactLocation: "Bambalapitiya",
  postalAreaOrZip: "00400",
  whatHappened: "A road segment collapsed after heavy rain.",
  whenItHappened: "2026-04-10",
  impactOnPeople: "Traffic is blocked and school buses are delayed.",
  contactNumber: "0771234567",
  isPublic: true,
};

describe("Civil Issue Routes", () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(User, "findById").mockImplementation(async (id) => {
      if (id === USER_ID) {
        return { _id: USER_ID, role: "user" };
      }

      if (id === AUTHORITY_ID) {
        return { _id: AUTHORITY_ID, role: "authority" };
      }

      if (id === ADMIN_ID) {
        return { _id: ADMIN_ID, role: "admin" };
      }

      return null;
    });

    app = express();
    app.use(express.json());
    app.use("/api/civil-issues", civilIssueRoutes);
  });

  describe("GET /api/civil-issues/public", () => {
    it("returns public issues without authentication", async () => {
      const fakeResult = {
        items: [{ _id: "issue1" }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasNextPage: false },
      };

      civilIssueService.getPublicIssues.mockResolvedValue(fakeResult);

      const res = await request(app).get("/api/civil-issues/public");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(fakeResult.items);
      expect(res.body.pagination).toEqual(fakeResult.pagination);
      expect(civilIssueService.getPublicIssues).toHaveBeenCalledWith({
        category: undefined,
        district: undefined,
        location: undefined,
        postcode: undefined,
        page: 1,
        limit: 10,
      });
    });
  });

  describe("POST /api/civil-issues", () => {
    it("submits a civil issue and returns 201", async () => {
      const fakeIssue = { _id: "issue1", status: "pending" };
      civilIssueService.createIssue.mockResolvedValue(fakeIssue);

      const res = await request(app)
        .post("/api/civil-issues")
        .set("Authorization", `Bearer ${userToken}`)
        .send(validSubmitPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Civil issue submitted and routed successfully.");
      expect(res.body.data).toEqual(fakeIssue);
      expect(civilIssueService.createIssue).toHaveBeenCalledWith({
        reporterId: USER_ID,
        category: validSubmitPayload.category,
        subject: validSubmitPayload.subject,
        district: validSubmitPayload.district,
        exactLocation: validSubmitPayload.exactLocation,
        postalAreaOrZip: validSubmitPayload.postalAreaOrZip,
        whatHappened: validSubmitPayload.whatHappened,
        whenItHappened: validSubmitPayload.whenItHappened,
        impactOnPeople: validSubmitPayload.impactOnPeople,
        contactNumber: validSubmitPayload.contactNumber,
        attachments: [],
        isPublic: true,
      });
    });

    it("returns 400 for invalid submit payload", async () => {
      const res = await request(app)
        .post("/api/civil-issues")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ category: "land", subject: "   ", district: "Colombo" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("subject must be a non-empty string.");
      expect(civilIssueService.createIssue).not.toHaveBeenCalled();
    });

    it("returns 403 when a non-user role tries to submit", async () => {
      const res = await request(app)
        .post("/api/civil-issues")
        .set("Authorization", `Bearer ${authorityToken}`)
        .send(validSubmitPayload);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe("Access denied");
      expect(civilIssueService.createIssue).not.toHaveBeenCalled();
    });
  });

  describe("GET /api/civil-issues/my", () => {
    it("returns the logged-in user's issues", async () => {
      const fakeIssues = [{ _id: "issue1" }];
      civilIssueService.getIssuesByReporter.mockResolvedValue(fakeIssues);

      const res = await request(app)
        .get("/api/civil-issues/my")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(fakeIssues);
      expect(civilIssueService.getIssuesByReporter).toHaveBeenCalledWith(USER_ID);
    });
  });

  describe("GET /api/civil-issues/assigned", () => {
    it("returns issues assigned to the authenticated authority", async () => {
      const fakeIssues = [{ _id: "issue2" }];
      civilIssueService.getIssuesAssignedTo.mockResolvedValue(fakeIssues);

      const res = await request(app)
        .get("/api/civil-issues/assigned?district=Colombo")
        .set("Authorization", `Bearer ${authorityToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(fakeIssues);
      expect(civilIssueService.getIssuesAssignedTo).toHaveBeenCalledWith(AUTHORITY_ID, "Colombo");
    });
  });

  describe("GET /api/civil-issues/admin", () => {
    it("returns the admin triage queue", async () => {
      const fakeIssues = [{ _id: "other1" }];
      civilIssueService.getAdminCivilIssues.mockResolvedValue(fakeIssues);

      const res = await request(app)
        .get("/api/civil-issues/admin?status=pending")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(fakeIssues);
      expect(civilIssueService.getAdminCivilIssues).toHaveBeenCalledWith("pending");
    });

    it("returns 403 for a non-admin user", async () => {
      const res = await request(app)
        .get("/api/civil-issues/admin")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe("Access denied");
    });
  });

  describe("GET /api/civil-issues/admin/stats", () => {
    it("returns admin triage counts", async () => {
      const fakeStats = { pending: 4, in_progress: 3, resolved: 2, rejected: 1 };
      civilIssueService.getAdminCivilIssueStats.mockResolvedValue(fakeStats);

      const res = await request(app)
        .get("/api/civil-issues/admin/stats")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(fakeStats);
      expect(civilIssueService.getAdminCivilIssueStats).toHaveBeenCalled();
    });
  });

  describe("GET /api/civil-issues/authority/stats", () => {
    it("returns authority category stats", async () => {
      const fakeStats = { pending: 2, in_progress: 1, resolved: 5, rejected: 0 };
      jest.spyOn(AuthorityProfile, "findOne").mockResolvedValue({ managedCategory: "land" });
      civilIssueService.getCategoryStats.mockResolvedValue(fakeStats);

      const res = await request(app)
        .get("/api/civil-issues/authority/stats")
        .set("Authorization", `Bearer ${authorityToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(fakeStats);
      expect(civilIssueService.getCategoryStats).toHaveBeenCalledWith("land");
    });
  });

  describe("GET /api/civil-issues/:id", () => {
    it("returns a civil issue by id", async () => {
      const fakeIssue = { _id: "issue1", category: "land" };
      civilIssueService.getIssueById.mockResolvedValue(fakeIssue);

      const res = await request(app)
        .get("/api/civil-issues/issue1")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(fakeIssue);
      expect(civilIssueService.getIssueById).toHaveBeenCalledWith({
        issueId: "issue1",
        currentUserId: USER_ID,
        currentUserRole: "user",
      });
    });

    it("returns 404 when the service reports a missing issue", async () => {
      const error = new Error("Civil issue not found.");
      error.statusCode = 404;
      civilIssueService.getIssueById.mockRejectedValue(error);

      const res = await request(app)
        .get("/api/civil-issues/missing")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Civil issue not found.");
    });
  });

  describe("PATCH /api/civil-issues/:id/status", () => {
    it("updates the status for an assigned authority", async () => {
      const fakeIssue = { _id: "issue1", status: "in_progress" };
      civilIssueService.updateIssueStatus.mockResolvedValue(fakeIssue);

      const res = await request(app)
        .patch("/api/civil-issues/issue1/status")
        .set("Authorization", `Bearer ${authorityToken}`)
        .send({
          status: "in_progress",
          note: "Started review",
        });

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(fakeIssue);
      expect(civilIssueService.updateIssueStatus).toHaveBeenCalledWith({
        issueId: "issue1",
        authorityId: AUTHORITY_ID,
        actorRole: "authority",
        status: "in_progress",
        note: "Started review",
        resolutionSummary: undefined,
      });
    });

    it("returns 400 when required status is missing", async () => {
      const res = await request(app)
        .patch("/api/civil-issues/issue1/status")
        .set("Authorization", `Bearer ${authorityToken}`)
        .send({ note: "Missing status" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("status is required.");
      expect(civilIssueService.updateIssueStatus).not.toHaveBeenCalled();
    });
  });

  describe("PATCH /api/civil-issues/:id/reject", () => {
    it("rejects a civil issue with a note", async () => {
      const fakeIssue = { _id: "issue1", status: "rejected" };
      civilIssueService.rejectIssue.mockResolvedValue(fakeIssue);

      const res = await request(app)
        .patch("/api/civil-issues/issue1/reject")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ note: "Needs more evidence" });

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(fakeIssue);
      expect(civilIssueService.rejectIssue).toHaveBeenCalledWith({
        issueId: "issue1",
        actorId: ADMIN_ID,
        actorRole: "admin",
        note: "Needs more evidence",
      });
    });
  });

  describe("PATCH /api/civil-issues/:id", () => {
    it("updates a civil issue while pending", async () => {
      const fakeIssue = { _id: "issue1", subject: "Updated subject" };
      civilIssueService.updateIssue.mockResolvedValue(fakeIssue);

      const res = await request(app)
        .patch("/api/civil-issues/issue1")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          subject: "Updated subject",
          retainedAttachments: ["https://cdn.example.com/existing.jpg"],
          isPublic: false,
        });

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(fakeIssue);
      expect(civilIssueService.updateIssue).toHaveBeenCalledWith({
        issueId: "issue1",
        reporterId: USER_ID,
        subject: "Updated subject",
        district: undefined,
        exactLocation: undefined,
        postalAreaOrZip: undefined,
        whatHappened: undefined,
        whenItHappened: undefined,
        impactOnPeople: undefined,
        contactNumber: undefined,
        isPublic: false,
        newAttachments: [],
        retainedAttachments: ["https://cdn.example.com/existing.jpg"],
      });
    });
  });

  describe("DELETE /api/civil-issues/:id", () => {
    it("deletes a civil issue owned by the citizen", async () => {
      civilIssueService.deleteIssue.mockResolvedValue(undefined);

      const res = await request(app)
        .delete("/api/civil-issues/issue1")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Civil issue deleted successfully.");
      expect(civilIssueService.deleteIssue).toHaveBeenCalledWith({
        issueId: "issue1",
        reporterId: USER_ID,
      });
    });
  });
});
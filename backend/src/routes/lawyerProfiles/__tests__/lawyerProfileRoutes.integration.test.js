import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import lawyerProfileRoutes from "../lawyerProfileRoutes.js";
import errorMiddleware from "../../../middleware/errorMiddleware.js";
import User from "../../../models/userModel.js";
import LawyerProfile from "../../../models/lawyerProfiles/lawyerProfileModel.js";

const JWT_SECRET = "test-secret";
const ADMIN_ID = "507f1f77bcf86cd799439001";
const LAWYER_ID = "507f1f77bcf86cd799439011";
const USER_ID = "507f1f77bcf86cd799439021";
const TARGET_LAWYER_ID = "507f1f77bcf86cd799439031";
const PROFILE_ID = "507f1f77bcf86cd799439041";

process.env.JWT_SECRET = JWT_SECRET;

const adminToken = jwt.sign({ id: ADMIN_ID }, JWT_SECRET);
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

const makeProfile = (overrides = {}) => ({
  _id: PROFILE_ID,
  user: makeUser(),
  expertise: "civil",
  verificationStatus: "approved",
  barRegistrationNumber: "BRN-100",
  memberships: ["BASL"],
  isFree: false,
  basicInfo: {
    professionalTitle: "Attorney-at-Law",
    contactInfo: { phone: "0712345678", location: "Colombo" },
    bio: "This is a sufficiently long biography for integration test assertions.",
    languages: ["English"],
    practiceAreas: [{ name: "civil", level: "intermediate" }],
  },
  experience: { totalYearsExperience: 8, workHistory: [] },
  educationQualifications: {
    education: [{ degree: "LLB", institute: "UoC", graduationYear: 2016 }],
    certifications: [],
  },
  profileCompleted: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
  ...overrides,
});

const mockPopulateSortLean = (result) => ({
  populate: jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue(result),
    }),
  }),
});

const mockPopulateLean = (result) => ({
  populate: jest.fn().mockReturnValue({
    lean: jest.fn().mockResolvedValue(result),
  }),
});

describe("Lawyer Profile Routes", () => {
  let app;

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();

    app = express();
    app.use(express.json());
    app.use("/api/lawyer-profile", lawyerProfileRoutes);
    app.use(errorMiddleware);
  });

  describe("GET /api/lawyer-profile", () => {
    it("returns all lawyer profiles for public browsing", async () => {
      jest.spyOn(LawyerProfile, "find").mockReturnValue(
        mockPopulateSortLean([makeProfile()]),
      );

      const res = await request(app).get("/api/lawyer-profile");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(Array.isArray(res.body.lawyerProfiles)).toBe(true);
    });
  });

  describe("GET /api/lawyer-profile/approved", () => {
    it("applies approved listing filters and returns results", async () => {
      jest.spyOn(LawyerProfile, "find").mockReturnValue(
        mockPopulateSortLean([makeProfile({ verificationStatus: "approved", isFree: true })]),
      );

      const res = await request(app)
        .get("/api/lawyer-profile/approved")
        .query({ search: "attorney", expertise: "civil", isFree: "true" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(LawyerProfile.find).toHaveBeenCalledWith({
        verificationStatus: "approved",
        expertise: "civil",
        isFree: true,
      });
    });
  });

  describe("GET /api/lawyer-profile/me", () => {
    it("returns 401 when token is missing", async () => {
      const res = await request(app).get("/api/lawyer-profile/me");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Not authorized, no token");
    });

    it("returns 403 when authenticated user is not a lawyer", async () => {
      jest.spyOn(User, "findById").mockResolvedValue(makeUser({ _id: USER_ID, role: "user" }));

      const res = await request(app)
        .get("/api/lawyer-profile/me")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Access denied");
    });

    it("returns logged lawyer profile", async () => {
      jest.spyOn(User, "findById").mockResolvedValue(makeUser({ _id: LAWYER_ID, role: "lawyer" }));
      jest.spyOn(LawyerProfile, "findOne").mockReturnValue(
        mockPopulateLean(makeProfile({ user: makeUser({ _id: LAWYER_ID }) })),
      );

      const res = await request(app)
        .get("/api/lawyer-profile/me")
        .set("Authorization", `Bearer ${lawyerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.lawyerProfile.user.role).toBe("lawyer");
    });
  });

  describe("PUT /api/lawyer-profile/me", () => {
    it("returns 400 when request body is empty", async () => {
      jest.spyOn(User, "findById").mockResolvedValue(makeUser({ _id: LAWYER_ID, role: "lawyer" }));

      const res = await request(app)
        .put("/api/lawyer-profile/me")
        .set("Authorization", `Bearer ${lawyerToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Request body cannot be empty");
    });

    it("returns 400 when invalid fields are sent", async () => {
      jest.spyOn(User, "findById").mockResolvedValue(makeUser({ _id: LAWYER_ID, role: "lawyer" }));

      const res = await request(app)
        .put("/api/lawyer-profile/me")
        .set("Authorization", `Bearer ${lawyerToken}`)
        .send({ invalidField: "x" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Request contains invalid fields");
    });

    it("updates profile for authenticated lawyer", async () => {
      const userFindSpy = jest.spyOn(User, "findById").mockResolvedValue(
        makeUser({ _id: LAWYER_ID, role: "lawyer" }),
      );

      const save = jest.fn().mockResolvedValue(true);
      const profileDoc = {
        user: LAWYER_ID,
        verificationStatus: "pending",
        basicInfo: {
          professionalTitle: "Attorney-at-Law",
          contactInfo: { phone: "0712345678", location: "Colombo" },
          bio: "A".repeat(60),
          practiceAreas: [{ name: "civil", level: "intermediate" }],
        },
        experience: { totalYearsExperience: 6, workHistory: [] },
        educationQualifications: {
          education: [{ degree: "LLB", institute: "UoC", graduationYear: 2017 }],
          certifications: [],
        },
        memberships: ["BASL"],
        expertise: "civil",
        barRegistrationNumber: "BRN-901",
        isFree: false,
        save,
      };

      jest.spyOn(LawyerProfile, "findOne").mockResolvedValue(profileDoc);

      const res = await request(app)
        .put("/api/lawyer-profile/me")
        .set("Authorization", `Bearer ${lawyerToken}`)
        .send({
          basicInfo: {
            bio: "A".repeat(60),
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Lawyer profile updated successfully");
      expect(userFindSpy).toHaveBeenCalled();
      expect(save).toHaveBeenCalled();
    });
  });

  describe("GET /api/lawyer-profile/:id", () => {
    it("returns 400 for invalid id format", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(false);

      const res = await request(app).get("/api/lawyer-profile/bad-id");

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid ID format");
    });

    it("returns profile by id", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      jest.spyOn(LawyerProfile, "findOne").mockReturnValue(
        mockPopulateLean(makeProfile()),
      );

      const res = await request(app).get(`/api/lawyer-profile/${PROFILE_ID}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.lawyerProfile.id).toBe(PROFILE_ID);
    });
  });

  describe("GET /api/lawyer-profile/admin/lawyers", () => {
    it("returns 401 when token is missing", async () => {
      const res = await request(app).get("/api/lawyer-profile/admin/lawyers");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Not authorized, no token");
    });

    it("returns 403 when role is not admin", async () => {
      jest.spyOn(User, "findById").mockResolvedValue(makeUser({ _id: USER_ID, role: "lawyer" }));

      const res = await request(app)
        .get("/api/lawyer-profile/admin/lawyers")
        .set("Authorization", `Bearer ${lawyerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Access denied");
    });

    it("returns admin review list and does not hit getById path", async () => {
      const isValidSpy = jest.spyOn(mongoose.Types.ObjectId, "isValid");
      jest.spyOn(User, "findById").mockResolvedValue(makeUser({ _id: ADMIN_ID, role: "admin" }));
      jest.spyOn(LawyerProfile, "find").mockReturnValue(
        mockPopulateSortLean([makeProfile({ verificationStatus: "pending" })]),
      );

      const res = await request(app)
        .get("/api/lawyer-profile/admin/lawyers")
        .set("Authorization", `Bearer ${adminToken}`)
        .query({ verificationStatus: "pending", profileCompleted: "true" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(LawyerProfile.find).toHaveBeenCalledWith({
        verificationStatus: "pending",
        profileCompleted: true,
      });
      expect(isValidSpy).not.toHaveBeenCalled();
    });
  });

  describe("PATCH /api/lawyer-profile/admin/lawyers/:userId/verification-status", () => {
    it("returns 400 when body contains invalid fields", async () => {
      jest.spyOn(User, "findById").mockResolvedValue(makeUser({ _id: ADMIN_ID, role: "admin" }));

      const res = await request(app)
        .patch(`/api/lawyer-profile/admin/lawyers/${TARGET_LAWYER_ID}/verification-status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ verificationStatus: "approved", extra: true });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Request contains invalid fields");
    });

    it("updates lawyer verification status successfully", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      jest.spyOn(User, "findById").mockImplementation((id) => {
        if (id === ADMIN_ID) {
          return Promise.resolve(makeUser({ _id: ADMIN_ID, role: "admin" }));
        }

        if (id === TARGET_LAWYER_ID) {
          return Promise.resolve(makeUser({ _id: TARGET_LAWYER_ID, role: "lawyer" }));
        }

        return Promise.resolve(null);
      });

      const save = jest.fn().mockResolvedValue(true);
      jest.spyOn(LawyerProfile, "findOne").mockResolvedValue({
        _id: PROFILE_ID,
        user: TARGET_LAWYER_ID,
        profileCompleted: true,
        barRegistrationNumber: "BRN-500",
        verificationStatus: "pending",
        save,
      });

      jest.spyOn(LawyerProfile, "findById").mockReturnValue(
        mockPopulateLean(makeProfile({
          _id: PROFILE_ID,
          user: makeUser({ _id: TARGET_LAWYER_ID, role: "lawyer" }),
          verificationStatus: "approved",
          profileCompleted: true,
          barRegistrationNumber: "BRN-500",
        })),
      );

      const res = await request(app)
        .patch(`/api/lawyer-profile/admin/lawyers/${TARGET_LAWYER_ID}/verification-status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ verificationStatus: "approved" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Lawyer verification status updated successfully");
      expect(save).toHaveBeenCalled();
    });
  });
});

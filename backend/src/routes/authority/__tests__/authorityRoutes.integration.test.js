import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";

import authorityRoutes from "../authorityRoutes.js";
import AuthorityProfile from "../../../models/authorityProfileModel.js";
import User from "../../../models/userModel.js";

const JWT_SECRET = "test-secret";
const ADMIN_ID = "admin-user-id";
const USER_ID = "normal-user-id";

process.env.JWT_SECRET = JWT_SECRET;

const adminToken = jwt.sign({ id: ADMIN_ID }, JWT_SECRET);
const userToken = jwt.sign({ id: USER_ID }, JWT_SECRET);

describe("Authority Routes", () => {
  let app;

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();

    app = express();
    app.use(express.json());
    app.use("/api/authority-profiles", authorityRoutes);
  });

  describe("GET /api/authority-profiles/admin", () => {
    it("returns authority profiles for admin", async () => {
      const fakeProfiles = [{ _id: "p1" }, { _id: "p2" }];

      jest.spyOn(User, "findById").mockImplementation(async (id) => {
        if (id === ADMIN_ID) {
          return { _id: ADMIN_ID, role: "admin" };
        }
        return null;
      });

      jest.spyOn(AuthorityProfile, "find").mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(fakeProfiles),
        }),
      });

      const res = await request(app)
        .get("/api/authority-profiles/admin")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data).toEqual(fakeProfiles);
    });

    it("returns 403 for non-admin", async () => {
      jest.spyOn(User, "findById").mockImplementation(async (id) => {
        if (id === USER_ID) {
          return { _id: USER_ID, role: "user" };
        }
        return null;
      });

      const res = await request(app)
        .get("/api/authority-profiles/admin")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Access denied");
    });

    it("returns 401 when token is missing", async () => {
      const res = await request(app).get("/api/authority-profiles/admin");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Not authorized, no token");
    });
  });

  describe("PATCH /api/authority-profiles/:id/password", () => {
    it("updates authority password for admin with valid payload", async () => {
      const saveMock = jest.fn().mockResolvedValue(true);

      jest.spyOn(User, "findById").mockImplementation(async (id) => {
        if (id === ADMIN_ID) {
          return { _id: ADMIN_ID, role: "admin" };
        }

        if (id === "authority-user-id") {
          return { _id: "authority-user-id", password: "old", save: saveMock };
        }

        return null;
      });

      jest.spyOn(AuthorityProfile, "findById").mockResolvedValue({
        _id: "profile-1",
        user: "authority-user-id",
      });

      const res = await request(app)
        .patch("/api/authority-profiles/profile-1/password")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ password: "newpassword123" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Password updated successfully.");
      expect(saveMock).toHaveBeenCalled();
    });

    it("returns 400 for short password", async () => {
      jest.spyOn(User, "findById").mockImplementation(async (id) => {
        if (id === ADMIN_ID) {
          return { _id: ADMIN_ID, role: "admin" };
        }
        return null;
      });

      const res = await request(app)
        .patch("/api/authority-profiles/profile-1/password")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ password: "short" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Password must be at least 8 characters.");
    });

    it("returns 404 when authority profile is not found", async () => {
      jest.spyOn(User, "findById").mockImplementation(async (id) => {
        if (id === ADMIN_ID) {
          return { _id: ADMIN_ID, role: "admin" };
        }
        return null;
      });

      jest.spyOn(AuthorityProfile, "findById").mockResolvedValue(null);

      const res = await request(app)
        .patch("/api/authority-profiles/profile-404/password")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ password: "validpass123" });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Authority profile not found.");
    });

    it("returns 404 when associated user is not found", async () => {
      jest.spyOn(User, "findById").mockImplementation(async (id) => {
        if (id === ADMIN_ID) {
          return { _id: ADMIN_ID, role: "admin" };
        }

        if (id === "missing-user") {
          return null;
        }

        return null;
      });

      jest.spyOn(AuthorityProfile, "findById").mockResolvedValue({
        _id: "profile-1",
        user: "missing-user",
      });

      const res = await request(app)
        .patch("/api/authority-profiles/profile-1/password")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ password: "validpass123" });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Associated user not found.");
    });
  });

  describe("DELETE /api/authority-profiles/:id", () => {
    it("deletes authority profile and associated account for admin", async () => {
      jest.spyOn(User, "findById").mockImplementation(async (id) => {
        if (id === ADMIN_ID) {
          return { _id: ADMIN_ID, role: "admin" };
        }
        return null;
      });

      jest.spyOn(AuthorityProfile, "findById").mockResolvedValue({
        _id: "profile-1",
        user: "authority-user-id",
      });

      const deleteUserSpy = jest.spyOn(User, "findByIdAndDelete").mockResolvedValue(true);
      const deleteProfileSpy = jest.spyOn(AuthorityProfile, "findByIdAndDelete").mockResolvedValue(true);

      const res = await request(app)
        .delete("/api/authority-profiles/profile-1")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Authority and associated account deleted successfully.");
      expect(deleteUserSpy).toHaveBeenCalledWith("authority-user-id");
      expect(deleteProfileSpy).toHaveBeenCalledWith("profile-1");
    });

    it("returns 404 when authority profile is missing", async () => {
      jest.spyOn(User, "findById").mockImplementation(async (id) => {
        if (id === ADMIN_ID) {
          return { _id: ADMIN_ID, role: "admin" };
        }
        return null;
      });

      jest.spyOn(AuthorityProfile, "findById").mockResolvedValue(null);

      const res = await request(app)
        .delete("/api/authority-profiles/missing")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Authority profile not found.");
    });
  });
});

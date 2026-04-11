import { jest } from "@jest/globals";
import mongoose from "mongoose";

import User from "../../../models/userModel.js";
import LawyerProfile from "../../../models/lawyerProfiles/lawyerProfileModel.js";
import {
  findAllLawyerProfiles,
  findApprovedLawyerProfiles,
  findLawyerProfileById,
  findLawyerProfilesForAdmin,
  updateLawyerVerificationStatusByAdmin,
  findLawyerProfileByUser,
  updateLawyerProfileByUser,
} from "../lawyerProfileService.js";

const makeUser = (overrides = {}) => ({
  _id: "507f1f77bcf86cd799439011",
  name: "Jane Lawyer",
  email: "jane@example.com",
  role: "lawyer",
  profilePhoto: "https://cdn.example.com/custom-photo.png",
  ...overrides,
});

const makeLawyerProfile = (overrides = {}) => ({
  _id: "507f1f77bcf86cd799439012",
  user: makeUser(),
  expertise: "civil",
  verificationStatus: "pending",
  barRegistrationNumber: "BRN-100",
  memberships: ["BASL"],
  isFree: false,
  basicInfo: {
    professionalTitle: "Attorney-at-Law",
    contactInfo: { phone: "0712345678", location: "Colombo" },
    bio: "This is a sufficiently long biography text for validation and profile completion.",
    languages: ["English"],
    practiceAreas: [{ name: "civil", level: "intermediate" }],
  },
  experience: {
    totalYearsExperience: 5,
    workHistory: [],
  },
  educationQualifications: {
    education: [{ degree: "LLB", institute: "UoC", graduationYear: 2018 }],
    certifications: [{ title: "Mediation", issuer: "ABC", year: 2020 }],
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

describe("lawyerProfileService", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe("findAllLawyerProfiles", () => {
    it("returns mapped lawyer profiles", async () => {
      const raw = [makeLawyerProfile()];
      jest.spyOn(LawyerProfile, "find").mockReturnValue(mockPopulateSortLean(raw));

      const res = await findAllLawyerProfiles();

      expect(LawyerProfile.find).toHaveBeenCalledWith({});
      expect(res).toHaveLength(1);
      expect(res[0]).toMatchObject({
        id: raw[0]._id,
        expertise: "civil",
        user: { name: "Jane Lawyer", role: "lawyer" },
      });
    });
  });

  describe("findApprovedLawyerProfiles", () => {
    it("applies approved and optional filters", async () => {
      const raw = [makeLawyerProfile({ verificationStatus: "approved", isFree: true })];
      jest.spyOn(LawyerProfile, "find").mockReturnValue(mockPopulateSortLean(raw));

      const res = await findApprovedLawyerProfiles({
        expertise: "civil",
        isFree: "true",
      });

      expect(LawyerProfile.find).toHaveBeenCalledWith({
        verificationStatus: "approved",
        expertise: "civil",
        isFree: true,
      });
      expect(res).toHaveLength(1);
    });

    it("filters out rows with null populated user", async () => {
      const raw = [makeLawyerProfile({ user: null })];
      jest.spyOn(LawyerProfile, "find").mockReturnValue(mockPopulateSortLean(raw));

      const res = await findApprovedLawyerProfiles();

      expect(res).toEqual([]);
    });

    it("applies post-query search across name, title, and bio", async () => {
      const raw = [
        makeLawyerProfile({ basicInfo: { professionalTitle: "Senior Counsel", bio: "Civil specialist" } }),
        makeLawyerProfile({ _id: "507f1f77bcf86cd799439013", user: makeUser({ name: "Alex" }) }),
      ];
      jest.spyOn(LawyerProfile, "find").mockReturnValue(mockPopulateSortLean(raw));

      const res = await findApprovedLawyerProfiles({ search: "senior" });

      expect(res).toHaveLength(1);
      expect(res[0].basicInfo.professionalTitle).toBe("Senior Counsel");
    });
  });

  describe("findLawyerProfileById", () => {
    it("throws 400 for invalid id", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(false);

      await expect(findLawyerProfileById("bad-id")).rejects.toMatchObject({
        statusCode: 400,
        message: "Invalid ID format",
      });
    });

    it("throws 404 when profile does not exist", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      jest.spyOn(LawyerProfile, "findOne").mockReturnValue(mockPopulateLean(null));

      await expect(findLawyerProfileById("507f1f77bcf86cd799439011")).rejects.toMatchObject({
        statusCode: 404,
        message: "Lawyer profile not found",
      });
    });
  });

  describe("findLawyerProfilesForAdmin", () => {
    it("throws 400 for invalid verificationStatus filter", async () => {
      await expect(
        findLawyerProfilesForAdmin({ verificationStatus: "invalid" }),
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "Invalid verificationStatus filter",
      });
    });

    it("maps and filters admin list", async () => {
      const raw = [
        makeLawyerProfile({ verificationStatus: "pending" }),
        makeLawyerProfile({ _id: "507f1f77bcf86cd799439014", user: null }),
      ];
      jest.spyOn(LawyerProfile, "find").mockReturnValue(mockPopulateSortLean(raw));

      const res = await findLawyerProfilesForAdmin({
        verificationStatus: "pending",
        profileCompleted: "true",
      });

      expect(LawyerProfile.find).toHaveBeenCalledWith({
        verificationStatus: "pending",
        profileCompleted: true,
      });
      expect(res).toHaveLength(1);
    });
  });

  describe("updateLawyerVerificationStatusByAdmin", () => {
    it("throws 400 for invalid verification status value", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

      await expect(
        updateLawyerVerificationStatusByAdmin({
          userId: "507f1f77bcf86cd799439011",
          verificationStatus: "wrong",
        }),
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "Invalid verificationStatus value",
      });
    });

    it("throws 400 when approving incomplete profile", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      jest.spyOn(User, "findById").mockResolvedValue(makeUser());
      const save = jest.fn().mockResolvedValue(true);
      jest.spyOn(LawyerProfile, "findOne").mockResolvedValue(
        makeLawyerProfile({ profileCompleted: false, save }),
      );

      await expect(
        updateLawyerVerificationStatusByAdmin({
          userId: "507f1f77bcf86cd799439011",
          verificationStatus: "approved",
        }),
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "Cannot approve lawyer before completing profile",
      });
    });

    it("updates status and returns populated profile", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      jest.spyOn(User, "findById").mockResolvedValue(makeUser());

      const save = jest.fn().mockResolvedValue(true);
      const existing = makeLawyerProfile({
        _id: "507f1f77bcf86cd799439099",
        profileCompleted: true,
        barRegistrationNumber: "BRN-500",
        save,
      });

      jest.spyOn(LawyerProfile, "findOne").mockResolvedValue(existing);
      jest.spyOn(LawyerProfile, "findById").mockReturnValue(
        mockPopulateLean(makeLawyerProfile({ _id: "507f1f77bcf86cd799439099", verificationStatus: "approved" })),
      );

      const res = await updateLawyerVerificationStatusByAdmin({
        userId: "507f1f77bcf86cd799439011",
        verificationStatus: "approved",
      });

      expect(save).toHaveBeenCalled();
      expect(res.verificationStatus).toBe("approved");
    });
  });

  describe("findLawyerProfileByUser", () => {
    it("throws 401 when auth user is missing", async () => {
      await expect(findLawyerProfileByUser(null)).rejects.toMatchObject({
        statusCode: 401,
        message: "Unauthorized",
      });
    });

    it("creates profile when missing and returns mapped response", async () => {
      const auth = { _id: "507f1f77bcf86cd799439011" };
      jest.spyOn(User, "findById").mockResolvedValue(makeUser());
      jest.spyOn(LawyerProfile, "findOne").mockReturnValue(mockPopulateLean(null));
      jest
        .spyOn(LawyerProfile, "create")
        .mockResolvedValue({ _id: "507f1f77bcf86cd799439088" });
      jest.spyOn(LawyerProfile, "findById").mockReturnValue(
        mockPopulateLean(makeLawyerProfile({ _id: "507f1f77bcf86cd799439088" })),
      );

      const res = await findLawyerProfileByUser(auth);

      expect(LawyerProfile.create).toHaveBeenCalledWith({
        user: auth._id,
        verificationStatus: "pending",
      });
      expect(res.id).toBe("507f1f77bcf86cd799439088");
    });
  });

  describe("updateLawyerProfileByUser", () => {
    it("throws 400 when no valid update fields are provided", async () => {
      const auth = { _id: "507f1f77bcf86cd799439011" };
      jest.spyOn(User, "findById").mockResolvedValue(makeUser());
      jest.spyOn(LawyerProfile, "findOne").mockResolvedValue({
        basicInfo: {},
        experience: {},
        educationQualifications: {},
      });

      await expect(updateLawyerProfileByUser(auth, {})).rejects.toMatchObject({
        statusCode: 400,
        message: "No valid fields provided for update",
      });
    });

    it("accepts structured payload and saves", async () => {
      const auth = { _id: "507f1f77bcf86cd799439011" };
      jest.spyOn(User, "findById").mockResolvedValue(makeUser());

      const save = jest.fn().mockResolvedValue(true);
      const profileDoc = makeLawyerProfile({ save, profileCompleted: false });
      jest.spyOn(LawyerProfile, "findOne").mockResolvedValue(profileDoc);

      const payload = {
        basicInfo: {
          professionalTitle: "Senior Attorney",
          contactInfo: { phone: "0712345678", location: "Colombo" },
          bio: "A".repeat(60),
          practiceAreas: [{ name: "civil", level: "expert" }],
          isFree: true,
        },
        experience: {
          totalYearsExperience: 8,
          workHistory: [
            {
              lawFirm: "XYZ",
              startDate: "2020-01-01",
              endDate: "2022-01-01",
            },
          ],
        },
        educationQualifications: {
          education: [{ degree: "LLB", institute: "Uni", graduationYear: 2016 }],
        },
        expertise: "civil",
        memberships: ["BASL"],
        barRegistrationNumber: "BRN-600",
      };

      const res = await updateLawyerProfileByUser(auth, payload);

      expect(save).toHaveBeenCalled();
      expect(res.basicInfo.professionalTitle).toBe("Senior Attorney");
      expect(res.isFree).toBe(true);
    });

    it("maps legacy fields including yearsOfExperience and practiceAreas string[]", async () => {
      const auth = { _id: "507f1f77bcf86cd799439011" };
      jest.spyOn(User, "findById").mockResolvedValue(makeUser());

      const save = jest.fn().mockResolvedValue(true);
      const profileDoc = makeLawyerProfile({
        basicInfo: {},
        experience: {},
        educationQualifications: { education: [{ degree: "LLB" }] },
        memberships: ["BASL"],
        expertise: "civil",
        barRegistrationNumber: "BRN-700",
        save,
      });
      jest.spyOn(LawyerProfile, "findOne").mockResolvedValue(profileDoc);

      const payload = {
        professionalTitle: "Attorney",
        bio: "B".repeat(60),
        phone: "0712345678",
        location: "Colombo",
        officeAddress: "123 Main Street, Colombo",
        practiceAreas: ["civil"],
        yearsOfExperience: 10,
      };

      const res = await updateLawyerProfileByUser(auth, payload);

      expect(save).toHaveBeenCalled();
      expect(res.experience.totalYearsExperience).toBe(10);
      expect(res.basicInfo.practiceAreas[0]).toMatchObject({
        name: "civil",
        level: "intermediate",
      });
    });

    it("throws 422 on invalid Sri Lankan phone format", async () => {
      const auth = { _id: "507f1f77bcf86cd799439011" };
      jest.spyOn(User, "findById").mockResolvedValue(makeUser());
      jest.spyOn(LawyerProfile, "findOne").mockResolvedValue(
        makeLawyerProfile({
          basicInfo: {
            professionalTitle: "Attorney",
            bio: "C".repeat(60),
            contactInfo: { phone: "12345", location: "Colombo" },
            practiceAreas: [{ name: "civil", level: "intermediate" }],
          },
        }),
      );

      await expect(
        updateLawyerProfileByUser(auth, { basicInfo: { bio: "C".repeat(60) } }),
      ).rejects.toMatchObject({
        statusCode: 422,
        message: "Invalid Sri Lankan phone number format.",
      });
    });

    it("throws 422 when work history start date is not in the past", async () => {
      const auth = { _id: "507f1f77bcf86cd799439011" };
      jest.spyOn(User, "findById").mockResolvedValue(makeUser());

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);

      const profileDoc = makeLawyerProfile({
        experience: {
          totalYearsExperience: 2,
          workHistory: [{ startDate: futureDate.toISOString() }],
        },
      });
      jest.spyOn(LawyerProfile, "findOne").mockResolvedValue(profileDoc);

      await expect(
        updateLawyerProfileByUser(auth, { basicInfo: { bio: "D".repeat(60) } }),
      ).rejects.toMatchObject({
        statusCode: 422,
      });
    });

    it("maps duplicate barRegistrationNumber error to 409", async () => {
      const auth = { _id: "507f1f77bcf86cd799439011" };
      jest.spyOn(User, "findById").mockResolvedValue(makeUser());

      const duplicateErr = new Error("duplicate key");
      duplicateErr.code = 11000;
      duplicateErr.keyPattern = { barRegistrationNumber: 1 };

      const save = jest.fn().mockRejectedValue(duplicateErr);
      const profileDoc = makeLawyerProfile({ save });
      jest.spyOn(LawyerProfile, "findOne").mockResolvedValue(profileDoc);

      await expect(
        updateLawyerProfileByUser(auth, {
          basicInfo: { bio: "E".repeat(60) },
          barRegistrationNumber: "BRN-EXISTS",
        }),
      ).rejects.toMatchObject({
        statusCode: 409,
      });
    });

    it("documents current behavior for educationQualifications year validation path", async () => {
      const auth = { _id: "507f1f77bcf86cd799439011" };
      jest.spyOn(User, "findById").mockResolvedValue(makeUser());

      const save = jest.fn().mockResolvedValue(true);
      const profileDoc = makeLawyerProfile({
        save,
        educationQualifications: {
          education: [{ degree: "LLB", institute: "Uni", graduationYear: 1800 }],
          certifications: [{ title: "Cert", issuer: "Org", year: 1800 }],
        },
      });
      jest.spyOn(LawyerProfile, "findOne").mockResolvedValue(profileDoc);

      await expect(
        updateLawyerProfileByUser(auth, { basicInfo: { bio: "F".repeat(60) } }),
      ).resolves.toBe(profileDoc);
    });
  });
});

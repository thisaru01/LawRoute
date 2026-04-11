import { jest } from "@jest/globals";
import CivilIssue from "../../../models/civilIssues/civilIssueModel.js";
import AuthorityProfile from "../../../models/authorityProfileModel.js";
import User from "../../../models/userModel.js";

jest.unstable_mockModule("../../location/locationService.js", () => ({
    autocompleteSriLankaLocations: jest.fn(),
}));

const locationService = await import("../../location/locationService.js");
const {
    getCategoryStats,
    getIssuesByReporter,
    getIssuesAssignedTo,
    getAdminCivilIssues,
    getAdminCivilIssueStats,
    updateIssueStatus,
    getIssueById,
    createIssue,
    updateIssue,
    deleteIssue,
    rejectIssue,
    getPublicIssues,
} = await import("../civilIssueService.js");

describe("Civil Issue Service - Unit Tests", () => {
    beforeEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    describe("getCategoryStats()", () => {
        it("returns correct stats breakdown", async () => {
            const mockCounts = [10, 5, 20, 2];
            let callCount = 0;
            jest.spyOn(CivilIssue, "countDocuments").mockImplementation(() => {
                return Promise.resolve(mockCounts[callCount++]);
            });

            const result = await getCategoryStats("land");
            expect(result).toEqual({ pending: 10, in_progress: 5, resolved: 20, rejected: 2 });
        });

        it("returns null when category is missing", async () => {
            const result = await getCategoryStats();
            expect(result).toBeNull();
        });
    });

    describe("getIssuesByReporter()", () => {
        it("returns issues for a reporter", async () => {
            const fakeIssues = [{ _id: "i1" }];

            jest.spyOn(CivilIssue, "find").mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    sort: jest.fn().mockResolvedValue(fakeIssues),
                }),
            });

            const result = await getIssuesByReporter("r1");

            expect(CivilIssue.find).toHaveBeenCalledWith({ reporterId: "r1" });
            expect(result).toBe(fakeIssues);
        });
    });

    describe("getIssuesAssignedTo()", () => {
        it("filters by assigned authority and district when provided", async () => {
            const fakeIssues = [{ _id: "i2" }];

            jest.spyOn(CivilIssue, "find").mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    sort: jest.fn().mockResolvedValue(fakeIssues),
                }),
            });

            const result = await getIssuesAssignedTo("auth1", "Colombo");

            expect(CivilIssue.find).toHaveBeenCalledWith({ assignedTo: "auth1", district: "Colombo" });
            expect(result).toBe(fakeIssues);
        });
    });

    describe("getAdminCivilIssues()", () => {
        it("returns other-category issues with an optional status filter", async () => {
            const fakeIssues = [{ _id: "a1" }];

            jest.spyOn(CivilIssue, "find").mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    sort: jest.fn().mockResolvedValue(fakeIssues),
                }),
            });

            const result = await getAdminCivilIssues("pending");

            expect(CivilIssue.find).toHaveBeenCalledWith({ category: "other", status: "pending" });
            expect(result).toBe(fakeIssues);
        });
    });

    describe("getAdminCivilIssueStats()", () => {
        it("returns a count breakdown for the admin queue", async () => {
            jest.spyOn(CivilIssue, "countDocuments")
                .mockResolvedValueOnce(4)
                .mockResolvedValueOnce(3)
                .mockResolvedValueOnce(2)
                .mockResolvedValueOnce(1);

            const result = await getAdminCivilIssueStats();

            expect(result).toEqual({ pending: 4, in_progress: 3, resolved: 2, rejected: 1 });
        });
    });

    describe("updateIssueStatus()", () => {
        it("successfully updates status and adds to history", async () => {
            const authId = "auth1";
            const saveMock = jest.fn().mockResolvedValue(true);
            const fakeIssue = { 
                _id: "i1",
                assignedTo: authId, 
                status: "pending",
                statusHistory: [],
                save: saveMock,
                toString: () => "i1"
            };

            jest.spyOn(CivilIssue, "findById").mockReturnValue({
                populate: jest.fn().mockResolvedValue(fakeIssue)
            });

            const result = await updateIssueStatus({ 
                issueId: "i1", 
                authorityId: authId, 
                status: "in_progress",
                note: "Started triage"
            });

            expect(result.status).toBe("in_progress");
            expect(result.statusHistory).toHaveLength(1);
            expect(saveMock).toHaveBeenCalled();
        });

        it("throws 404 when issue is missing", async () => {
            jest.spyOn(CivilIssue, "findById").mockReturnValue({
                populate: jest.fn().mockResolvedValue(null),
            });

            await expect(
                updateIssueStatus({ issueId: "missing", authorityId: "auth1", status: "in_progress" })
            ).rejects.toMatchObject({ message: "Civil issue not found.", statusCode: 404 });
        });

        it("throws 403 when authority is not assigned", async () => {
            jest.spyOn(CivilIssue, "findById").mockReturnValue({
                populate: jest.fn().mockResolvedValue({
                    assignedTo: "other",
                    category: "land",
                    status: "pending",
                    reporterId: {},
                }),
            });

            await expect(
                updateIssueStatus({ issueId: "i1", authorityId: "auth1", status: "in_progress" })
            ).rejects.toMatchObject({ message: "Access denied. You are not assigned to this issue.", statusCode: 403 });
        });

        it("throws 400 when status is unchanged", async () => {
            jest.spyOn(CivilIssue, "findById").mockReturnValue({
                populate: jest.fn().mockResolvedValue({
                    assignedTo: "auth1",
                    category: "land",
                    status: "pending",
                    reporterId: {},
                }),
            });

            await expect(
                updateIssueStatus({ issueId: "i1", authorityId: "auth1", status: "pending" })
            ).rejects.toMatchObject({ message: "Issue is already in the requested status.", statusCode: 400 });
        });

        it("allows admin updates for other-category issues", async () => {
            const saveMock = jest.fn().mockResolvedValue(true);
            const fakeIssue = {
                assignedTo: "someone-else",
                category: "other",
                status: "pending",
                statusHistory: [],
                reporterId: {},
                save: saveMock,
            };

            jest.spyOn(CivilIssue, "findById").mockReturnValue({
                populate: jest.fn().mockResolvedValue(fakeIssue),
            });

            const result = await updateIssueStatus({
                issueId: "i1",
                authorityId: "admin1",
                actorRole: "admin",
                status: "resolved",
                resolutionSummary: "Fixed",
            });

            expect(result.status).toBe("resolved");
            expect(result.resolutionSummary).toBe("Fixed");
            expect(saveMock).toHaveBeenCalled();
        });
    });

    describe("getIssueById()", () => {
        it("allows access for the original reporter", async () => {
            const userId = "u1";
            const fakeIssue = { 
                reporterId: { _id: userId }, 
                assignedTo: { _id: "auth_id" },
                category: "land"
            };

            jest.spyOn(CivilIssue, "findById").mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(fakeIssue)
                })
            });

            const result = await getIssueById({ issueId: "i1", currentUserId: userId });
            expect(result).toBe(fakeIssue);
        });

        it("allows access for assigned authority", async () => {
            const authId = "auth1";
            const fakeIssue = {
                reporterId: { _id: "u1" },
                assignedTo: { _id: authId },
                category: "land",
            };

            jest.spyOn(CivilIssue, "findById").mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(fakeIssue)
                })
            });

            const result = await getIssueById({ issueId: "i1", currentUserId: authId });
            expect(result).toBe(fakeIssue);
        });

        it("allows admin access for other-category issues", async () => {
            const fakeIssue = {
                reporterId: { _id: "u1" },
                assignedTo: null,
                category: "other",
            };

            jest.spyOn(CivilIssue, "findById").mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(fakeIssue)
                })
            });

            const result = await getIssueById({ issueId: "i1", currentUserId: "admin1", currentUserRole: "admin" });
            expect(result).toBe(fakeIssue);
        });

        it("throws 404 when issue is missing", async () => {
            jest.spyOn(CivilIssue, "findById").mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(null)
                })
            });

            await expect(getIssueById({ issueId: "i1", currentUserId: "u1" }))
                .rejects.toMatchObject({ message: "Civil issue not found.", statusCode: 404 });
        });

        it("throws 403 when the user is unrelated", async () => {
            const fakeIssue = {
                reporterId: { _id: "u2" },
                assignedTo: { _id: "auth2" },
                category: "land",
            };

            jest.spyOn(CivilIssue, "findById").mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(fakeIssue)
                })
            });

            await expect(getIssueById({ issueId: "i1", currentUserId: "u1" }))
                .rejects.toMatchObject({ message: "Access denied.", statusCode: 403 });
        });
    });

    describe("createIssue()", () => {
        const standardPayload = {
            reporterId: "r1",
            category: "land",
            subject: "Road issue",
            district: "Colombo",
            exactLocation: "Bambalapitiya",
            postalAreaOrZip: "00400",
            whatHappened: "Pothole",
            whenItHappened: "2026-04-10"
        };

        const mockLocationMatch = () => {
            locationService.autocompleteSriLankaLocations.mockResolvedValue({
                data: [
                    {
                        locationName: "Bambalapitiya",
                        district: "Colombo",
                        postcode: "00400",
                    },
                ],
            });
        };

        it("routes to department authority correctly", async () => {
            const authId = "auth_u1";
            mockLocationMatch();
            jest.spyOn(AuthorityProfile, "findOne").mockResolvedValue({ user: authId });
            jest.spyOn(CivilIssue, "create").mockResolvedValue({ _id: "new_id", ...standardPayload, assignedTo: authId });
            jest.spyOn(User, "findById").mockReturnValue({
                lean: jest.fn().mockResolvedValue(null)
            });

            const result = await createIssue(standardPayload);

            expect(result.assignedTo).toBe(authId);
            expect(CivilIssue.create).toHaveBeenCalled();
        });

        it("routes to NULL when category is 'other'", async () => {
            const adminPayload = { ...standardPayload, category: "other" };
            mockLocationMatch();
            jest.spyOn(CivilIssue, "create").mockResolvedValue({ _id: "adm_id", ...adminPayload, assignedTo: null });
            jest.spyOn(User, "findById").mockReturnValue({
                lean: jest.fn().mockResolvedValue(null)
            });

            const result = await createIssue(adminPayload);

            expect(result.assignedTo).toBeNull();
        });

        it("throws 404 when no authority found for category", async () => {
            jest.spyOn(AuthorityProfile, "findOne").mockResolvedValue(null);

            await expect(createIssue(standardPayload))
                .rejects.toMatchObject({ message: "No responsible authority found for this category.", statusCode: 404 });
        });

        it("throws 400 when location does not match district", async () => {
            jest.spyOn(AuthorityProfile, "findOne").mockResolvedValue({ user: "auth_u1" });
            locationService.autocompleteSriLankaLocations.mockResolvedValue({
                data: [
                    {
                        locationName: "Bambalapitiya",
                        district: "Galle",
                        postcode: "00400",
                    },
                ],
            });

            await expect(createIssue(standardPayload)).rejects.toMatchObject({
                message: "Bambalapitiya does not appear to be in Colombo. Please verify the district or choose a matching location.",
                statusCode: 400,
            });
        });
    });

    describe("updateIssue()", () => {
        it("updates a pending issue and saves changes", async () => {
            const saveMock = jest.fn().mockResolvedValue(true);
            const fakeIssue = {
                reporterId: { _id: "r1" },
                status: "pending",
                category: "land",
                district: "Colombo",
                exactLocation: "Bambalapitiya",
                postalAreaOrZip: "00400",
                attachments: ["https://cdn.example.com/a.jpg"],
                save: saveMock,
            };

            jest.spyOn(CivilIssue, "findById").mockReturnValue({
                populate: jest.fn().mockResolvedValue(fakeIssue),
            });

            const result = await updateIssue({
                issueId: "i1",
                reporterId: "r1",
                subject: "Updated subject",
                isPublic: true,
                newAttachments: ["https://cdn.example.com/b.jpg"],
            });

            expect(saveMock).toHaveBeenCalled();
            expect(result.subject).toBe("Updated subject");
            expect(result.isPublic).toBe(true);
            expect(result.attachments).toEqual([
                "https://cdn.example.com/a.jpg",
                "https://cdn.example.com/b.jpg",
            ]);
        });

        it("throws 404 when issue is missing", async () => {
            jest.spyOn(CivilIssue, "findById").mockReturnValue({
                populate: jest.fn().mockResolvedValue(null),
            });

            await expect(updateIssue({ issueId: "missing", reporterId: "r1" }))
                .rejects.toMatchObject({ message: "Civil issue not found.", statusCode: 404 });
        });

        it("throws 403 when another user tries to edit", async () => {
            jest.spyOn(CivilIssue, "findById").mockReturnValue({
                populate: jest.fn().mockResolvedValue({
                    reporterId: { _id: "r2" },
                    status: "pending",
                }),
            });

            await expect(updateIssue({ issueId: "i1", reporterId: "r1" }))
                .rejects.toMatchObject({ message: "Access denied.", statusCode: 403 });
        });

        it("throws 400 when issue is no longer pending", async () => {
            jest.spyOn(CivilIssue, "findById").mockReturnValue({
                populate: jest.fn().mockResolvedValue({
                    reporterId: { _id: "r1" },
                    status: "resolved",
                }),
            });

            await expect(updateIssue({ issueId: "i1", reporterId: "r1" }))
                .rejects.toMatchObject({ message: "Issue can only be edited while it is pending.", statusCode: 400 });
        });
    });

    describe("deleteIssue()", () => {
        it("deletes when the reporter matches", async () => {
            const deleteOneMock = jest.fn().mockResolvedValue(true);

            jest.spyOn(CivilIssue, "findById").mockResolvedValue({
                reporterId: "r1",
                deleteOne: deleteOneMock,
            });

            await deleteIssue({ issueId: "i1", reporterId: "r1" });

            expect(deleteOneMock).toHaveBeenCalled();
        });

        it("throws 404 when issue is missing", async () => {
            jest.spyOn(CivilIssue, "findById").mockResolvedValue(null);

            await expect(deleteIssue({ issueId: "missing", reporterId: "r1" }))
                .rejects.toMatchObject({ message: "Civil issue not found.", statusCode: 404 });
        });

        it("throws 403 when a different reporter tries to delete", async () => {
            jest.spyOn(CivilIssue, "findById").mockResolvedValue({
                reporterId: "r2",
            });

            await expect(deleteIssue({ issueId: "i1", reporterId: "r1" }))
                .rejects.toMatchObject({ message: "Access denied.", statusCode: 403 });
        });
    });

    describe("rejectIssue()", () => {
        it("rejects an assigned issue and adds history", async () => {
            const saveMock = jest.fn().mockResolvedValue(true);
            const fakeIssue = {
                assignedTo: "auth1",
                category: "land",
                status: "pending",
                statusHistory: [],
                reporterId: {},
                save: saveMock,
            };

            jest.spyOn(CivilIssue, "findById").mockReturnValue({
                populate: jest.fn().mockResolvedValue(fakeIssue),
            });

            const result = await rejectIssue({
                issueId: "i1",
                actorId: "auth1",
                note: "Not enough detail",
            });

            expect(result.status).toBe("rejected");
            expect(result.statusHistory).toHaveLength(1);
            expect(saveMock).toHaveBeenCalled();
        });

        it("throws 403 when actor cannot reject", async () => {
            jest.spyOn(CivilIssue, "findById").mockReturnValue({
                populate: jest.fn().mockResolvedValue({
                    assignedTo: "auth2",
                    category: "land",
                    status: "pending",
                    reporterId: {},
                }),
            });

            await expect(rejectIssue({ issueId: "i1", actorId: "auth1" }))
                .rejects.toMatchObject({ message: "Access denied. You cannot reject this issue.", statusCode: 403 });
        });

        it("throws 400 when issue is already rejected", async () => {
            jest.spyOn(CivilIssue, "findById").mockReturnValue({
                populate: jest.fn().mockResolvedValue({
                    assignedTo: "auth1",
                    category: "land",
                    status: "rejected",
                    reporterId: {},
                }),
            });

            await expect(rejectIssue({ issueId: "i1", actorId: "auth1" }))
                .rejects.toMatchObject({ message: "Issue is already rejected.", statusCode: 400 });
        });

        it("allows admin rejection for other-category issues", async () => {
            const saveMock = jest.fn().mockResolvedValue(true);
            const fakeIssue = {
                assignedTo: "someone-else",
                category: "other",
                status: "pending",
                statusHistory: [],
                reporterId: {},
                save: saveMock,
            };

            jest.spyOn(CivilIssue, "findById").mockReturnValue({
                populate: jest.fn().mockResolvedValue(fakeIssue),
            });

            const result = await rejectIssue({
                issueId: "i1",
                actorId: "admin1",
                actorRole: "admin",
                note: "Needs review",
            });

            expect(result.status).toBe("rejected");
            expect(saveMock).toHaveBeenCalled();
        });
    });

    describe("getPublicIssues()", () => {
        it("prefers postcode filtering and returns pagination info", async () => {
            const fakeItems = [{ _id: "p1" }];

            jest.spyOn(CivilIssue, "countDocuments")
                .mockResolvedValueOnce(2)
                .mockResolvedValueOnce(2);

            jest.spyOn(CivilIssue, "find").mockReturnValue({
                select: jest.fn().mockReturnValue({
                    sort: jest.fn().mockReturnValue({
                        skip: jest.fn().mockReturnValue({
                            limit: jest.fn().mockResolvedValue(fakeItems),
                        }),
                    }),
                }),
            });

            const result = await getPublicIssues({ postcode: "00400", page: 2, limit: 5 });

            expect(CivilIssue.countDocuments).toHaveBeenNthCalledWith(1, {
                isPublic: true,
                postalAreaOrZip: { $regex: /00400/i },
            });
            expect(result.pagination).toEqual({
                page: 2,
                limit: 5,
                total: 2,
                totalPages: 1,
                hasNextPage: false,
            });
            expect(result.items).toBe(fakeItems);
        });

        it("falls back to location filtering when postcode has no matches", async () => {
            const fakeItems = [{ _id: "p2" }];

            jest.spyOn(CivilIssue, "countDocuments")
                .mockResolvedValueOnce(0)
                .mockResolvedValueOnce(1);

            jest.spyOn(CivilIssue, "find").mockReturnValue({
                select: jest.fn().mockReturnValue({
                    sort: jest.fn().mockReturnValue({
                        skip: jest.fn().mockReturnValue({
                            limit: jest.fn().mockResolvedValue(fakeItems),
                        }),
                    }),
                }),
            });

            const result = await getPublicIssues({ postcode: "99999", location: "Bambalapitiya" });

            expect(CivilIssue.countDocuments).toHaveBeenNthCalledWith(1, {
                isPublic: true,
                postalAreaOrZip: { $regex: /99999/i },
            });
            expect(CivilIssue.find).toHaveBeenCalledWith({
                isPublic: true,
                exactLocation: { $regex: /Bambalapitiya/i },
            });
            expect(result.pagination.total).toBe(1);
        });
    });
});

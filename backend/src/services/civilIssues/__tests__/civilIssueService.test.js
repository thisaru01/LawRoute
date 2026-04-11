import { jest } from "@jest/globals";
import CivilIssue from "../../../models/civilIssues/civilIssueModel.js";
import { getCategoryStats } from "../civilIssueService.js";

describe("Civil Issue Service - getCategoryStats", () => {
    beforeEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    describe("getCategoryStats unit tests", () => {
        it("returns correct stats breakdown when database returns counts", async () => {
            // Mock counts for [pending, in_progress, resolved, rejected]
            const mockCounts = [10, 5, 20, 2];
            let callCount = 0;

            // Mock CivilIssue.countDocuments
            const countSpy = jest.spyOn(CivilIssue, "countDocuments").mockImplementation(() => {
                return Promise.resolve(mockCounts[callCount++]);
            });

            const category = "land";
            const result = await getCategoryStats(category);

            // Verify result structure and data
            expect(result).toEqual({
                pending: 10,
                in_progress: 5,
                resolved: 20,
                rejected: 2
            });

            // Verify countDocuments was called for each status
            expect(countSpy).toHaveBeenCalledTimes(4);
            expect(countSpy).toHaveBeenNthCalledWith(1, { category, status: "pending" });
            expect(countSpy).toHaveBeenNthCalledWith(2, { category, status: "in_progress" });
            expect(countSpy).toHaveBeenNthCalledWith(3, { category, status: "resolved" });
            expect(countSpy).toHaveBeenNthCalledWith(4, { category, status: "rejected" });
        });

        it("returns all zeros when database has no records for the category", async () => {
            // Mock all zero counts
            jest.spyOn(CivilIssue, "countDocuments").mockResolvedValue(0);

            const category = "police";
            const result = await getCategoryStats(category);

            expect(result).toEqual({
                pending: 0,
                in_progress: 0,
                resolved: 0,
                rejected: 0
            });
        });

        it("returns null when no category is provided", async () => {
            const result = await getCategoryStats(null);
            expect(result).toBeNull();
        });

        it("propagates database errors to the caller", async () => {
            const dbError = new Error("Database connection failed");
            jest.spyOn(CivilIssue, "countDocuments").mockRejectedValue(dbError);

            await expect(getCategoryStats("public_services")).rejects.toThrow("Database connection failed");
        });
    });
});

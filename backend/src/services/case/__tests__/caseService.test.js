import { jest } from "@jest/globals";

import Case from "../../../models/case/caseModel.js";
import { getMyCases, getCaseById, closeCase } from "../caseService.js";

// Tests for listing cases for the current user
describe("getMyCases", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  // returns cases when role is lawyer
  it("returns cases for lawyer role", async () => {
    const fake = [{ _id: "c1" }];

    jest.spyOn(Case, "find").mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest
            .fn()
            .mockReturnValue({ sort: jest.fn().mockResolvedValue(fake) }),
        }),
      }),
    });

    const res = await getMyCases({ userId: "u1", role: "lawyer" });

    expect(Case.find).toHaveBeenCalledWith({ lawyer: "u1" });
    expect(res).toBe(fake);
  });

  // returns cases when role is citizen/user
  it("returns cases for citizen role", async () => {
    const fake = [{ _id: "c2" }];

    jest.spyOn(Case, "find").mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest
            .fn()
            .mockReturnValue({ sort: jest.fn().mockResolvedValue(fake) }),
        }),
      }),
    });

    const res = await getMyCases({ userId: "u2", role: "user" });

    expect(Case.find).toHaveBeenCalledWith({ user: "u2" });
    expect(res).toBe(fake);
  });

  // propagates DB errors
  it("propagates DB errors", async () => {
    jest.spyOn(Case, "find").mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockRejectedValue(new Error("db")),
          }),
        }),
      }),
    });

    await expect(getMyCases({ userId: "u1", role: "user" })).rejects.toThrow(
      "db",
    );
  });
});

// Tests for retrieving a single case
describe("getCaseById", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  // 404 when not found
  it("throws 404 when case not found", async () => {
    jest.spyOn(Case, "findById").mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest
          .fn()
          .mockReturnValue({ populate: jest.fn().mockResolvedValue(null) }),
      }),
    });

    await expect(
      getCaseById({ caseId: "no", currentUserId: "u1" }),
    ).rejects.toMatchObject({ message: "Case not found", statusCode: 404 });
  });

  // 403 when current user not related
  it("throws 403 when current user not related", async () => {
    const fake = { user: { _id: "a" }, lawyer: { _id: "b" } };
    jest.spyOn(Case, "findById").mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest
          .fn()
          .mockReturnValue({ populate: jest.fn().mockResolvedValue(fake) }),
      }),
    });

    await expect(
      getCaseById({ caseId: "c1", currentUserId: "x" }),
    ).rejects.toMatchObject({
      message: "You are not allowed to view this case",
      statusCode: 403,
    });
  });

  // returns when current user is the case user
  it("returns case when current user is the user", async () => {
    const fake = { user: { _id: "u1" }, lawyer: { _id: "l1" } };
    jest.spyOn(Case, "findById").mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest
          .fn()
          .mockReturnValue({ populate: jest.fn().mockResolvedValue(fake) }),
      }),
    });

    const res = await getCaseById({ caseId: "c1", currentUserId: "u1" });
    expect(res).toBe(fake);
  });

  // returns when current user is the assigned lawyer
  it("returns case when current user is the lawyer", async () => {
    const fake = { user: { _id: "u1" }, lawyer: { _id: "l1" } };
    jest.spyOn(Case, "findById").mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest
          .fn()
          .mockReturnValue({ populate: jest.fn().mockResolvedValue(fake) }),
      }),
    });

    const res = await getCaseById({ caseId: "c1", currentUserId: "l1" });
    expect(res).toBe(fake);
  });
});

// Tests for closing a case
describe("closeCase", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  // 404 when case not found
  it("throws 404 when case not found", async () => {
    jest.spyOn(Case, "findById").mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest
          .fn()
          .mockReturnValue({ populate: jest.fn().mockResolvedValue(null) }),
      }),
    });

    await expect(
      closeCase({ caseId: "no", currentUserId: "l1" }),
    ).rejects.toMatchObject({ message: "Case not found", statusCode: 404 });
  });

  // 403 when current user is not assigned lawyer
  it("throws 403 when current user is not assigned lawyer", async () => {
    const fake = { lawyer: { _id: "other" }, status: "open" };
    jest.spyOn(Case, "findById").mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest
          .fn()
          .mockReturnValue({ populate: jest.fn().mockResolvedValue(fake) }),
      }),
    });

    await expect(
      closeCase({ caseId: "c1", currentUserId: "l1" }),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  // 400 when already closed
  it("throws 400 when case already closed", async () => {
    const fake = { lawyer: { _id: "l1" }, status: "closed" };
    jest.spyOn(Case, "findById").mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest
          .fn()
          .mockReturnValue({ populate: jest.fn().mockResolvedValue(fake) }),
      }),
    });

    await expect(
      closeCase({ caseId: "c1", currentUserId: "l1" }),
    ).rejects.toMatchObject({
      message: "Case is already closed",
      statusCode: 400,
    });
  });

  // successful close
  it("closes case and saves when valid", async () => {
    const saveMock = jest.fn().mockResolvedValue(true);
    const fake = {
      _id: "c1",
      lawyer: { _id: "l1" },
      status: "open",
      save: saveMock,
    };
    jest.spyOn(Case, "findById").mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest
          .fn()
          .mockReturnValue({ populate: jest.fn().mockResolvedValue(fake) }),
      }),
    });

    const res = await closeCase({ caseId: "c1", currentUserId: "l1" });

    expect(saveMock).toHaveBeenCalled();
    expect(res.status).toBe("closed");
  });
});

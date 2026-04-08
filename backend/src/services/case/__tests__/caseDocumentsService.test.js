import { jest } from "@jest/globals";

import Case from "../../../models/case/caseModel.js";
import CaseDocument from "../../../models/case/caseDocument.js";
import { cloudinary } from "../../../config/cloudinary.js";
import {
  uploadCaseDocument,
  getCaseDocuments,
  updateCaseDocument,
  deleteCaseDocument,
} from "../caseDocumentsService.js";

// Tests for creating and listing case documents
describe("uploadCaseDocument", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  // 404 when case does not exist
  it("throws 404 if case not found", async () => {
    jest
      .spyOn(Case, "findById")
      .mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

    await expect(
      uploadCaseDocument({ caseId: "c1", uploadedBy: "u1" }),
    ).rejects.toMatchObject({ message: "Case not found", statusCode: 404 });
  });

  // 400 when case is closed
  it("throws 400 when case is closed", async () => {
    jest.spyOn(Case, "findById").mockReturnValue({
      select: jest.fn().mockResolvedValue({ _id: "c1", status: "closed" }),
    });

    await expect(
      uploadCaseDocument({ caseId: "c1", uploadedBy: "u1" }),
    ).rejects.toMatchObject({
      message: "Cannot upload documents for a closed case",
      statusCode: 400,
    });
  });

  // 403 when uploader is not part of the case
  it("throws 403 when uploader is not associated with case", async () => {
    jest.spyOn(Case, "findById").mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: "c1",
        user: "u2",
        lawyer: "l2",
        status: "open",
      }),
    });

    await expect(
      uploadCaseDocument({ caseId: "c1", uploadedBy: "u1" }),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  // creates document and generates thumbnail for PDFs
  it("creates document and generates thumbnail for pdfs", async () => {
    const caseObj = { _id: "c1", user: "u1", lawyer: "l1", status: "open" };
    jest
      .spyOn(Case, "findById")
      .mockReturnValue({ select: jest.fn().mockResolvedValue(caseObj) });

    jest.spyOn(cloudinary, "url").mockReturnValue("thumb.jpg");

    const fakeDoc = { _id: "d1", title: "T" };
    jest.spyOn(CaseDocument, "create").mockResolvedValue(fakeDoc);

    const res = await uploadCaseDocument({
      caseId: "c1",
      title: "T",
      description: "D",
      uploadedBy: "u1",
      fileUrl: "file.pdf",
      fileType: "application/pdf",
      filePublicId: "pub1",
    });

    expect(cloudinary.url).toHaveBeenCalledWith("pub1", expect.any(Object));
    expect(CaseDocument.create).toHaveBeenCalledWith(
      expect.objectContaining({ thumbnailUrl: "thumb.jpg" }),
    );
    expect(res).toBe(fakeDoc);
  });

  // creates document for non-pdf without thumbnail
  it("creates document when valid and non-pdf", async () => {
    const caseObj = { _id: "c1", user: "u1", lawyer: "l1", status: "open" };
    jest
      .spyOn(Case, "findById")
      .mockReturnValue({ select: jest.fn().mockResolvedValue(caseObj) });

    const fakeDoc = { _id: "d2", title: "T" };
    jest.spyOn(CaseDocument, "create").mockResolvedValue(fakeDoc);

    const res = await uploadCaseDocument({
      caseId: "c1",
      title: "T",
      description: "D",
      uploadedBy: "u1",
      fileUrl: "file.png",
      fileType: "image/png",
    });

    expect(CaseDocument.create).toHaveBeenCalledWith(
      expect.objectContaining({ thumbnailUrl: undefined }),
    );
    expect(res).toBe(fakeDoc);
  });
});

// Tests for retrieving case documents
describe("getCaseDocuments", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  // 404 when case not found
  it("throws 404 when case not found", async () => {
    jest
      .spyOn(Case, "findById")
      .mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

    await expect(
      getCaseDocuments({ caseId: "c1", currentUserId: "u1" }),
    ).rejects.toMatchObject({ message: "Case not found", statusCode: 404 });
  });

  // 403 when user not part of case
  it("throws 403 when current user not associated", async () => {
    jest.spyOn(Case, "findById").mockReturnValue({
      select: jest
        .fn()
        .mockResolvedValue({ _id: "c1", user: "u2", lawyer: "l2" }),
    });

    await expect(
      getCaseDocuments({ caseId: "c1", currentUserId: "u1" }),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  // returns populated and sorted documents when authorized
  it("returns documents when authorized", async () => {
    jest.spyOn(Case, "findById").mockReturnValue({
      select: jest
        .fn()
        .mockResolvedValue({ _id: "c1", user: "u1", lawyer: "l1" }),
    });

    const fake = [{ _id: "d1" }];
    jest.spyOn(CaseDocument, "find").mockReturnValue({
      populate: jest
        .fn()
        .mockReturnValue({ sort: jest.fn().mockResolvedValue(fake) }),
    });

    const res = await getCaseDocuments({ caseId: "c1", currentUserId: "u1" });

    expect(CaseDocument.find).toHaveBeenCalledWith({ caseId: "c1" });
    expect(res).toBe(fake);
  });
});

// Tests for updating case documents
describe("updateCaseDocument", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  // 404 when document not found
  it("throws 404 when document not found", async () => {
    jest.spyOn(CaseDocument, "findById").mockResolvedValue(null);

    await expect(
      updateCaseDocument({ docId: "d1", currentUserId: "u1" }),
    ).rejects.toMatchObject({ message: "Document not found", statusCode: 404 });
  });

  // 403 when current user didn't upload document
  it("throws 403 when current user is not uploader", async () => {
    jest
      .spyOn(CaseDocument, "findById")
      .mockResolvedValue({ uploadedBy: "u2", caseId: "c1" });

    await expect(
      updateCaseDocument({ docId: "d1", currentUserId: "u1" }),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  // 404 when associated case not found
  it("throws 404 when associated case not found", async () => {
    const doc = { uploadedBy: "u1", caseId: "c1", save: jest.fn() };
    jest.spyOn(CaseDocument, "findById").mockResolvedValue(doc);
    jest
      .spyOn(Case, "findById")
      .mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

    await expect(
      updateCaseDocument({ docId: "d1", currentUserId: "u1" }),
    ).rejects.toMatchObject({
      message: "Associated case not found",
      statusCode: 404,
    });
  });

  // 400 when case closed
  it("throws 400 when case is closed", async () => {
    const doc = { uploadedBy: "u1", caseId: "c1", save: jest.fn() };
    jest.spyOn(CaseDocument, "findById").mockResolvedValue(doc);
    jest.spyOn(Case, "findById").mockReturnValue({
      select: jest.fn().mockResolvedValue({ status: "closed" }),
    });

    await expect(
      updateCaseDocument({ docId: "d1", currentUserId: "u1" }),
    ).rejects.toMatchObject({
      message: "Cannot edit documents for a closed case",
      statusCode: 400,
    });
  });

  // successful update
  it("updates title and description when valid", async () => {
    const saveMock = jest.fn().mockResolvedValue(true);
    const doc = {
      uploadedBy: "u1",
      caseId: "c1",
      title: "old",
      description: "old",
      save: saveMock,
    };
    jest.spyOn(CaseDocument, "findById").mockResolvedValue(doc);
    jest.spyOn(Case, "findById").mockReturnValue({
      select: jest.fn().mockResolvedValue({ status: "open" }),
    });

    const res = await updateCaseDocument({
      docId: "d1",
      title: "new",
      description: "new",
      currentUserId: "u1",
    });

    expect(saveMock).toHaveBeenCalled();
    expect(res.title).toBe("new");
    expect(res.description).toBe("new");
  });
});

// Tests for deleting case documents
describe("deleteCaseDocument", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  // 404 when document not found
  it("throws 404 when document not found", async () => {
    jest.spyOn(CaseDocument, "findById").mockResolvedValue(null);

    await expect(
      deleteCaseDocument({ docId: "d1", currentUserId: "u1" }),
    ).rejects.toMatchObject({ message: "Document not found", statusCode: 404 });
  });

  // 403 when current user didn't upload
  it("throws 403 when current user is not uploader", async () => {
    jest
      .spyOn(CaseDocument, "findById")
      .mockResolvedValue({ uploadedBy: "u2", caseId: "c1" });

    await expect(
      deleteCaseDocument({ docId: "d1", currentUserId: "u1" }),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  // 404 when associated case not found
  it("throws 404 when associated case not found", async () => {
    const doc = { uploadedBy: "u1", caseId: "c1", filePublicId: null };
    jest.spyOn(CaseDocument, "findById").mockResolvedValue(doc);
    jest
      .spyOn(Case, "findById")
      .mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

    await expect(
      deleteCaseDocument({ docId: "d1", currentUserId: "u1" }),
    ).rejects.toMatchObject({
      message: "Associated case not found",
      statusCode: 404,
    });
  });

  // 400 when case closed
  it("throws 400 when case is closed", async () => {
    const doc = { uploadedBy: "u1", caseId: "c1", filePublicId: null };
    jest.spyOn(CaseDocument, "findById").mockResolvedValue(doc);
    jest.spyOn(Case, "findById").mockReturnValue({
      select: jest.fn().mockResolvedValue({ status: "closed" }),
    });

    await expect(
      deleteCaseDocument({ docId: "d1", currentUserId: "u1" }),
    ).rejects.toMatchObject({
      message: "Cannot delete documents for a closed case",
      statusCode: 400,
    });
  });

  // deletes and removes from Cloudinary when public id exists
  it("deletes document and calls cloudinary when filePublicId exists", async () => {
    const deleteOneMock = jest.fn().mockResolvedValue(true);
    const doc = {
      uploadedBy: "u1",
      caseId: "c1",
      filePublicId: "pub1",
      deleteOne: deleteOneMock,
    };
    jest.spyOn(CaseDocument, "findById").mockResolvedValue(doc);
    jest.spyOn(Case, "findById").mockReturnValue({
      select: jest.fn().mockResolvedValue({ status: "open" }),
    });
    jest
      .spyOn(cloudinary.uploader, "destroy")
      .mockResolvedValue({ result: "ok" });

    const res = await deleteCaseDocument({ docId: "d1", currentUserId: "u1" });

    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("pub1");
    expect(deleteOneMock).toHaveBeenCalled();
    expect(res).toBe(true);
  });
});

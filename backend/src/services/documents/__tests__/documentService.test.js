import { jest } from "@jest/globals";

import { cloudinary } from "../../../config/cloudinary.js";
import Document from "../../../models/documents/documentModel.js";
import {
  createDocument,
  getAllDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
} from "../documentService.js";

describe("documentService", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe("createDocument", () => {
    it("throws 401 when user missing", async () => {
      await expect(
        createDocument({
          title: "Doc",
          description: "d",
          user: null,
          fileUrl: "https://file.pdf",
          filePublicId: "pub1",
          fileType: "application/pdf",
        }),
      ).rejects.toMatchObject({ status: 401, message: "Unauthorized" });
    });

    it("throws 403 when user is not admin", async () => {
      await expect(
        createDocument({
          title: "Doc",
          description: "d",
          user: { _id: "u1", role: "user" },
          fileUrl: "https://file.pdf",
          filePublicId: "pub1",
          fileType: "application/pdf",
        }),
      ).rejects.toMatchObject({
        status: 403,
        message: "Only admins can upload documents",
      });
    });

    it("throws 400 when title or file missing", async () => {
      await expect(
        createDocument({
          title: "",
          description: "d",
          user: { _id: "u1", role: "admin" },
          fileUrl: null,
          filePublicId: null,
          fileType: "application/pdf",
        }),
      ).rejects.toMatchObject({ status: 400, message: "Title is required" });
    });

    it("generates thumbnail for pdf and saves document", async () => {
      const saveMock = jest.fn().mockResolvedValue(true);
      jest.spyOn(Document.prototype, "save").mockImplementation(saveMock);
      jest.spyOn(cloudinary, "url").mockReturnValue("thumb.jpg");

      const res = await createDocument({
        title: "Doc",
        description: "Desc",
        user: { _id: "u1", role: "admin" },
        fileUrl: "https://file.pdf",
        filePublicId: "pub1",
        fileType: "application/pdf",
      });

      expect(cloudinary.url).toHaveBeenCalledWith("pub1", expect.any(Object));
      expect(saveMock).toHaveBeenCalled();
      expect(res.thumbnailUrl).toBe("thumb.jpg");
    });
  });

  describe("getAllDocuments", () => {
    it("returns documents sorted by createdAt desc", async () => {
      const fake = [{ _id: "d1" }];
      jest.spyOn(Document, "find").mockReturnValue({
        sort: jest.fn().mockResolvedValue(fake),
      });

      const res = await getAllDocuments();

      expect(Document.find).toHaveBeenCalledWith();
      expect(res).toBe(fake);
    });
  });

  describe("getDocumentById", () => {
    it("throws 400 for invalid id", async () => {
      await expect(getDocumentById({ id: "bad" })).rejects.toMatchObject({
        status: 400,
        message: "Invalid document id",
      });
    });

    it("throws 404 when not found", async () => {
      jest.spyOn(Document, "findById").mockResolvedValue(null);

      await expect(
        getDocumentById({ id: "507f1f77bcf86cd799439011" }),
      ).rejects.toMatchObject({ status: 404, message: "Document not found" });
    });

    it("returns document when found", async () => {
      const fake = { _id: "507f1f77bcf86cd799439011" };
      jest.spyOn(Document, "findById").mockResolvedValue(fake);

      const res = await getDocumentById({ id: "507f1f77bcf86cd799439011" });
      expect(res).toBe(fake);
    });
  });

  describe("updateDocument", () => {
    it("throws 404 when document not found", async () => {
      jest.spyOn(Document, "findById").mockResolvedValue(null);

      await expect(
        updateDocument({
          id: "507f1f77bcf86cd799439011",
          title: "T",
          description: "D",
          user: { _id: "u1", role: "admin" },
        }),
      ).rejects.toMatchObject({ status: 404, message: "Document not found" });
    });

    it("throws 403 when user is not admin", async () => {
      const saveMock = jest.fn().mockResolvedValue(true);
      const doc = { title: "old", description: "old", save: saveMock };
      jest.spyOn(Document, "findById").mockResolvedValue(doc);

      await expect(
        updateDocument({
          id: "507f1f77bcf86cd799439011",
          title: "new",
          description: "new",
          user: { _id: "u1", role: "user" },
        }),
      ).rejects.toMatchObject({ status: 403 });
    });

    it("updates fields and saves when valid", async () => {
      const saveMock = jest.fn().mockResolvedValue(true);
      const doc = { title: "old", description: "old", save: saveMock };
      jest.spyOn(Document, "findById").mockResolvedValue(doc);

      const res = await updateDocument({
        id: "507f1f77bcf86cd799439011",
        title: "new",
        description: "new",
        user: { _id: "u1", role: "admin" },
      });
      expect(saveMock).toHaveBeenCalled();
      expect(res.title).toBe("new");
      expect(res.description).toBe("new");
    });
  });

  describe("deleteDocument", () => {
    it("throws 404 when document not found", async () => {
      jest.spyOn(Document, "findById").mockResolvedValue(null);

      await expect(
        deleteDocument({ id: "507f1f77bcf86cd799439011", user: { _id: "u1", role: "admin" } }),
      ).rejects.toMatchObject({ status: 404, message: "Document not found" });
    });

    it("deletes and calls cloudinary when filePublicId exists", async () => {
      const deleteOneMock = jest.fn().mockResolvedValue(true);
      const doc = { filePublicId: "pub1", deleteOne: deleteOneMock };
      jest.spyOn(Document, "findById").mockResolvedValue(doc);

      jest
        .spyOn(cloudinary.uploader, "destroy")
        .mockResolvedValue({ result: "ok" });

      const res = await deleteDocument({
        id: "507f1f77bcf86cd799439011",
        user: { _id: "u1", role: "admin" },
      });

      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("pub1", { resource_type: "raw" });
      expect(deleteOneMock).toHaveBeenCalled();
      expect(res).toEqual({ success: true, message: "Document deleted successfully" });
    });

    it("deletes without calling cloudinary when no filePublicId", async () => {
      const deleteOneMock = jest.fn().mockResolvedValue(true);
      const doc = { filePublicId: null, deleteOne: deleteOneMock };
      jest.spyOn(Document, "findById").mockResolvedValue(doc);

      jest
        .spyOn(cloudinary.uploader, "destroy")
        .mockResolvedValue({ result: "ok" });

      const res = await deleteDocument({
        id: "507f1f77bcf86cd799439011",
        user: { _id: "u1", role: "admin" },
      });

      expect(cloudinary.uploader.destroy).not.toHaveBeenCalled();
      expect(deleteOneMock).toHaveBeenCalled();
      expect(res).toEqual({ success: true, message: "Document deleted successfully" });
    });
  });
});

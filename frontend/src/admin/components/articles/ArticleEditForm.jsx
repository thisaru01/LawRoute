import React, { useState } from "react";
import { toast } from "sonner";
import { updateArticle } from "@/api/services/articleService";
// Alert dialog removed: using toasts only

const CATEGORY_OPTIONS = ["Family", "Property", "Work", "Consumer", "Finance"];

export default function ArticleEditForm({ article, onCancel, onUpdated }) {
  const [title, setTitle] = useState(article.title || "");
  const [category, setCategory] = useState(article.category || CATEGORY_OPTIONS[0]);
  const [content, setContent] = useState(article.content || "");
  const [imageFile, setImageFile] = useState(null);
  const [imageCardFile, setImageCardFile] = useState(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [removeExistingImageCard, setRemoveExistingImageCard] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("content", content);
    if (imageFile) formData.append("image", imageFile);
    if (imageCardFile) formData.append("imagecard", imageCardFile);
    if (removeExistingImage) formData.append("removeImage", "true");
    if (removeExistingImageCard) formData.append("removeImagecard", "true");

    try {
      setSubmitting(true);
      const res = await updateArticle(article._id || article.id, formData);
      const updated = res?.data?.article || res?.data;
      if (updated) {
        toast.success("Article updated successfully");
        if (typeof onUpdated === "function") onUpdated(updated);
      }
    } catch (err) {
      const msg = err?.message || "Failed to update article";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-8 p-4 border rounded-lg bg-white">
      <h2 className="text-lg font-semibold">Edit Article</h2>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="space-y-1">
        <label className="block text-sm font-medium">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-sm"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-sm"
          required
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-sm min-h-45"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium">Image</label>

          <div
            onClick={() => document.getElementById("article-edit-image-input").click()}
            className="mt-2 cursor-pointer flex items-center justify-center border-2 border-dashed border-input rounded-lg h-48 bg-muted/30 overflow-hidden"
          >
            {imageFile ? (
              <img src={URL.createObjectURL(imageFile)} alt="preview" className="max-h-full w-full object-contain" />
            ) : (!removeExistingImage && article.imageUrl) ? (
              <img src={article.imageUrl} alt="preview" className="max-h-full w-full object-contain" />
            ) : (
              <div className="text-center text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="mx-auto h-12 w-12">
                  <rect x="3" y="3" width="18" height="14" rx="2" ry="2" strokeWidth="1.5" />
                  <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="1.5" />
                  <path d="M21 21l-5.2-5.2" strokeWidth="1.5" />
                </svg>
                <div className="mt-2 font-medium">Click to choose image</div>
                <div className="text-xs mt-1">Primary article image (large hero)</div>
              </div>
            )}

            <input
              id="article-edit-image-input"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </div>

          {(imageFile || article.imageUrl || removeExistingImage) && (
            <div className="mt-2 flex items-center justify-end">
              <button
                type="button"
                className="text-sm text-red-600"
                onClick={() => {
                  if (imageFile) {
                    setImageFile(null);
                  } else if (article.imageUrl && !removeExistingImage) {
                    setRemoveExistingImage(true);
                  } else if (removeExistingImage) {
                    setRemoveExistingImage(false);
                  }
                }}
              >
                {removeExistingImage ? "Undo" : "Remove"}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Image Card</label>

          <div
            onClick={() => document.getElementById("article-edit-imagecard-input").click()}
            className="mt-2 cursor-pointer flex items-center justify-center border-2 border-dashed border-input rounded-lg h-48 bg-muted/30 overflow-hidden"
          >
            {imageCardFile ? (
              <img src={URL.createObjectURL(imageCardFile)} alt="preview" className="max-h-full w-full object-contain" />
            ) : (!removeExistingImageCard && article.imagecardUrl) ? (
              <img src={article.imagecardUrl} alt="preview" className="max-h-full w-full object-contain" />
            ) : (
              <div className="text-center text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="mx-auto h-12 w-12">
                  <rect x="3" y="3" width="18" height="14" rx="2" ry="2" strokeWidth="1.5" />
                  <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="1.5" />
                  <path d="M21 21l-5.2-5.2" strokeWidth="1.5" />
                </svg>
                <div className="mt-2 font-medium">Click to choose image</div>
                <div className="text-xs mt-1">Small thumbnail used in article lists and cards.</div>
              </div>
            )}

            <input
              id="article-edit-imagecard-input"
              type="file"
              accept="image/*"
              onChange={(e) => setImageCardFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </div>

          {(imageCardFile || article.imagecardUrl || removeExistingImageCard) && (
            <div className="mt-2 flex items-center justify-end">
              <button
                type="button"
                className="text-sm text-red-600"
                onClick={() => {
                  if (imageCardFile) {
                    setImageCardFile(null);
                  } else if (article.imagecardUrl && !removeExistingImageCard) {
                    setRemoveExistingImageCard(true);
                  } else if (removeExistingImageCard) {
                    setRemoveExistingImageCard(false);
                  }
                }}
              >
                {removeExistingImageCard ? "Undo" : "Remove"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 justify-end pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 rounded-md border text-sm"
          disabled={submitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm disabled:opacity-60"
          disabled={submitting}
        >
          {submitting ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

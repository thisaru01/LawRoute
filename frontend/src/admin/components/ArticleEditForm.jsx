import React, { useState } from "react";
import { updateArticle } from "@/api/services/articleService";

const CATEGORY_OPTIONS = ["Family", "Property", "Work", "Consumer", "Finance"];

export default function ArticleEditForm({ article, onCancel, onUpdated }) {
  const [title, setTitle] = useState(article.title || "");
  const [category, setCategory] = useState(article.category || CATEGORY_OPTIONS[0]);
  const [content, setContent] = useState(article.content || "");
  const [imageFile, setImageFile] = useState(null);
  const [imageCardFile, setImageCardFile] = useState(null);
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

    try {
      setSubmitting(true);
      const res = await updateArticle(article._id || article.id, formData);
      const updated = res?.data?.article || res?.data;
      if (updated && typeof onUpdated === "function") {
        onUpdated(updated);
      }
    } catch (err) {
      setError(err?.message || "Failed to update article");
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
        <label className="block text-sm font-medium">Content (HTML or text)</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-sm min-h-[180px]"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium">Main Image (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="block w-full text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Card Image (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageCardFile(e.target.files?.[0] || null)}
            className="block w-full text-sm"
          />
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

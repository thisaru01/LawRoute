import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import axios from "@/api/axios";
import { toast } from "sonner";
import { DEFAULT_ARTICLE_CATEGORIES, useArticleCategories } from "@/hooks/articles/useArticleCategories";
import { useArticleFileInput } from "@/hooks/articles/useArticleFileInput";

export default function AdminArticleCreate({ redirectPath = "/admin/articles/pending" }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const categories = useArticleCategories(DEFAULT_ARTICLE_CATEGORIES);
  const {
    file: image,
    inputRef: imageInputRef,
    handleChange: handleImageChange,
    openPicker: openImagePicker,
    clear: clearImage,
    previewUrl: imagePreviewUrl,
  } = useArticleFileInput();
  const {
    file: imageCard,
    inputRef: imageCardInputRef,
    handleChange: handleImageCardChange,
    openPicker: openImageCardPicker,
    clear: clearImageCard,
    previewUrl: imageCardPreviewUrl,
  } = useArticleFileInput();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) return setError("Title is required");
    if (!content.trim()) return setError("Content is required");
    if (!category.trim()) return setError("Category is required");

    const form = new FormData();
    form.append("title", title);
    form.append("content", content);
    form.append("category", category);
    if (image) form.append("image", image);
    if (imageCard) form.append("imagecard", imageCard);

    try {
      setSubmitting(true);
      await axios.post("/articles", form);
      toast.success("Article created successfully");
      // Redirect so the new article appears under "Own"
      navigate(redirectPath);
    } catch (err) {
      const msg = err?.message || "Failed to create article";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Article</CardTitle>
          <CardDescription>Use this page to create a new article.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="mt-2">
            <FieldGroup>
              <Field>
                <FieldLabel>Title</FieldLabel>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Article title" />
              </Field>

              <Field>
                <FieldLabel>Content</FieldLabel>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full min-h-45 rounded-lg border border-input px-3 py-2 text-base"
                  placeholder="Article body"
                />
                {/* <FieldDescription>Accepts HTML or plain text. Consider pasting formatted content.</FieldDescription> */}
              </Field>

              <Field>
                <FieldLabel>Category</FieldLabel>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {category || "Select category"}
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent className="w-full">
                    {categories.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">No categories</div>
                    ) : (
                      categories.map((c) => (
                        <DropdownMenuItem
                          key={c}
                          onSelect={(e) => {
                            e.preventDefault();
                            setCategory(c);
                          }}
                        >
                          {c}
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </Field>

              <Field orientation="horizontal">
                <div className="w-1/2">
                  <FieldLabel>Image</FieldLabel>

                  <div
                    onClick={openImagePicker}
                    className="mt-2 cursor-pointer flex items-center justify-center border-2 border-dashed border-input rounded-lg h-48 bg-muted/30 overflow-hidden"
                  >
                    {image ? (
                      <img
                        src={imagePreviewUrl}
                        alt="preview"
                        className="max-h-full w-full object-contain"
                      />
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
                      id="article-image-input"
                      type="file"
                      accept="image/*"
                      ref={imageInputRef}
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>

                  {image && (
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm truncate">{image.name}</span>
                      <button type="button" className="text-sm text-red-600" onClick={clearImage}>
                        Remove
                      </button>
                    </div>
                  )}

                  {/* <FieldDescription>Primary article image (large hero).</FieldDescription> */}
                </div>

                <div className="w-1/2">
                  <FieldLabel>Image Card</FieldLabel>

                  <div
                    onClick={openImageCardPicker}
                    className="mt-2 cursor-pointer flex items-center justify-center border-2 border-dashed border-input rounded-lg h-48 bg-muted/30 overflow-hidden"
                  >
                    {imageCard ? (
                      <img
                        src={imageCardPreviewUrl}
                        alt="preview"
                        className="max-h-full w-full object-contain"
                      />
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
                      id="article-imagecard-input"
                      type="file"
                      accept="image/*"
                      ref={imageCardInputRef}
                      onChange={handleImageCardChange}
                      className="hidden"
                    />
                  </div>

                  {imageCard && (
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm truncate">{imageCard.name}</span>
                      <button type="button" className="text-sm text-red-600" onClick={clearImageCard}>
                        Remove
                      </button>
                    </div>
                  )}

                  {/* <FieldDescription>Small thumbnail used in article lists and cards.</FieldDescription> */}
                </div>
              </Field>

              {error && <div className="text-sm text-red-600">{error}</div>}

              <div className="mt-4">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Creating…" : "Create Article"}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

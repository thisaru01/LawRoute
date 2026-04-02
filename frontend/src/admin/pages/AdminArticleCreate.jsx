import React, { useState } from "react";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import axios from "@/api/axios";

const CATEGORIES = ["Property", "Politics", "Business", "Technology", "General"];

export default function AdminArticleCreate() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [imageCard, setImageCard] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFile = (e, setter) => {
    const f = e.target.files && e.target.files[0];
    setter(f || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim()) return setError("Title is required");
    if (!content.trim()) return setError("Content is required");

    const form = new FormData();
    form.append("title", title);
    form.append("content", content);
    form.append("category", category);
    if (image) form.append("image", image);
    if (imageCard) form.append("imagecard", imageCard);

    try {
      setSubmitting(true);
      await axios.post("/articles", form);
      setSuccess("Article created successfully");
      setTitle("");
      setContent("");
      setCategory("");
      setImage(null);
      setImageCard(null);
    } catch (err) {
      setError(err?.message || "Failed to create article");
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
                  className="w-full min-h-[180px] rounded-lg border border-input px-3 py-2 text-base"
                  placeholder="Article body (HTML or plain text)"
                />
                <FieldDescription>Accepts HTML or plain text. Consider pasting formatted content.</FieldDescription>
              </Field>

              <Field orientation="horizontal">
                <div className="w-1/2">
                  <FieldLabel>Category</FieldLabel>
                  <Select value={category} onValueChange={(v) => setCategory(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-1/2">
                  <FieldLabel>Image</FieldLabel>
                  <Input type="file" accept="image/*" onChange={(e) => handleFile(e, setImage)} />
                  <FieldDescription>Primary article image (large hero).</FieldDescription>
                </div>
              </Field>

              <Field>
                <FieldLabel>Image Card</FieldLabel>
                <Input type="file" accept="image/*" onChange={(e) => handleFile(e, setImageCard)} />
                <FieldDescription>Small thumbnail used in article lists and cards.</FieldDescription>
              </Field>

              {error && <div className="text-sm text-red-600">{error}</div>}
              {success && <div className="text-sm text-green-600">{success}</div>}

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

import { useState } from "react";
import { toast } from "sonner";
import { createPost, updatePost } from "@/api/services/socialService";

const initialFormState = {
  postType: "legal_awareness",
  visibility: "public",
  content: "",
  tags: "",
};

const parseTags = (tagsValue) => {
  if (typeof tagsValue !== 'string') return [];
  return tagsValue.split(",").map((tag) => tag.trim()).filter(Boolean);
};

export function usePostForm(refreshPosts, setPosts) {
  const [form, setForm] = useState(initialFormState);
  const [isCreating, setIsCreating] = useState(false);
  const [formError, setFormError] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  const handleChange = (field) => (value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const openCreateModal = () => {
    setEditingPost(null);
    setForm(initialFormState);
    setFormError("");
    setFileInputKey(prev => prev + 1);
    setIsModalOpen(true);
  };

  const openEditModal = (post) => {
    setEditingPost(post);
    setForm({
      postType: post.postType || "legal_awareness",
      visibility: post.visibility || "public",
      content: post.content || "",
      tags: Array.isArray(post.tags) ? post.tags.join(", ") : "",
    });
    setFormError("");
    setFileInputKey(prev => prev + 1);
    setIsModalOpen(true);
  };

  const handleSubmit = async (event, successCallback) => {
    event.preventDefault();
    setFormError("");

    const content = form.content.trim();
    const tags = parseTags(form.tags);

    // Grabbing media from the native form submission event target
    const mediaFiles = Array.from(event.currentTarget.media?.files || []);

    if (!content && mediaFiles.length === 0 && !editingPost) {
      setFormError("Write a post or add at least one attachment.");
      return;
    }

    const payload = new FormData();
    payload.append("postType", form.postType);
    payload.append("visibility", form.visibility);
    payload.append("content", content || "");

    if (tags.length > 0) {
      payload.append("tags", JSON.stringify(tags));
    }

    for (const file of mediaFiles) {
      payload.append("media", file);
    }

    setIsCreating(true);

    try {
      if (editingPost) {
        const postId = editingPost._id || editingPost.id;
        const response = await updatePost(postId, payload);
        const updatedPost = response?.data?.post || response?.data;

        if (updatedPost) {
          setPosts((currentPosts) => currentPosts.map(p => (p._id || p.id) === (updatedPost._id || updatedPost.id) ? updatedPost : p));
        } else {
          await refreshPosts({ silent: true });
        }
        if (successCallback) successCallback("Post updated successfully.");
        toast.success("Post updated successfully.");
      } else {
        const response = await createPost(payload);
        const createdPost = response?.data?.post;

        if (createdPost) {
          setPosts((currentPosts) => [createdPost, ...currentPosts]);
        } else {
          await refreshPosts({ silent: true });
        }
        if (successCallback) successCallback("Post created successfully.");
        toast.success("Post created successfully.");
      }

      setForm(initialFormState);
      setFileInputKey((currentKey) => currentKey + 1);
      setIsModalOpen(false);
      setEditingPost(null);
      return true;
    } catch (error) {
      setFormError(error?.response?.data?.message || error?.message || "Unable to save your post.");
      toast.error(error?.response?.data?.message || error?.message || "Failed to save post.");
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    form,
    setForm,
    isCreating,
    formError,
    setFormError,
    fileInputKey,
    isModalOpen,
    setIsModalOpen,
    editingPost,
    handleChange,
    openCreateModal,
    openEditModal,
    handleSubmit,
  };
}

import { useEffect, useState } from "react";
import { Image as ImageIcon, Video } from "lucide-react";
import { createPost, getMyPosts, updatePost, deletePost } from "@/api/services/socialService";
import CreatePostModal from "@/lawyer/components/activities/CreatePostModal";
import PublishedPostsList from "@/lawyer/components/activities/PublishedPostsList";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const POSTS_BATCH_SIZE = 20;

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

const loadAllMyPosts = async () => {
  const collectedPosts = [];
  let cursor;

  while (true) {
    const response = await getMyPosts({ limit: POSTS_BATCH_SIZE, cursor });
    const batch = response?.data?.posts || [];

    collectedPosts.push(...batch);

    if (batch.length < POSTS_BATCH_SIZE) {
      break;
    }

    cursor = batch[batch.length - 1]?.createdAt;

    if (!cursor) {
      break;
    }
  }

  return collectedPosts;
};

export default function LawyerProfileActivities() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);
  const [form, setForm] = useState(initialFormState);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  const refreshPosts = async ({ silent = false } = {}) => {
    if (silent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setFetchError("");

    try {
      const myPosts = await loadAllMyPosts();
      setPosts(myPosts);
    } catch (error) {
      setFetchError(error?.message || "Unable to load your posts.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshPosts();
  }, []);

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

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    setFetchError("");
    setSuccessMessage("");
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter(p => (p._id || p.id) !== postId));
      setSuccessMessage("Post deleted successfully.");
    } catch (error) {
      setFetchError(error?.response?.data?.message || error?.message || "Failed to delete post.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setSuccessMessage("");

    const content = form.content.trim();
    const tags = parseTags(form.tags);

    // Grabbing media from the native form submission event target which is bound in the Modal
    const mediaFiles = Array.from(event.currentTarget.media?.files || []);

    if (!content && mediaFiles.length === 0 && !editingPost) {
      setFormError("Write a post or add at least one attachment.");
      return;
    }

    const payload = new FormData();
    payload.append("postType", form.postType);
    payload.append("visibility", form.visibility);

    if (content) {
      payload.append("content", content);
    } else {
      payload.append("content", "");
    }

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
        setSuccessMessage("Post updated successfully.");
      } else {
        const response = await createPost(payload);
        const createdPost = response?.data?.post;

        if (createdPost) {
          setPosts((currentPosts) => [createdPost, ...currentPosts]);
        } else {
          await refreshPosts({ silent: true });
        }
        setSuccessMessage("Post created successfully.");
      }

      setForm(initialFormState);
      setFileInputKey((currentKey) => currentKey + 1);

      // Close the modal upon success
      setIsModalOpen(false);
      setEditingPost(null);

    } catch (error) {
      setFormError(error?.response?.data?.message || error?.message || "Unable to save your post.");
    } finally {
      setIsCreating(false);
    }
  };

  // We can derive the user's author info from their existing posts if available
  const author = posts[0]?.author || {};

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      {successMessage && !isModalOpen && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
          {successMessage}
        </div>
      )}

      {/* LinkedIn-style Trigger Card */}
      <Card className="border-border/60 bg-card p-4 sm:p-5 shadow-sm rounded-xl transition-shadow hover:shadow-md">
        <div className="flex items-center gap-4">
          <Avatar className="size-12 sm:size-14 border border-border/50">
            <AvatarImage src={author.profilePhoto || ""} alt={author.name || "Lawyer"} />
            <AvatarFallback className="font-semibold text-lg">{author.name ? author.name.charAt(0).toUpperCase() : "L"}</AvatarFallback>
          </Avatar>
          <button
            onClick={openCreateModal}
            className="flex-1 rounded-full border border-border/70 px-5 py-3.5 text-left font-medium text-foreground/60 shadow-sm transition-all hover:bg-muted/60 hover:text-foreground hover:border-border cursor-text"
          >
            Start a post
          </button>
        </div>
        <div className="mt-3 flex justify-around sm:justify-start gap-4 pt-3 border-t border-border/40">
          <Button variant="ghost" className="w-full h-11 rounded-lg font-semibold text-muted-foreground sm:w-auto hover:bg-blue-50 hover:text-blue-700" onClick={openCreateModal}>
            <ImageIcon className="mr-2 size-[18px] text-blue-500" />
            Photo
          </Button>
          <Button variant="ghost" className="w-full h-11 rounded-lg font-semibold text-muted-foreground sm:w-auto hover:bg-green-50 hover:text-green-700" onClick={openCreateModal}>
            <Video className="mr-2 size-[18px] text-green-500" />
            Video
          </Button>
        </div>
      </Card>

      {/* Post Modal (used for both Edit and Create) */}
      <CreatePostModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        form={form}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        fileInputKey={fileInputKey}
        formError={formError}
        isCreating={isCreating}
        author={author}
        isEditMode={!!editingPost}
      />

      <PublishedPostsList
        posts={posts}
        isLoading={isLoading}
        fetchError={fetchError}
        refreshPosts={refreshPosts}
        onEdit={openEditModal}
        onDelete={handleDeletePost}
      />
    </div>
  );
}

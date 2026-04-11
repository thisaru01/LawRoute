import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { getMyPosts, deletePost as deletePostApi } from "@/api/services/socialService";

const POSTS_BATCH_SIZE = 20;

export function usePosts() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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

  const refreshPosts = useCallback(async ({ silent = false } = {}) => {
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
  }, []);

  const deletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    setFetchError("");
    setSuccessMessage("");
    try {
      await deletePostApi(postId);
      setPosts((prev) => prev.filter(p => (p._id || p.id) !== postId));
      setSuccessMessage("Post deleted successfully.");
      toast.success("Post deleted successfully.");
      return true;
    } catch (error) {
      const errMsg = error?.response?.data?.message || error?.message || "Failed to delete post.";
      setFetchError(errMsg);
      toast.error(errMsg);
      throw error;
    }
  };

  useEffect(() => {
    refreshPosts();
  }, [refreshPosts]);

  return {
    posts,
    setPosts,
    isLoading,
    isRefreshing,
    fetchError,
    setFetchError,
    successMessage,
    setSuccessMessage,
    refreshPosts,
    deletePost,
  };
}

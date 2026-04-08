import { useState, useEffect, useCallback } from "react";
import { Send, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/auth/useAuth";
import { getPostComments, createComment } from "@/api/services/socialService";
import { toast } from "sonner";

export default function CommentSection({ postId }) {
  const { isAuthenticated, user } = useAuth();
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchComments = useCallback(async (isInitial = false) => {
    setIsLoading(true);
    try {
      const currentCursor = isInitial ? null : cursor;
      const response = await getPostComments(postId, { limit: 10, cursor: currentCursor });
      
      // The API returns data.comments
      const newBatch = response.data?.comments || [];
      
      if (isInitial) {
        setComments(newBatch);
      } else {
        setComments((prev) => [...prev, ...newBatch]);
      }
      
      if (newBatch.length < 10) {
        setHasMore(false);
      } else {
        setCursor(newBatch[newBatch.length - 1].createdAt);
      }
    } catch (error) {
      console.error("Failed to fetch comments", error);
      toast.error("Failed to load comments");
    } finally {
      setIsLoading(false);
    }
  }, [postId, cursor]);

  useEffect(() => {
    fetchComments(true);
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await createComment(postId, { content: newComment });
      const createdComment = response.data?.comment;
      if (createdComment) {
        setComments((prev) => [createdComment, ...prev]);
        setNewComment("");
        toast.success("Comment posted");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name) => {
    return name?.split(" ").filter(Boolean).map(n => n[0]).join("").toUpperCase() || "U";
  };

  const formatRelativeTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6 pt-4 animate-in fade-in duration-300">
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Avatar className="h-9 w-9 border border-border/50">
            <AvatarImage src={user?.profilePhoto} />
            <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] text-sm resize-none bg-background focus-visible:ring-primary/20"
            />
            <div className="flex justify-end">
              <Button 
                type="submit" 
                size="sm" 
                disabled={isSubmitting || !newComment.trim()}
                className="gap-2 rounded-full px-4"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Post Comment
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-muted/30 rounded-xl p-4 text-center border border-dashed border-border">
          <p className="text-sm text-muted-foreground">
            Please <Button variant="link" className="p-0 h-auto font-semibold text-primary" onClick={() => window.location.href=`/auth?redirect=${window.location.pathname}`}>log in</Button> to share your thoughts.
          </p>
        </div>
      )}

      <div className="space-y-5">
        {comments.map((comment) => (
          <div key={comment._id || comment.id} className="flex gap-3 group">
            <Avatar className="h-8 w-8 border border-border/50 transition-transform group-hover:scale-105">
              <AvatarImage src={comment.author?.profilePhoto} />
              <AvatarFallback className="text-[10px] font-bold">
                {getInitials(comment.author?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground/90">{comment.author?.name}</span>
                <span className="text-[11px] text-muted-foreground font-medium">
                  {formatRelativeTime(comment.createdAt)}
                </span>
              </div>
              <div className="bg-slate-100/50 dark:bg-slate-900/50 px-4 py-3 rounded-2xl rounded-tl-none border border-slate-200/50 dark:border-slate-800/50">
                <p className="text-[13px] leading-relaxed text-foreground/80 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </div>
          </div>
        ))}

        {hasMore && comments.length > 0 && (
          <div className="flex justify-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchComments()}
              disabled={isLoading}
              className="text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full px-6 font-semibold"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Show more comments"
              )}
            </Button>
          </div>
        )}

        {comments.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground/60 italic">
              No comments yet. Start the conversation!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

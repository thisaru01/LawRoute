import { useState, useRef } from "react";
import { Earth, Lock, MessageSquare, MoreHorizontal, ThumbsUp, Users, Edit2, Trash2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/auth/useAuth";
import { likePost, unlikePost } from "@/api/services/socialService";
import CommentSection from "@/public/find-lawyer/components/profile/CommentSection";
import MediaLightbox from "./MediaLightbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const getInitials = (name) => {
  if (!name) return "L";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "L";
};

const formatStatValue = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const getRelativeTime = (dateStr) => {
  const date = new Date(dateStr);
  if (isNaN(date)) return "1d";
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return "Today";
  if (diffDays < 30) return `${diffDays}d`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo`;
  return `${Math.floor(diffDays / 365)}y`;
};

const getVisibilityIcon = (visibility) => {
  if (visibility === "private") return <Lock className="size-3" />;
  if (visibility === "followers") return <Users className="size-3" />;
  return <Earth className="size-3" />;
};

export default function PostPreview({ post, onEdit, onDelete }) {
  const { isAuthenticated, user: currentUser } = useAuth();
  const author = post?.author || {};
  const media = Array.isArray(post?.media) ? post.media : [];
  const hasMedia = media.length > 0;
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false); // Initially false as we don't have isLiked from backend
  const [likeCount, setLikeCount] = useState(formatStatValue(post?.stats?.likeCount));
  const isLikingRef = useRef(false);
  
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const handleMediaClick = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const content = post.content || "";
  const isLongContent = content.length > 120 || content.split("\n").length > 3;

  const postId = post._id || post.id;
  const isAuthor = currentUser && (currentUser._id === author._id || currentUser.id === author._id || currentUser.id === author.id);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to like this post");
      return;
    }

    if (isLikingRef.current) return;
    isLikingRef.current = true;

    // Save previous state for rollback
    const previousIsLiked = isLiked;
    const previousLikeCount = likeCount;

    // Optimistic UI update (Instant)
    setIsLiked(!previousIsLiked);
    setLikeCount(previousIsLiked ? Math.max(0, previousLikeCount - 1) : previousLikeCount + 1);

    try {
      if (previousIsLiked) {
        const response = await unlikePost(postId);
        // Sync with exact server count on success
        if (response?.data?.likeCount !== undefined) {
          setLikeCount(response.data.likeCount);
        }
      } else {
        const response = await likePost(postId);
        // Sync with exact server count on success
        if (response?.data?.likeCount !== undefined) {
          setLikeCount(response.data.likeCount);
        }
      }
    } catch (error) {
      // Revert to old state on failure
      setIsLiked(previousIsLiked);
      setLikeCount(previousLikeCount);
      toast.error("Action failed. Try again.");
    } finally {
      isLikingRef.current = false;
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border/80 bg-card text-left text-card-foreground shadow-sm transition-shadow hover:shadow-md">
      {/* Header section */}
      <div className="flex items-start justify-between gap-4 p-4 pb-3">
        <div className="flex gap-3">
          <Avatar className="size-12 border border-border/50">
            <AvatarImage src={author.profilePhoto || ""} alt={author.name || "Lawyer"} />
            <AvatarFallback className="font-semibold">{getInitials(author.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col justify-center">
            <div className="flex flex-wrap items-center">
              <span className="cursor-pointer text-[15px] font-bold text-foreground/90 hover:text-blue-600 hover:underline">
                {author.name || "Unnamed lawyer"}
              </span>
            </div>

            <span className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
              {author.professionalTitle || "Attorney at Law"}
            </span>

            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span>{getRelativeTime(post.createdAt)}</span>
              <span>•</span>
              <span className="text-muted-foreground/80">{getVisibilityIcon(post.visibility)}</span>
            </div>
          </div>
        </div>

        {isAuthor && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full p-2 text-foreground/60 outline-none transition-colors hover:bg-muted hover:text-foreground focus:ring-0">
                <MoreHorizontal className="size-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 border-border/80 bg-card text-foreground">
              <DropdownMenuItem className="cursor-pointer gap-2 font-medium" onClick={() => onEdit && onEdit(post)}>
                <Edit2 className="size-4 text-muted-foreground" />
                <span>Edit Post</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer gap-2 font-medium text-red-600 focus:bg-red-500/10 focus:text-red-700 dark:text-red-500 dark:focus:bg-red-500/20 dark:focus:text-red-400" onClick={() => onDelete && onDelete(postId)}>
                <Trash2 className="size-4" />
                <span>Delete Post</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Content Section */}
      <div className="px-4 pb-3">
        <p 
          className={cn(
            "whitespace-pre-wrap text-[14px] leading-relaxed text-foreground/90",
            !isExpanded && "line-clamp-3"
          )}
        >
          {content}
        </p>
        {isLongContent && !isExpanded && (
          <button 
            onClick={() => setIsExpanded(true)}
            className="mt-1 text-[14px] font-semibold text-muted-foreground hover:text-blue-600 transition-colors"
          >
            ... more
          </button>
        )}
        {isLongContent && isExpanded && (
          <button 
            onClick={() => setIsExpanded(false)}
            className="mt-1 text-[14px] font-semibold text-muted-foreground hover:text-blue-600 transition-colors"
          >
            Show less
          </button>
        )}
      </div>

      {/* Media Section */}
      {hasMedia && (
        <div className={cn(
          "grid w-full gap-[2px] border-y border-border/40 bg-border/40 overflow-hidden",
          media.length === 1 ? "grid-cols-1" : "grid-cols-2"
        )}>
          {media.slice(0, 4).map((item, index) => {
            const isImage =
              item.resourceType === "image" ||
              (typeof item.url === "string" && /\.(png|jpe?g|gif|webp|avif|svg)(\?|#|$)/i.test(item.url));

            const isVideo =
              item.resourceType === "video" ||
              (typeof item.url === "string" && /\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(item.url));

            const isExtra = media.length > 4 && index === 3;
            
            // Layout classes for grid elements
            let layoutClass = "relative flex items-center justify-center bg-background overflow-hidden";
            let mediaClass = "w-full h-full";
            
            if (media.length === 1) {
               layoutClass = cn(layoutClass, isVideo ? "max-h-[450px]" : "max-h-[500px] bg-black/5");
               mediaClass = cn(mediaClass, "object-contain");
            } else if (media.length === 2) {
               layoutClass = cn(layoutClass, "aspect-[4/5] bg-black/5");
               mediaClass = cn(mediaClass, "object-cover");
            } else if (media.length === 3) {
               if (index === 0) layoutClass = cn(layoutClass, "col-span-2 aspect-[16/9] bg-black/5");
               else layoutClass = cn(layoutClass, "aspect-square bg-black/5");
               mediaClass = cn(mediaClass, "object-cover");
            } else {
               layoutClass = cn(layoutClass, "aspect-square bg-black/5");
               mediaClass = cn(mediaClass, "object-cover");
            }

            return (
              <div 
                key={index} 
                className={cn(layoutClass, "cursor-pointer group")}
                onClick={() => handleMediaClick(index)}
              >
                {isImage && (
                  <img
                    src={item.url}
                    alt="Post attachment"
                    className={cn(mediaClass, "transition-transform duration-300 group-hover:scale-[1.02]")}
                  />
                )}
                {isVideo && (
                  <video
                    src={item.url}
                    controls={media.length === 1}
                    autoPlay={media.length > 1}
                    muted={media.length > 1}
                    loop
                    preload="metadata"
                    className={cn(mediaClass, media.length > 1 && "pointer-events-none transition-transform duration-300 group-hover:scale-[1.02]")}
                  />
                )}
                {(!isImage && !isVideo) && (
                  <div className="flex flex-col items-center justify-center text-xs text-muted-foreground p-4 text-center group-hover:bg-black/10 w-full h-full transition-colors">
                    <span>{item.originalFilename || `Attachment ${index + 1}`}</span>
                  </div>
                )}
                
                {isExtra && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white backdrop-blur-[2px] transition-colors group-hover:bg-black/60">
                    <span className="text-3xl font-bold tracking-tight shadow-black/50 drop-shadow-md">+{media.length - 4}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      <MediaLightbox 
        media={media}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />

      <div className="mt-auto bg-card">
        {/* Stats Section */}
        <div className="flex items-center justify-between border-b border-border/40 px-4 py-2.5 text-[11px] text-muted-foreground">
          <div className="group flex cursor-pointer items-center gap-1.5">
            <div className={cn(
               "relative z-10 rounded-full border border-white p-0.5 shadow-sm transition-colors",
               isLiked ? "bg-blue-600" : "bg-slate-400 group-hover:bg-blue-500"
            )}>
              <ThumbsUp className="size-3 text-white" fill="currentColor" />
            </div>
            <span className={cn(
              "ml-0.5 font-medium group-hover:underline",
              isLiked ? "text-blue-600" : "text-muted-foreground"
            )}>
              {likeCount}
            </span>
          </div>

          <div className="flex items-center font-medium">
            <span 
              className="cursor-pointer hover:text-blue-600 hover:underline"
              onClick={() => setShowComments(!showComments)}
            >
              {formatStatValue(post?.stats?.commentCount)} comments
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-1 px-1 py-1.5 sm:gap-2 sm:px-2">
          <button 
            onClick={handleLike}
            disabled={isLikingRef.current}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg p-2.5 text-[13px] font-semibold transition-colors sm:gap-2 sm:p-3 sm:text-[14px]",
              isLiked 
                ? "bg-blue-50 text-blue-600" 
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            <ThumbsUp className="size-4 sm:size-4.5" strokeWidth={isLiked ? 2.5 : 2} fill={isLiked ? "currentColor" : "none"} />
            <span>{isLiked ? "Liked" : "Like"}</span>
          </button>
          <button 
            onClick={() => setShowComments(!showComments)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg p-2.5 text-[13px] font-semibold transition-colors sm:gap-2 sm:p-3 sm:text-[14px]",
              showComments
                ? "bg-slate-50 text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            <MessageSquare className="size-4 sm:size-4.5" strokeWidth={2} />
            <span>Comment</span>
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="border-t border-border/40 px-4 pb-4">
            <CommentSection postId={postId} />
          </div>
        )}
      </div>
    </div>
  );
}

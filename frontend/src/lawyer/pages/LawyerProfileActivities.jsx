import { usePosts } from "@/hooks/lawyer/usePosts";
import { usePostForm } from "@/hooks/lawyer/usePostForm";
import CreatePostModal from "@/lawyer/components/activities/CreatePostModal";
import PublishedPostsList from "@/lawyer/components/activities/PublishedPostsList";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Image as ImageIcon, Video } from "lucide-react";

export default function LawyerProfileActivities() {
  const {
    posts,
    setPosts,
    isLoading,
    isRefreshing,
    fetchError,
    successMessage,
    setSuccessMessage,
    refreshPosts,
    deletePost,
  } = usePosts();

  const {
    form,
    isCreating,
    formError,
    fileInputKey,
    isModalOpen,
    setIsModalOpen,
    editingPost,
    handleChange,
    openCreateModal,
    openEditModal,
    handleSubmit,
  } = usePostForm(refreshPosts, setPosts);

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
        handleSubmit={(e) => handleSubmit(e, setSuccessMessage)}
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
        onDelete={deletePost}
      />
    </div>
  );
}


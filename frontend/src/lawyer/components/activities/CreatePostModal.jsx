import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon, Video, X, FileBadge } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import { POST_TYPES, VISIBILITY_OPTIONS } from "./constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const getInitials = (name) => {
  if (!name) return "Me";
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "M";
};

export default function CreatePostModal({
  isOpen,
  onOpenChange,
  form,
  handleChange,
  handleSubmit,
  fileInputKey,
  formError,
  isCreating,
  author,
  isEditMode
}) {
  const fileInputRef = useRef(null);
  const [selectedPreviews, setSelectedPreviews] = useState([]);

  // Clean up object URLs to avoid memory leaks when modal closes or key resets
  useEffect(() => {
    if (!isOpen) {
      selectedPreviews.forEach(preview => {
         if(preview.url) URL.revokeObjectURL(preview.url);
      });
      setSelectedPreviews([]);
    }
  }, [isOpen, fileInputKey]);

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    
    // Revoke old previews
    selectedPreviews.forEach(preview => {
       if(preview.url) URL.revokeObjectURL(preview.url);
    });

    const newPreviews = files.map(file => {
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");
      return {
        url: URL.createObjectURL(file), // Used for preview
        name: file.name,
        isVideo,
        isImage,
      };
    });

    setSelectedPreviews(newPreviews);
  };

  const internalHandleSubmit = (e) => {
    handleSubmit(e);
  };

  const clearSelection = () => {
    if (fileInputRef.current) {
       fileInputRef.current.value = "";
    }
    
    selectedPreviews.forEach(preview => {
       if(preview.url) URL.revokeObjectURL(preview.url);
    });
    setSelectedPreviews([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden gap-0 flex flex-col bg-card" aria-describedby="post-dialog-description">
        <div id="post-dialog-description" className="sr-only">
          Create a new post for your lawyer activity feed.
        </div>
        
        <DialogHeader className="px-6 py-4 border-b border-border/40 flex flex-row items-center">
          <DialogTitle className="text-xl font-medium tracking-tight">
            {isEditMode ? "Edit your post" : "Create a post"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={internalHandleSubmit} className="flex flex-col flex-1 max-h-[80vh] overflow-y-auto">
          <div className="px-6 py-4 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="size-12">
                <AvatarImage src={author?.profilePhoto || ""} alt={author?.name || "Lawyer"} />
                <AvatarFallback>{getInitials(author?.name)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold text-foreground/90">{author?.name || "Lawyer Account"}</span>
                <Select value={form.visibility} onValueChange={handleChange("visibility")}>
                  <SelectTrigger className="h-7 px-2.5 text-[11px] font-semibold border-border/60 bg-muted/40 rounded-full mt-0.5" aria-label="Visibility">
                    <SelectValue placeholder="Visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    {VISIBILITY_OPTIONS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Textarea
              name="content"
              value={form.content}
              onChange={(event) => handleChange("content")(event.target.value)}
              placeholder="What do you want to talk about?"
              className="min-h-[160px] resize-none border-none focus-visible:ring-0 p-0 text-lg placeholder:text-muted-foreground/60 shadow-none bg-transparent"
            />
            
            {/* Media Previews UI */}
            {selectedPreviews.length > 0 && (
              <div className="relative mt-2 rounded-lg border border-border/60 bg-muted/20 p-2">
                 <Button 
                   type="button" 
                   variant="secondary" 
                   size="icon" 
                   className="absolute right-3 top-3 z-10 size-8 rounded-full shadow-md"
                   onClick={clearSelection}
                   title="Remove media"
                 >
                   <X className="size-4" />
                 </Button>
                 <div className="flex w-full items-center justify-center overflow-hidden rounded-md bg-black/5 max-h-[300px]">
                   {selectedPreviews[0].isImage ? (
                     <img src={selectedPreviews[0].url} alt="Preview" className="object-contain max-h-[300px]" />
                   ) : selectedPreviews[0].isVideo ? (
                     <video src={selectedPreviews[0].url} controls className="object-contain max-h-[300px]" />
                   ) : (
                     <div className="flex flex-col items-center justify-center p-10 text-muted-foreground">
                        <FileBadge className="size-16 mb-4 opacity-50" />
                        <span className="font-medium text-sm">{selectedPreviews.length} file(s) selected</span>
                     </div>
                   )}
                 </div>
                 {selectedPreviews.length > 1 && (
                    <div className="mt-2 text-center text-xs font-semibold text-muted-foreground">
                       + {selectedPreviews.length - 1} more file(s)
                    </div>
                 )}
              </div>
            )}
            
            <div className="flex flex-col gap-3 pt-3 border-t border-border/30">
               <Input 
                 placeholder="Add tags (separated by commas) e.g., legal, rights"
                 value={form.tags}
                 onChange={(e) => handleChange("tags")(e.target.value)}
                 className="h-9 border-border/40 border bg-transparent focus-visible:ring-1 px-3 text-[13px]"
               />
               <Select value={form.postType} onValueChange={handleChange("postType")}>
                  <SelectTrigger className="h-9 border-border/40 border bg-transparent focus-visible:ring-1 px-3 text-[13px]" aria-label="Post Type">
                    <SelectValue placeholder="Post Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {POST_TYPES.map((item) => (
                      <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>
            
             {formError && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive mt-2">
                  {formError}
                </p>
              )}
          </div>

          <div className="mt-auto px-6 py-4 flex items-center justify-between border-t border-border/40 bg-muted/10 sticky bottom-0">
            <div className="flex items-center gap-1.5">
               <Button type="button" variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:bg-muted" onClick={triggerFileSelect}>
                  <ImageIcon className="size-6" />
               </Button>
               <Button type="button" variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:bg-muted" onClick={triggerFileSelect}>
                  <Video className="size-6" />
               </Button>
               <input
                  ref={fileInputRef}
                  key={fileInputKey}
                  name="media"
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
               />
               <span className="text-xs font-medium text-muted-foreground ml-1">Add media</span>
            </div>
            
            <Button type="submit" disabled={isCreating} className="rounded-full px-6 font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors">
              {isCreating ? "Saving..." : isEditMode ? "Save Changes" : "Post"}
            </Button>
          </div>
        </form>

      </DialogContent>
    </Dialog>
  );
}

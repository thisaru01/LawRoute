import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PostPreview from "./PostPreview";
import PostsSkeleton from "./PostsSkeleton";

export default function PublishedPostsList({
  posts,
  isLoading,
  fetchError,
  refreshPosts,
  onEdit,
  onDelete
}) {
  return (
    <Card className="border-border/60 shadow-sm overflow-hidden text-center sm:text-left">
      <CardHeader className="border-b border-border/60 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-left">
            <CardTitle>Activity</CardTitle>
            <CardDescription>
              Review all posts created from your lawyer account.
            </CardDescription>
          </div>
          <Button asChild variant="outline" className="rounded-full font-semibold" size="sm">
            <Link to="/lawyer/profile/details">
              View profile
              <ArrowUpRight className="size-4 ml-1" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6">
             <PostsSkeleton />
          </div>
        ) : fetchError ? (
          <div className="p-6">
            <div className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Unable to load posts</p>
              <p className="mt-1 text-xs">{fetchError}</p>
              <Button className="mt-4" variant="outline" onClick={() => refreshPosts()}>
                Try again
              </Button>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-6">
            <div className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
              <p className="font-medium text-foreground">No posts yet</p>
              <p className="mt-1 text-xs">
                Publish your first update using the form on the left.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="flex gap-4 overflow-x-auto p-4 snap-x scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {posts.map((post) => (
                <div key={post._id || post.id} className="w-[360px] min-w-[360px] snap-center flex-shrink-0">
                  <PostPreview post={post} onEdit={onEdit} onDelete={onDelete} />
                </div>
              ))}
            </div>
            
            <div className="border-t border-border/60 text-center hover:bg-muted/30 transition-colors">
               <button className="w-full font-semibold text-muted-foreground py-3 flex items-center justify-center gap-2 hover:text-foreground">
                 Show all posts <ArrowRight className="size-4" />
               </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

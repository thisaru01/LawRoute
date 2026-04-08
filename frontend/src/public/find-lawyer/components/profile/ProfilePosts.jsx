import { useEffect, useState } from "react";
import { getLawyerPosts } from "@/api/services/socialService";
import PostPreview from "@/lawyer/components/activities/PostPreview";
import PostsSkeleton from "@/lawyer/components/activities/PostsSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MessageSquareOff, Newspaper } from "lucide-react";

export default function ProfilePosts({ lawyerId }) {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPosts = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await getLawyerPosts(lawyerId, { limit: 12 });
      setPosts(response.data?.posts || []);
    } catch (err) {
      setError("Failed to load posts.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (lawyerId) {
      fetchPosts();
    }
  }, [lawyerId]);

  return (
    <Card className="border-none shadow-md bg-white dark:bg-slate-900 overflow-hidden">
      <CardHeader className="border-b border-border/40 pb-5">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Newspaper className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold">Insights & Activity</CardTitle>
            <CardDescription className="mt-1 text-xs sm:text-sm">
              Legal awareness and professional highlights shared by this lawyer
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6">
             <PostsSkeleton />
          </div>
        ) : error ? (
          <div className="text-center py-12 px-6">
            <p className="text-sm text-muted-foreground mb-4 font-medium">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchPosts} className="rounded-full px-6">
              Try Again
            </Button>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24 flex flex-col items-center justify-center space-y-4 px-6">
            <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-full ring-8 ring-slate-50/50 dark:ring-slate-800/50">
              <MessageSquareOff className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <div className="max-w-xs mx-auto">
              <p className="text-foreground font-semibold">No Activity Yet</p>
              <p className="text-sm text-muted-foreground mt-1 text-balance">
                This lawyer hasn't shared any public updates or legal insights yet.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map((post) => (
                <div key={post._id || post.id} className="w-full">
                  <PostPreview post={post} />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

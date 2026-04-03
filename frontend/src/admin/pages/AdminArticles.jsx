import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMyArticles, getPendingOthersArticles, getPublishedArticles } from "@/api/services/articleService";
import PendingArticleCard from "@/admin/components/PendingArticleCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/auth/useAuth";

const allowedStatuses = new Set(["pending", "published", "rejected"]);

export default function AdminArticles() {
  const { status } = useParams();
  const normalizedStatus = (status ?? "pending").toLowerCase();

  const safeStatus = allowedStatuses.has(normalizedStatus)
    ? normalizedStatus
    : "pending";

  const label =
    safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1).toLowerCase();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("own"); // 'own' | 'others'
  const { userId } = useAuth();

  useEffect(() => {
    let mounted = true;

    const fetchArticles = async () => {
      setLoading(true);
      setError(null);
      try {
        let res;
        let list = [];

        if (safeStatus === "pending") {
          if (tab === "own") {
            // /articles/me returns all statuses; filter to pending
            res = await getMyArticles();
            list = (res?.data?.articles || []).filter(
              (a) => String(a.status || "").toLowerCase() === "pending",
            );
          } else {
            // Pending articles authored by others
            res = await getPendingOthersArticles();
            list = res?.data?.articles || [];
          }
        } else if (safeStatus === "published") {
          // All published articles; split into own vs others by author id
          res = await getPublishedArticles();
          const all = res?.data?.articles || [];
          list = all.filter((a) => {
            const authorId = a?.author?._id ?? a?.author;
            if (!authorId || !userId) return tab === "others";
            const isOwn = String(authorId) === String(userId);
            return tab === "own" ? isOwn : !isOwn;
          });
        } else {
          list = [];
        }

        if (!mounted) return;
        setArticles(list);
      } catch (err) {
        if (!mounted) return;
        setError(err?.message || "Failed to load articles");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchArticles();

    return () => {
      mounted = false;
    };
  }, [safeStatus, tab, userId]);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Articles</h1>
      {/* <p className="mt-2 text-sm text-muted-foreground">Status: {label}</p> */}

      <div className="mt-3" aria-hidden={false}>
        <Tabs value={tab} onValueChange={(v) => setTab(v)}>
          <TabsList variant="line">
              <TabsTrigger value="own">Own</TabsTrigger>
              <TabsTrigger value="others">Others</TabsTrigger>
            </TabsList>
        </Tabs>
      </div>

      <div className="mt-6">
        {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}

        {!loading && !error && articles.length === 0 && (
          <p className="text-sm text-muted-foreground">No articles found.</p>
        )}

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((a) => (
            <PendingArticleCard key={a._id || a.id} article={a} />
          ))}
        </div>
      </div>
    </div>
  );
}

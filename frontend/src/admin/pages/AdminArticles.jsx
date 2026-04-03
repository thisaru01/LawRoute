import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMyArticles, getPendingOthersArticles } from "@/api/services/articleService";
import PendingArticleCard from "@/admin/components/PendingArticleCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  useEffect(() => {
    let mounted = true;

    const fetchPending = async () => {
      if (safeStatus !== "pending") {
        setArticles([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        let res;
        if (tab === "own") {
          // Use /articles/me — returns authenticated user's articles
          res = await getMyArticles();
        } else {
          // Use /articles/pending/others to get other users' pending articles
          res = await getPendingOthersArticles();
        }

        if (!mounted) return;
        setArticles(res?.data?.articles || []);
      } catch (err) {
        if (!mounted) return;
        setError(err?.message || "Failed to load articles");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPending();

    return () => {
      mounted = false;
    };
  }, [safeStatus, tab]);

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

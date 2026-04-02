import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMyArticles } from "@/api/services/articleService";
import PendingArticleCard from "@/admin/components/PendingArticleCard";

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
        // Use /articles/me as requested — returns authenticated user's articles
        const res = await getMyArticles();
        if (!mounted) return;
        // API returns { success, count, articles: [...] }
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
  }, [safeStatus]);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Articles</h1>
      <p className="mt-2 text-sm text-muted-foreground">Status: {label}</p>

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

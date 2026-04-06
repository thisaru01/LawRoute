import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMyArticles } from "@/api/services/articleService";
import PendingArticleCard from "@/admin/components/articles/PendingArticleCard";
import { useAuth } from "@/context/auth/useAuth";

const ALLOWED = new Set(["pending", "published", "rejected"]);

export default function LawyerArticles() {
  const { status } = useParams();
  const normalizedStatus = (status ?? "pending").toLowerCase();
  const activeStatus = ALLOWED.has(normalizedStatus) ? normalizedStatus : "pending";

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { userId } = useAuth();

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getMyArticles();
        const all = res?.data?.articles || res?.data || [];
        const filtered = all.filter((a) => String(a.status || "").toLowerCase() === activeStatus);
        if (!mounted) return;
        setArticles(filtered);
      } catch (err) {
        if (!mounted) return;
        setError(err?.message || "Failed to load articles");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetch();

    return () => {
      mounted = false;
    };
  }, [activeStatus, userId]);

  return (
    <div>
      <h1 className="text-2xl font-semibold">My {activeStatus.charAt(0).toUpperCase() + activeStatus.slice(1)} Articles</h1>

      <div className="mt-6">
        {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}

        {!loading && !error && articles.length === 0 && (
          <p className="text-sm text-muted-foreground">No {activeStatus} articles found.</p>
        )}

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((a) => (
            <PendingArticleCard key={a._id || a.id} article={a} status={activeStatus} routePrefix="/lawyer/articles" />
          ))}
        </div>
      </div>
    </div>
  );
}

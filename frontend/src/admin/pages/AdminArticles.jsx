import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMyArticles, getPendingOthersArticles, getPublishedArticles, getArticlesByStatus } from "@/api/services/articleService";
import PendingArticleCard from "@/admin/components/articles/PendingArticleCard";
import { FileText } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth/useAuth";
import EmptyState from "@/components/consultation-requests/EmptyState";

const allowedStatuses = new Set(["pending", "published", "rejected"]);

export default function AdminArticles() {
  const { status } = useParams();
  const location = useLocation();
  const normalizedStatus = (status ?? "pending").toLowerCase();

  const safeStatus = allowedStatuses.has(normalizedStatus)
    ? normalizedStatus
    : "pending";

  const label =
    safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1).toLowerCase();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const initialTab =
    location.state?.ownerScope === "others" ? "others" : "own";
  const [tab, setTab] = useState(initialTab); // 'own' | 'others'
  const { userId } = useAuth();

  const statusBadgeClassName = `ml-2 text-[11px] rounded-full px-3 py-1 capitalize border-none ${
    safeStatus === "pending"
      ? "bg-amber-50 text-amber-700"
      : safeStatus === "published"
        ? "bg-emerald-50 text-emerald-700"
        : safeStatus === "rejected"
          ? "bg-red-50 text-red-700"
          : "bg-muted text-muted-foreground"
  }`;

  const emptyStateMessage = (() => {
    if (safeStatus === "pending") {
      if (tab === "own") {
        return "You don't have any pending articles. Submit a new article to see it listed here.";
      }
      return "There are no pending articles from other authors at the moment.";
    }

    if (safeStatus === "published") {
      if (tab === "own") {
        return "You haven't published any articles yet. Once you publish, they'll appear here.";
      }
      return "No published articles from other authors match this filter yet.";
    }

    if (safeStatus === "rejected") {
      if (tab === "own") {
        return "None of your articles are currently rejected. If an article gets rejected, it will show up here with details.";
      }
      return "There are no rejected articles from other authors right now.";
    }

    return undefined;
  })();

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
        } else if (safeStatus === "rejected") {
          // All rejected articles via /articles?status=rejected; split own vs others
          res = await getArticlesByStatus("rejected");
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
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold">Articles</h1>
        <Badge variant="secondary" className={statusBadgeClassName}>
          {label}
        </Badge>
      </div>

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
          <EmptyState
            title="No articles found."
            message={emptyStateMessage}
            icon={<FileText className="mb-2 h-7 w-7 opacity-30" />}
          />
        )}

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((a) => (
            <PendingArticleCard
              key={a._id || a.id}
              article={a}
              status={safeStatus}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

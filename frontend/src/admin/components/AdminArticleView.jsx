import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getArticle, updateArticleStatus } from "@/api/services/articleService";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/context/auth/useAuth";
import RelatedArticlesSidebar from "@/admin/components/RelatedArticlesSidebar";
import ArticleEditForm from "@/admin/components/ArticleEditForm";

const allowedStatuses = new Set(["pending", "published", "rejected"]);

export default function AdminArticleView() {
  const { id, status: routeStatus } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState("");
  const { userId } = useAuth();
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await getArticle(id);
        if (!mounted) return;
        setArticle(res?.data?.article || res?.data || null);
      } catch (e) {
        setError(e?.message || "Failed to load article");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!article) return <div className="p-6">Article not found.</div>;

  const normalizedRouteStatus = String(routeStatus || "pending").toLowerCase();
  const sidebarStatus = allowedStatuses.has(normalizedRouteStatus)
    ? normalizedRouteStatus
    : "pending";

  const authorId = article?.author?._id ?? article?.author;
  const isAuthor = authorId && String(authorId) === String(userId);
  const ownerScope = isAuthor ? "own" : "others";

  const handleChangeStatus = async (nextStatus) => {
    if (!article?._id && !article?.id) return;
    setStatusError("");
    try {
      setUpdatingStatus(true);
      const res = await updateArticleStatus(article._id || article.id, nextStatus);
      const updated = res?.data?.article;
      if (updated) {
        setArticle(updated);
      }
    } catch (e) {
      setStatusError(e?.message || "Failed to update article status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-2">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-9 lg:pr-4 lg:border-r lg:border-muted-foreground/20 lg:-mt-8 lg:pt-16">
      <div className="flex items-center gap-4 mb-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="inline-flex items-center justify-center w-10 h-10 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <ArrowLeft size={18} />
        </button>

        <h1 className="text-2xl font-bold m-0">{article.title}</h1>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
        <div className="flex items-center">
          <div>{article.category || ""}</div>

          {(() => {
            const a = article?.author;
            let ownerName = "";
            try {
              if (!a) ownerName = "";
              else if (typeof a === "string") ownerName = a;
              else if (typeof a === "object") {
                ownerName = a.name || a.fullName || a.username || `${a.firstName || a.firstname || ""} ${a.lastName || a.lastname || ""}`.trim() || a.email || "";
              }
            } catch (e) {
              ownerName = "";
            }

            if (ownerName) {
              return (
                <>
                  <div className="mx-2">·</div>
                  <div>{ownerName}</div>
                </>
              );
            }

            return null;
          })()}

          {(() => {
            const d = article.createdAt || article.created_at || article.created || article.createdOn;
            if (!d) return null;
            try {
              return (
                <>
                  <div className="mx-2">·</div>
                  <div>
                    {new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                  </div>
                </>
              );
            } catch (e) {
              return null;
            }
          })()}
        </div>

        <div className="flex items-center gap-2">
          {(() => {
            if (isAuthor) {
              return (
                <>
                  <button
                    type="button"
                    aria-label="Edit article"
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    type="button"
                    aria-label="Delete article"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-md text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              );
            }

            return (
            <>
              <button
                type="button"
                aria-label="Publish article"
                onClick={() => handleChangeStatus("published")}
                disabled={updatingStatus}
                className="inline-flex items-center justify-center px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
              >
                Publish
              </button>

              <button
                type="button"
                aria-label="Reject article"
                onClick={() => handleChangeStatus("rejected")}
                disabled={updatingStatus}
                className="inline-flex items-center justify-center px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
              >
                Reject
              </button>
            </>
            );
          })()}
        </div>
        {statusError && (
          <div className="mt-1 text-xs text-red-600">{statusError}</div>
        )}
      </div>

      {editing && (
        <ArticleEditForm
          article={article}
          onCancel={() => setEditing(false)}
          onUpdated={(updated) => {
            setArticle(updated);
            setEditing(false);
          }}
        />
      )}

      {!editing && (
        <>
          {/** Use main image if available, otherwise fall back to imagecardUrl */}
          {(article.imageUrl || article.imagecardUrl) && (
            <img
              src={article.imageUrl || article.imagecardUrl}
              alt={article.title}
              className="w-full h-96 object-cover rounded-lg mb-6"
            />
          )}

          {article.subtitle && <p className="text-muted-foreground mb-4">{article.subtitle}</p>}

          {article.content ? (
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
          ) : (
            <p>{article.excerpt || article.description}</p>
          )}
        </>
      )}
        </div>

        <RelatedArticlesSidebar
          currentArticleId={article._id}
          status={sidebarStatus}
          ownerScope={ownerScope}
        />
      </div>
    </div>
  );
}

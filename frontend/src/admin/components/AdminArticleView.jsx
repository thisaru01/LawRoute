import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getArticle } from "@/api/services/articleService";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import RelatedArticlesSidebar from "@/admin/components/RelatedArticlesSidebar";

export default function AdminArticleView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          <button
            type="button"
            aria-label="Edit article"
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
        </div>
      </div>

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
        </div>

        <RelatedArticlesSidebar currentArticleId={article._id} status="pending" />
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getArticle } from "@/api/services/articleService";
import { ArrowLeft } from "lucide-react";
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
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
      <div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="inline-flex items-center justify-center w-10 h-10 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted mb-4"
        >
          <ArrowLeft size={18} />
        </button>
      </div>
      {/** Use main image if available, otherwise fall back to imagecardUrl */}
      {(article.imageUrl || article.imagecardUrl) && (
        <img
          src={article.imageUrl || article.imagecardUrl}
          alt={article.title}
          className="w-full h-64 object-cover rounded-lg mb-6"
        />
      )}

      <h1 className="text-2xl font-bold mb-3">{article.title}</h1>

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

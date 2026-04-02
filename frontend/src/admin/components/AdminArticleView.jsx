import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getArticle } from "@/api/services/articleService";

export default function AdminArticleView() {
  const { id } = useParams();
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
    <div className="max-w-4xl mx-auto p-6">
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
  );
}

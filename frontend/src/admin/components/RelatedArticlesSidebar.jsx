import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { getPendingOthersArticles, getMyArticles } from "@/api/services/articleService";

export default function RelatedArticlesSidebar({ currentArticleId, status = "pending" }) {
  const [related, setRelated] = useState([]);

  const fetchRelated = useCallback(async () => {
    if (!currentArticleId) return;

    try {
      const res = await getPendingOthersArticles();
      const items = res?.data?.articles || res?.data || [];
      const filtered = items
        .filter((a) => String(a._id || a.id) !== String(currentArticleId))
        .slice(0, 6);
      if (filtered.length > 0) {
        setRelated(filtered);
        return;
      }
    } catch (e) {
      // ignore and fall back
    }

    try {
      const res2 = await getMyArticles();
      const items2 = res2?.data?.articles || res2?.data || [];
      const pending = items2
        .filter(
          (a) =>
            a.status === "pending" &&
            String(a._id || a.id) !== String(currentArticleId),
        )
        .slice(0, 6);
      setRelated(pending);
    } catch (e) {
      // ignore
    }
  }, [currentArticleId]);

  useEffect(() => {
    fetchRelated();
  }, [fetchRelated]);

  if (!related.length) return null;

  return (
    <aside className="lg:col-span-1">
      <h3 className="text-lg font-semibold mb-4">Related Articles</h3>
      <div className="space-y-4">
        {related.map((r) => (
          <Card key={r._id || r.id} className="p-0 py-0">
            <Link
              to={`/admin/articles/${status}/${r._id || r.id}`}
              className="block w-full p-3 flex items-stretch gap-3 h-28"
            >
              <img
                src={r.imagecardUrl || r.imageUrl}
                alt={r.title}
                className="w-32 h-full object-cover rounded-lg flex-shrink-0"
              />

              <div className="flex-1 min-w-0">
                <div
                  className="text-sm font-medium leading-tight"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {r.title}
                </div>
                {r.category && (
                  <div className="text-xs text-muted-foreground mt-1">{r.category}</div>
                )}
              </div>
            </Link>
          </Card>
        ))}
      </div>
    </aside>
  );
}

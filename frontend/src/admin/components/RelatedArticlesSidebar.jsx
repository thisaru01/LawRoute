import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/auth/useAuth";
import {
  getPendingOthersArticles,
  getMyArticles,
  getPublishedArticles,
  getArticlesByStatus,
} from "@/api/services/articleService";

export default function RelatedArticlesSidebar({
  currentArticleId,
  status = "pending",
  ownerScope = "others", // 'own' | 'others'
}) {
  const [related, setRelated] = useState([]);
  const { userId } = useAuth();

  const fetchRelated = useCallback(async () => {
    if (!currentArticleId) return;

    try {
      let res;
      let items = [];
      const normalizedStatus = String(status || "pending").toLowerCase();

      if (normalizedStatus === "pending") {
        if (ownerScope === "others") {
          res = await getPendingOthersArticles();
          items = res?.data?.articles || res?.data || [];
        } else {
          res = await getMyArticles();
          const all = res?.data?.articles || res?.data || [];
          items = all.filter(
            (a) => String(a.status || "").toLowerCase() === "pending",
          );
        }
      } else if (normalizedStatus === "published") {
        res = await getPublishedArticles();
        items = res?.data?.articles || res?.data || [];
      } else if (normalizedStatus === "rejected") {
        res = await getArticlesByStatus("rejected");
        items = res?.data?.articles || res?.data || [];
      }

      if (!items.length) {
        setRelated([]);
        return;
      }

      // For published/rejected, and pending fetched via generic lists, split by ownerScope
      if (normalizedStatus !== "pending" || ownerScope === "own") {
        items = items.filter((a) => {
          const authorId = a?.author?._id ?? a?.author;
          if (!authorId || !userId) return ownerScope === "others";
          const isOwn = String(authorId) === String(userId);
          return ownerScope === "own" ? isOwn : !isOwn;
        });
      }

      const filtered = items
        .filter((a) => String(a._id || a.id) !== String(currentArticleId))
        .slice(0, 6);

      setRelated(filtered);
    } catch (e) {
      setRelated([]);
    }
  }, [currentArticleId, status, ownerScope, userId]);

  useEffect(() => {
    fetchRelated();
  }, [fetchRelated]);

  if (!related.length) return null;

  return (
    <aside className="lg:col-span-3 lg:pl-1">
      <h3 className="text-lg font-semibold mb-4">Related Articles</h3>
      <div className="space-y-4">
        {related.map((r) => (
          <Card key={r._id || r.id} className="p-0 py-0">
            <Link
              to={`/admin/articles/${status}/${r._id || r.id}`}
              className="block w-full p-4 flex items-stretch gap-4 h-28"
            >
              <img
                src={r.imagecardUrl || r.imageUrl}
                alt={r.title}
                className="w-28 h-full object-cover rounded-lg flex-shrink-0"
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

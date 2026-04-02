import React from "react";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

function formatDate(d) {
  try {
    if (!d) return "";
    return new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (e) {
    return "";
  }
}

function truncate(str, n = 200) {
  if (!str) return "";
  const s = String(str).replace(/\s+/g, ' ').trim();
  return s.length > n ? s.slice(0, n).trim() + '…' : s;
}

export default function PendingArticleCard({ article }) {
  return (
    <Link to={`/admin/articles/pending/${article?._id || article?.id}`} className="block">
      <Card className="relative overflow-hidden group transform transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
      {article?.imagecardUrl && (
        <>
          <img
            src={article.imagecardUrl}
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* spacer controls card height */}
          <div className="h-64" />
        </>
      )}

      {/* top-left title removed to avoid duplicate with bottom overlay */}
        {/* bottom overlay with large title and excerpt (like screenshot) */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent text-white">
          <div className="flex flex-col">
            <h3 className="text-2xl font-semibold mb-2">{article?.title || "Untitled"}</h3>

            {(article?.excerpt || article?.content || article?.description) && (
              <p className="text-sm max-w-3xl opacity-90">{truncate(article?.excerpt || article?.content || article?.description, 120)}</p>
            )}

            {article?.createdAt && (
              <div className="mt-3 text-xs text-white/80 text-right">{formatDate(article.createdAt)}</div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

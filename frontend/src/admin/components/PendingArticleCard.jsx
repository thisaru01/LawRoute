import React from "react";

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

export default function PendingArticleCard({ article }) {
  return (
    <div className="border rounded-md p-4 shadow-sm bg-white">
      {article?.imagecardUrl && (
        <img
          src={article.imagecardUrl}
          alt={article.title}
          className="w-full h-36 object-cover rounded-md mb-3"
        />
      )}

      <h3 className="text-lg font-medium text-foreground">{article?.title || "Untitled"}</h3>

      {article?.createdAt && (
        <div className="mt-2 text-xs text-muted-foreground">
          {formatDate(article.createdAt)}
        </div>
      )}
    </div>
  );
}

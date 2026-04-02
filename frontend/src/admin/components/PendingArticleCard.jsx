import React from "react";
import { Card } from "@/components/ui/card";

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
    <Card className="relative overflow-hidden">
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

      {/* overlay with title and date */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent text-white">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium mr-2">{article?.title || "Untitled"}</h3>

          {article?.createdAt && (
            <div className="text-xs">{formatDate(article.createdAt)}</div>
          )}
        </div>
      </div>
    </Card>
  );
}

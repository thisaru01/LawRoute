import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar.jsx";
import { getPublishedArticles } from "@/api/services/articleService";
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

function truncate(str, n = 180) {
  if (!str) return "";
  const s = String(str).replace(/\s+/g, " ").trim();
  return s.length > n ? s.slice(0, n).trim() + "…" : s;
}

export default function PublicArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function fetchArticles() {
      setLoading(true);
      setError(null);
      try {
        const res = await getPublishedArticles();
        const list = res?.data?.articles || [];
        if (!mounted) return;
        setArticles(list);
      } catch (err) {
        if (!mounted) return;
        setError(err?.message || "Failed to load articles");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchArticles();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main>
        <section className="bg-slate-50 py-10 sm:py-14 border-b border-slate-200">
          <div className="mx-auto w-full max-w-6xl px-4 space-y-6">
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Legal Library
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Articles & Guides
              </h1>
              <p className="text-sm sm:text-base text-slate-500 max-w-2xl">
                Browse published legal articles written by verified lawyers and
                authorities. These do not replace legal advice, but can help you
                understand common topics and procedures.
              </p>
            </div>

            {loading && (
              <div className="text-center py-14 sm:py-20">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="mt-4 text-slate-500">Loading articles...</p>
              </div>
            )}

            {error && !loading && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-red-900">Unable to Load Articles</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setLoading(true);
                    getPublishedArticles()
                      .then((res) => {
                        const list = res?.data?.articles || [];
                        setArticles(list);
                      })
                      .catch((err) => {
                        setError(err?.message || "Failed to load articles");
                      })
                      .finally(() => setLoading(false));
                  }}
                  className="text-sm font-medium text-red-700 hover:text-red-800 underline"
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {articles.length === 0 ? (
                  <p className="text-sm text-slate-500 col-span-full">
                    No articles have been published yet.
                  </p>
                ) : (
                  articles.map((article) => (
                    <ArticleCard key={article._id || article.id} article={article} />
                  ))
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-600">
          © {new Date().getFullYear()} LawRoute
        </div>
      </footer>
    </div>
  );
}

function ArticleCard({ article }) {
  const hasImage = Boolean(article?.imagecardUrl || article?.imageUrl);
  const imageSrc = article?.imagecardUrl || article?.imageUrl || "";

  return (
    <Card className="flex h-full flex-col overflow-hidden border border-slate-200 bg-white shadow-sm">
      {hasImage && (
        <div className="relative w-full overflow-hidden bg-slate-100">
          <img
            src={imageSrc}
            alt={article?.title || "Article image"}
            className="h-40 w-full object-cover transition-transform duration-200 hover:scale-[1.02]"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-4 space-y-2">
        <h2 className="text-base font-semibold text-slate-900 line-clamp-2">
          {article?.title || "Untitled article"}
        </h2>

        {article?.excerpt || article?.description || article?.content ? (
          <p className="text-sm text-slate-600 line-clamp-4">
            {truncate(article.excerpt || article.description || article.content, 160)}
          </p>
        ) : null}

        <div className="mt-auto pt-3 flex items-center justify-between text-xs text-slate-500">
          {article?.category && (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
              {String(article.category).charAt(0).toUpperCase() + String(article.category).slice(1)}
            </span>
          )}

          {article?.createdAt && (
            <span>{formatDate(article.createdAt)}</span>
          )}
        </div>
      </div>
    </Card>
  );
}

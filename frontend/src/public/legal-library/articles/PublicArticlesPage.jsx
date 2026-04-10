import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar.jsx";
import { getPublishedArticles } from "@/api/services/articleService";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import EmptyState from "@/components/consultation-requests/EmptyState";
import { FileText } from "lucide-react";

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
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Articles & Guides
              </h1>
              {/* <p className="mt-2 text-muted-foreground">
                Articles & Guides
              </p> */}
              <p className="text-sm sm:text-base text-slate-500 max-w-2xl">
                Browse published legal articles written by verified lawyers and authorities. These do not replace legal advice, but can help you
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
                  <EmptyState
                    title="No articles have been published yet."
                    message={"Check back later for new articles published by verified authors."}
                    icon={<FileText className="mb-2 h-7 w-7 opacity-30" />}
                  />
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
  const id = article?._id || article?.id;

  return (
    <Link to={`/legal-library/articles/${id}`} className="block">
      <Card className="relative overflow-hidden group transform transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
        {hasImage && (
          <>
            <img
              src={imageSrc}
              alt={article?.title || "Article image"}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="h-64" />
          </>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent p-6 text-white">
          <div className="flex flex-col">
            <h3 className="mb-2 text-2xl font-semibold">
              {article?.title || "Untitled"}
            </h3>

            {(article?.excerpt || article?.content || article?.description) && (
              <p className="max-w-3xl text-sm opacity-90">
                {truncate(
                  article?.excerpt || article?.content || article?.description,
                  120,
                )}
              </p>
            )}

            {article?.createdAt && (
              <div className="mt-3 text-right text-xs text-white/80">
                {formatDate(article.createdAt)}
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar.jsx";
import { getArticle } from "@/api/services/articleService";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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

export default function PublicArticleView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;

    async function fetchArticle() {
      setLoading(true);
      setError(null);
      try {
        const res = await getArticle(id);
        if (!mounted) return;
        setArticle(res?.data?.article || null);
      } catch (err) {
        if (!mounted) return;
        setError(err?.message || "Failed to load article");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchArticle();

    return () => {
      mounted = false;
    };
  }, [id]);

  const hasHeroImage = Boolean(article?.imageUrl || article?.imagecardUrl);
  const heroSrc = article?.imageUrl || article?.imagecardUrl || "";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main>
        <section className="bg-slate-50 border-b border-slate-200">
          <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:py-10">
            {/* back button displayed next to the title for horizontal alignment */}

            {loading && (
              <div className="py-16 text-center text-slate-500">
                Loading article...
              </div>
            )}

            {error && !loading && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {!loading && !error && article && (
              <article className="space-y-6">
                <header className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                      onClick={() => navigate(-1)}
                      aria-label="Back to articles"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>

                    <div>
                      <h1 className="text-3xl font-semibold tracking-tight text-slate-900 min-w-0 truncate">
                        {article.title || "Untitled"}
                      </h1>
                      {article.createdAt && (
                        <div className="mt-1 text-xs text-slate-500">
                          {formatDate(article.createdAt)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 whitespace-nowrap">
                    {article.category && (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                        {String(article.category).charAt(0).toUpperCase() + String(article.category).slice(1)}
                      </span>
                    )}
                  </div>
                </header>

                {hasHeroImage && (
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                    <img
                      src={heroSrc}
                      alt={article.title || "Article image"}
                      className="h-64 w-full object-cover sm:h-80"
                    />
                  </div>
                )}

                {article.content && (
                  <section className="prose prose-sm max-w-none prose-headings:text-slate-900 prose-p:text-slate-800 prose-a:text-slate-900">
                    <p className="whitespace-pre-line leading-relaxed text-slate-800">
                      {article.content}
                    </p>
                  </section>
                )}

                {!article.content && !hasHeroImage && (
                  <p className="text-sm text-slate-500">No additional details available for this article.</p>
                )}
              </article>
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

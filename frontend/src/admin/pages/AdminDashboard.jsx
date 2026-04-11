import { useEffect, useState } from "react";
import { FileText, Briefcase, Scale, AlertCircle, Loader2 } from "lucide-react";

import { getAllCasesForAdmin } from "@/api/services/caseService";
import {
  getPendingOthersArticles,
  getPublishedArticles,
  getArticlesByStatus,
} from "@/api/services/articleService";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const [overview, setOverview] = useState({
    cases: { open: 0, closed: 0 },
    articles: { pending: 0, published: 0, rejected: 0 },
  });
  const [recent, setRecent] = useState({
    cases: [],
    pendingArticles: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [openCasesRes, closedCasesRes, pendingArticlesRes, publishedRes, rejectedRes] =
          await Promise.all([
            getAllCasesForAdmin("open"),
            getAllCasesForAdmin("closed"),
            getPendingOthersArticles(),
            getPublishedArticles(),
            getArticlesByStatus("rejected"),
          ]);

        if (cancelled) return;

        const openCases = Array.isArray(openCasesRes?.data?.data)
          ? openCasesRes.data.data
          : openCasesRes?.data?.cases || [];
        const closedCases = Array.isArray(closedCasesRes?.data?.data)
          ? closedCasesRes.data.data
          : closedCasesRes?.data?.cases || [];

        const pendingArticles = pendingArticlesRes?.data?.articles || [];
        const publishedArticles = publishedRes?.data?.articles || [];
        const rejectedArticles = rejectedRes?.data?.articles || [];

        setOverview({
          cases: {
            open: openCases.length,
            closed: closedCases.length,
          },
          articles: {
            pending: pendingArticles.length,
            published: publishedArticles.length,
            rejected: rejectedArticles.length,
          },
        });

        setRecent({
          cases: openCases.slice(0, 5),
          pendingArticles: pendingArticles.slice(0, 5),
        });
      } catch (err) {
        if (cancelled) return;
        setError(err?.message || "Failed to load admin overview");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/40 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>Unable to load dashboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive/90">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of current cases and articles.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <span className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                Open cases
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {overview.cases.open}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Cases that are currently active and in progress.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <span className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                Closed cases
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {overview.cases.closed}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Cases that have been resolved and closed.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Pending articles
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {overview.articles.pending}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Articles submitted by others waiting for review.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-500" />
                Published articles
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {overview.articles.published}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Articles currently published and visible to users.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-destructive" />
                Rejected articles
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {overview.articles.rejected}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Articles that were reviewed and rejected by admins.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <span className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-muted-foreground" />
                Civil issues
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Detailed civil issue breakdown is available in the Civil Issues
              admin section.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <span className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                Recent open cases
              </span>
              <Badge variant="outline" className="text-[11px]">
                {recent.cases.length} shown
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recent.cases.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No open cases found.
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {recent.cases.map((c) => (
                  <li
                    key={c._id}
                    className="flex items-center justify-between gap-2 rounded border bg-card/60 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {c?.consultationRequest?.summary || "Case"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {c?.user?.name || "Citizen"} 
                        {c?.lawyer?.name ? `• ${c.lawyer.name}` : ""}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-[11px]">
                      open
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Pending articles to review
              </span>
              <Badge variant="outline" className="text-[11px]">
                {recent.pendingArticles.length} shown
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recent.pendingArticles.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No pending articles from other authors.
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {recent.pendingArticles.map((a) => (
                  <li
                    key={a._id}
                    className="flex items-center justify-between gap-2 rounded border bg-card/60 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{a.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {a?.author?.name || "Author"}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-[11px]">
                      pending
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

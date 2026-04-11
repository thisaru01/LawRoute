import { Link } from "react-router-dom";
import {
  Briefcase,
  MessageSquare,
  Scale,
  ArrowRight,
  TrendingUp,
  Search,
  FileText,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { useAuth } from "@/context/auth/useAuth";
import { useCitizenDashboard } from "@/citizen/hooks/useCitizenDashboard";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import StatCard from "@/citizen/components/dashboard/StatCard";
import QuickAction from "@/citizen/components/dashboard/QuickAction";
import RecentItemRow from "@/citizen/components/dashboard/RecentItemRow";
import DashboardSkeleton from "@/citizen/components/dashboard/DashboardSkeleton";

/**
 * Returns a time-based greeting string.
 */
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function CitizenDashboard() {
  const { user } = useAuth();
  const {
    isLoading,
    error,
    stats,
    recentConsultations,
    recentCases,
    recentCivilIssues,
    refresh,
  } = useCitizenDashboard();

  const firstName = user?.name?.split(" ")[0] || "there";
  const greeting = getGreeting();

  if (isLoading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome to your citizen dashboard.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Couldn't load dashboard
            </CardTitle>
            <CardDescription className="text-destructive">
              {error.message || "An unexpected error occurred."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={refresh}>
              <RefreshCw className="mr-2 h-4 w-4" /> Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ---- Greeting ---- */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {greeting}, {firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here's what's happening with your legal matters.
        </p>
      </div>

      {/* ---- Stat cards ---- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={MessageSquare}
          label="Consultations"
          value={stats.consultations.total}
          href="/citizen/consultation-requests/pending"
          gradient="linear-gradient(135deg, #6366f1, #8b5cf6)"
          breakdowns={[
            {
              label: "Pending",
              count: stats.consultations.pending,
              color: "#f59e0b",
            },
            {
              label: "Accepted",
              count: stats.consultations.accepted,
              color: "#22c55e",
            },
            {
              label: "Rejected",
              count: stats.consultations.rejected,
              color: "#ef4444",
            },
          ]}
        />

        <StatCard
          icon={Briefcase}
          label="Cases"
          value={stats.cases.total}
          href="/citizen/cases/opened"
          gradient="linear-gradient(135deg, #0ea5e9, #06b6d4)"
          breakdowns={[
            { label: "Open", count: stats.cases.open, color: "#3b82f6" },
            { label: "Closed", count: stats.cases.closed, color: "#22c55e" },
          ]}
        />

        <StatCard
          icon={Scale}
          label="Civil Issues"
          value={stats.civilIssues.total}
          href="/citizen/civil-issues/pending"
          gradient="linear-gradient(135deg, #f97316, #ef4444)"
          breakdowns={[
            {
              label: "Pending",
              count: stats.civilIssues.pending,
              color: "#f59e0b",
            },
            {
              label: "In Progress",
              count: stats.civilIssues.inProgress,
              color: "#0ea5e9",
            },
            {
              label: "Resolved",
              count: stats.civilIssues.resolved,
              color: "#22c55e",
            },
          ]}
        />
      </div>

      {/* ---- Quick actions ---- */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          Quick Actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <QuickAction
            icon={Search}
            title="Find a Lawyer"
            description="Search for legal professionals nearby"
            href="/find-a-lawyer"
            color="#6366f1"
          />
          <QuickAction
            icon={Scale}
            title="Report Civil Issue"
            description="Submit a new civil issue report"
            href="/citizen/civil-issues/submit"
            color="#f97316"
          />
          <QuickAction
            icon={FileText}
            title="Legal Library"
            description="Browse articles and legal documents"
            href="/legal-library/articles"
            color="#0ea5e9"
          />
        </div>
      </div>

      {/* ---- Recent activity ---- */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            Recent Activity
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={refresh}
            className="text-xs"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Consultation Requests */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <MessageSquare className="h-4 w-4 text-indigo-500" />
                Consultation Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentConsultations.length === 0 ? (
                <p className="py-4 text-center text-xs text-muted-foreground">
                  No consultation requests yet.
                </p>
              ) : (
                <div className="space-y-0.5">
                  {recentConsultations.map((r) => (
                    <RecentItemRow
                      key={r._id}
                      title={r?.lawyer?.name || "Lawyer"}
                      subtitle={r?.summary}
                      status={(r?.status || "pending").toLowerCase()}
                      date={r?.createdAt}
                      href={`/citizen/consultation-requests/${(r?.status || "pending").toLowerCase()}`}
                    />
                  ))}
                </div>
              )}
              <Link
                to="/citizen/consultation-requests/pending"
                className="mt-2 flex items-center justify-center gap-1 rounded-lg py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>

          {/* Cases */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Briefcase className="h-4 w-4 text-sky-500" />
                Cases
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentCases.length === 0 ? (
                <p className="py-4 text-center text-xs text-muted-foreground">
                  No cases yet.
                </p>
              ) : (
                <div className="space-y-0.5">
                  {recentCases.map((c) => (
                    <RecentItemRow
                      key={c._id}
                      title={c?.lawyer?.name || c?.user?.name || "Case"}
                      subtitle={
                        c?.consultationRequest?.summary || "(No summary)"
                      }
                      status={(c?.status || "open").toLowerCase()}
                      date={c?.createdAt}
                      href={`/citizen/cases/${(c?.status || "open").toLowerCase() === "open" ? "opened" : "closed"}/${c._id}`}
                    />
                  ))}
                </div>
              )}
              <Link
                to="/citizen/cases/opened"
                className="mt-2 flex items-center justify-center gap-1 rounded-lg py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>

          {/* Civil Issues */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Scale className="h-4 w-4 text-orange-500" />
                Civil Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentCivilIssues.length === 0 ? (
                <p className="py-4 text-center text-xs text-muted-foreground">
                  No civil issues reported yet.
                </p>
              ) : (
                <div className="space-y-0.5">
                  {recentCivilIssues.map((issue) => (
                    <RecentItemRow
                      key={issue._id}
                      title={issue?.title || "(Untitled)"}
                      subtitle={issue?.description}
                      status={(issue?.status || "pending").toLowerCase()}
                      date={issue?.createdAt}
                      href={`/citizen/civil-issues/${(issue?.status || "pending").toLowerCase()}`}
                    />
                  ))}
                </div>
              )}
              <Link
                to="/citizen/civil-issues/pending"
                className="mt-2 flex items-center justify-center gap-1 rounded-lg py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

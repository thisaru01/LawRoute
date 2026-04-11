import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, PlayCircle, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { getAdminCivilIssueStats } from "@/api/services/civilIssueService";

/**
 * Status statistics header for the Admin Civil Issues triage dashboard.
 * Responsibility: Provide real-time counts for the "other" category queue.
 */
export default function AdminCivilIssueStats({ refreshKey }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await getAdminCivilIssueStats();
      setStats(res.data.data);
    } catch (err) {
      console.error("[AdminCivilIssueStats] Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [refreshKey]);

  if (loading && !stats) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse bg-slate-50 border-slate-100">
            <CardContent className="h-24" />
          </Card>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      label: "Pending",
      count: stats?.pending || 0,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
    },
    {
      label: "In Progress",
      count: stats?.in_progress || 0,
      icon: PlayCircle,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
    {
      label: "Resolved",
      count: stats?.resolved || 0,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
    {
      label: "Rejected",
      count: stats?.rejected || 0,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {statItems.map((item) => (
        <Card key={item.label} className={`border ${item.border} shadow-sm transition-all hover:shadow-md`}>
          <CardContent className="flex items-center gap-4 p-4 lg:p-6">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.bg} ${item.color} lg:h-12 lg:w-12`}>
              <item.icon className="h-5 w-5 lg:h-6 lg:w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-slate-500 lg:text-sm">
                {item.label}
              </p>
              <h3 className="text-xl font-bold tracking-tight text-slate-900 lg:text-2xl">
                {item.count}
              </h3>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

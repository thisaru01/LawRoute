import { useEffect, useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from "recharts";
import { 
  Clock, 
  PlayCircle, 
  CheckCircle2, 
  XCircle, 
  FileStack,
  Loader2 
} from "lucide-react";
import { getAuthorityCivilIssueStats } from "@/api/services/civilIssueService";

const STATUS_COLORS = {
  pending: "#eab308",     // Yellow-500
  in_progress: "#3b82f6", // Blue-500
  resolved: "#22c55e",    // Green-500
  rejected: "#f43f5e",    // Rose-500
};

export default function AuthorityDashboardStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await getAuthorityCivilIssueStats();
        if (res.data?.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        setError("Failed to load statistics");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-lg border border-red-100 bg-red-50 p-6 text-center text-red-600">
        {error || "No statistics available"}
      </div>
    );
  }

  const total = Object.values(stats).reduce((acc, curr) => acc + curr, 0);

  // Data for the Pie Chart
  const chartData = [
    { name: "Pending", value: stats.pending, color: STATUS_COLORS.pending },
    { name: "In Progress", value: stats.in_progress, color: STATUS_COLORS.in_progress },
    { name: "Resolved", value: stats.resolved, color: STATUS_COLORS.resolved },
    { name: "Rejected", value: stats.rejected, color: STATUS_COLORS.rejected },
  ].filter(item => item.value > 0); // Only show statuses that have data

  const statCards = [
    { 
      label: "Pending Receipt", 
      value: stats.pending, 
      icon: Clock, 
      color: "text-amber-600",
      bg: "bg-amber-50" 
    },
    { 
      label: "Actively Working", 
      value: stats.in_progress, 
      icon: PlayCircle, 
      color: "text-blue-600",
      bg: "bg-blue-50" 
    },
    { 
      label: "Resolved Cases", 
      value: stats.resolved, 
      icon: CheckCircle2, 
      color: "text-green-600",
      bg: "bg-green-50" 
    },
    { 
      label: "Rejected Cases", 
      value: stats.rejected, 
      icon: XCircle, 
      color: "text-rose-600",
      bg: "bg-rose-50" 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.label} className="border-none shadow-sm ring-1 ring-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{card.label}</p>
                  <h3 className="mt-1 text-3xl font-bold text-slate-900">{card.value}</h3>
                </div>
                <div className={`rounded-xl ${card.bg} p-3`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Overview Card */}
        <Card className="flex flex-col border-none shadow-sm ring-1 ring-slate-200 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Total Operations</CardTitle>
            <CardDescription>Overall issues assigned to your department.</CardDescription>
          </CardHeader>
          <CardContent className="relative flex flex-1 flex-col items-center justify-center overflow-hidden py-10">
            {/* Minimalist Background Watermark */}
            <div className="absolute -right-4 -bottom-4 opacity-[0.03]">
              <FileStack className="h-32 w-32 text-slate-900" />
            </div>
            
            <div className="text-center">
              <span className="text-6xl font-black tracking-tighter text-slate-900">
                {total}
              </span>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                Total Cases
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution Pie Chart */}
        <Card className="border-none shadow-sm ring-1 ring-slate-200 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Workload Distribution</CardTitle>
            <CardDescription>Relative breakdown of case statuses.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {total > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <p className="text-sm font-medium text-slate-400">No data available to visualize.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

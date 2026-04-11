import AuthorityDashboardStats from "../components/AuthorityDashboardStats";

export default function AuthorityDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of your department's status and workload.
        </p>
      </div>

      <AuthorityDashboardStats />
    </div>
  );
}

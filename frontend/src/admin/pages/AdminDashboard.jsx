import { AdminLayout } from "@/admin/AdminLayout";

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Welcome to the admin area.
      </p>
    </AdminLayout>
  );
}

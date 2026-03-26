import { useParams } from "react-router-dom";

const allowedStatuses = new Set(["pending", "published", "rejected"]);

export default function LawyerArticles() {
  const { status } = useParams();
  const normalizedStatus = (status ?? "pending").toLowerCase();

  const safeStatus = allowedStatuses.has(normalizedStatus)
    ? normalizedStatus
    : "pending";

  const label =
    safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1).toLowerCase();

  return (
    <div>
      <h1 className="text-2xl font-semibold">Articles</h1>
      <p className="mt-2 text-sm text-muted-foreground">Status: {label}</p>
    </div>
  );
}

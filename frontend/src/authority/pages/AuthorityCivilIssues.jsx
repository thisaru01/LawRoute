import { useParams } from "react-router-dom";

const allowedStatuses = new Set(["pending", "in_progress", "resolved"]);

export default function AuthorityCivilIssues() {
  const { status } = useParams();
  const normalizedStatus = (status ?? "pending").toLowerCase();

  const safeStatus = allowedStatuses.has(normalizedStatus)
    ? normalizedStatus
    : "pending";

  const label = safeStatus
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return (
    <div>
      <h1 className="text-2xl font-semibold">Civil Issues</h1>
      <p className="mt-2 text-sm text-muted-foreground">Status: {label}</p>
    </div>
  );
}

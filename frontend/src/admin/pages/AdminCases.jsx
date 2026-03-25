import { useParams } from "react-router-dom";

const allowedStatuses = new Set(["open", "closed"]);

export default function AdminCases() {
  const { status } = useParams();
  const normalizedStatus = (status ?? "open").toLowerCase();

  const safeStatus = allowedStatuses.has(normalizedStatus)
    ? normalizedStatus
    : "open";

  const label = safeStatus === "open" ? "Open" : "Closed";

  return (
    <div>
      <h1 className="text-2xl font-semibold">Cases</h1>
      <p className="mt-2 text-sm text-muted-foreground">Status: {label}</p>
    </div>
  );
}

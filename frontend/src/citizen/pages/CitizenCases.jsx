import { useParams } from "react-router-dom";

const allowedStatuses = new Set(["opened", "closed"]);

export default function CitizenCases() {
  const { status } = useParams();
  const normalizedStatus = (status ?? "opened").toLowerCase();

  const safeStatus = allowedStatuses.has(normalizedStatus)
    ? normalizedStatus
    : "opened";

  const label =
    safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1).toLowerCase();

  return (
    <div>
      <h1 className="text-2xl font-semibold">Cases</h1>
      <p className="mt-2 text-sm text-muted-foreground">Status: {label}</p>
    </div>
  );
}

import { useParams } from "react-router-dom";

const allowedTypes = new Set(["authority", "lawyer"]);

export default function AdminUsers() {
  const { type } = useParams();
  const normalizedType = (type ?? "authority").toLowerCase();

  const safeType = allowedTypes.has(normalizedType)
    ? normalizedType
    : "authority";

  const label =
    safeType === "authority"
      ? "Authority"
      : safeType === "lawyer"
        ? "Lawyer"
        : "Authority";

  return (
    <div>
      <h1 className="text-2xl font-semibold">Users</h1>
      <p className="mt-2 text-sm text-muted-foreground">Type: {label}</p>
    </div>
  );
}

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
};

export default function RejectedConsultationRequests({
  requests,
  isLoading,
  error,
  onRetry,
}) {
  if (isLoading) {
    return (
      <div className="mt-6 space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-4 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-5/6" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-4 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-5/6" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Couldn’t load requests</CardTitle>
          <CardDescription className="text-destructive">
            {error.message || "Request failed"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={onRetry}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!Array.isArray(requests) || requests.length === 0) {
    return (
      <p className="mt-6 text-sm text-muted-foreground">
        No rejected consultation requests.
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {requests.map((request) => {
        const lawyerName = request?.lawyer?.name || "Lawyer";
        const lawyerEmail = request?.lawyer?.email;
        const createdAt = formatDateTime(request?.createdAt);
        const status = (request?.status || "pending").toLowerCase();
        const statusLabel =
          status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
        const badgeClassName =
          status === "accepted"
            ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
            : status === "rejected"
            ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
            : "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300";

        return (
          <Card key={request?._id || `${lawyerName}-${createdAt}`}>
            <CardHeader>
              <CardTitle>Request to {lawyerName}</CardTitle>
              <CardDescription>
                {createdAt ? `Created: ${createdAt}` : ""}
                {lawyerEmail ? ` • ${lawyerEmail}` : ""}
              </CardDescription>
              <CardAction>
                <Badge className={badgeClassName}>{statusLabel}</Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-sm">
                {request?.summary || "(No summary)"}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

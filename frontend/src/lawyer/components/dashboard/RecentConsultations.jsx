import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageSquare, ArrowRight } from "lucide-react";

export function RecentConsultations({ requests, isLoading }) {
  if (isLoading) {
    return (
      <Card className="border-none shadow-md">
        <CardHeader>
          <div className="h-6 w-48 animate-pulse bg-muted rounded" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-10 w-10 animate-pulse bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 animate-pulse bg-muted rounded" />
                <div className="h-3 w-48 animate-pulse bg-muted rounded" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-md dark:bg-zinc-900/50 dark:backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Consultations</CardTitle>
          <CardDescription>
            Latest requests from citizens seeking legal advice.
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild className="gap-1">
          <Link to="/lawyer/consultation-requests/pending">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {requests?.length > 0 ? (
          <div className="space-y-6">
            {requests.map((request) => (
              <div key={request._id} className="flex items-start gap-4 transition-all hover:bg-muted/50 p-2 rounded-lg">
                <Avatar className="h-10 w-10 border-2 border-primary/10">
                  <AvatarImage src={request.user?.profilePhoto} alt={request.user?.name} />
                  <AvatarFallback>{request.user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold truncate">
                      {request.user?.name}
                    </p>
                    <Badge 
                      variant={
                        request.status === "pending" ? "outline" : 
                        request.status === "accepted" ? "default" : "destructive"
                      }
                      className="capitalize text-[10px] px-2 py-0"
                    >
                      {request.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                    {request.summary}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    {new Date(request.createdAt).toLocaleDateString()} at {new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No recent requests</p>
            <p className="text-xs text-muted-foreground mt-1">
              Check back later for new consultation requests.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle2, AlertCircle, ShieldCheck, UserCheck } from "lucide-react";

export function ProfileStatusCard({ status, isLoading }) {
  if (isLoading) {
    return (
      <Card className="border-none shadow-md">
        <div className="h-48 animate-pulse bg-muted rounded-lg" />
      </Card>
    );
  }

  const isApproved = status?.verificationStatus === "approved";
  const isCompleted = status?.isCompleted;
  const percentage = status?.completionPercentage || 0;

  return (
    <Card className="border-none shadow-md overflow-hidden dark:bg-zinc-900/50 dark:backdrop-blur-sm">
      <div className={`h-2 w-full ${isApproved ? 'bg-green-500' : 'bg-orange-500'}`} />
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Profile Status</CardTitle>
          <Badge 
            variant={isApproved ? "default" : "secondary"}
            className={`${isApproved ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'} gap-1`}
          >
            {isApproved ? (
              <ShieldCheck className="h-3 w-3" />
            ) : (
              <AlertCircle className="h-3 w-3" />
            )}
            {isApproved ? "Verified Professional" : "Pending Verification"}
          </Badge>
        </div>
        <CardDescription>
          {isApproved 
            ? "Your profile is public and active." 
            : "Complete your profile to get verified."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Completion Progress</span>
            <span className="text-muted-foreground">{percentage}%</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${percentage === 100 ? 'bg-green-500' : 'bg-primary'}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <div className="grid gap-3">
          <div className="flex items-center gap-3 text-sm">
            {isCompleted ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-orange-500" />
            )}
            <span className={isCompleted ? "text-primary" : "text-muted-foreground"}>
              Basic Information & Bio
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {status?.barRegistrationNumber ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-orange-500" />
            )}
            <span className={status?.barRegistrationNumber ? "text-primary" : "text-muted-foreground"}>
              Bar Registration Number
            </span>
          </div>
        </div>

        {!isCompleted && (
          <Button asChild className="w-full shadow-lg transition-transform hover:scale-[1.02]">
            <Link to="/lawyer/profile/details">
              Complete Profile Details
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

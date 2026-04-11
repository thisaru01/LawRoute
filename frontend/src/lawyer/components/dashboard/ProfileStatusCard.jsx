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
import { 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  CircleDashed, 
  ChevronRight,
  ArrowUpRight 
} from "lucide-react";

export function ProfileStatusCard({ status, isLoading }) {
  if (isLoading) {
    return (
      <Card className="border-none shadow-xl bg-card/50 backdrop-blur-md overflow-hidden">
        <div className="h-64 animate-pulse bg-muted rounded-lg" />
      </Card>
    );
  }

  const isApproved = status?.verificationStatus === "approved";
  const percentage = status?.completionPercentage || 0;
  const sections = status?.sections || [];
  const nextAction = status?.nextAction;

  // SVG Radial Progress constants
  const size = 120;
  const strokeWidth = 10;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <Card className="group relative border-none shadow-xl bg-card/30 backdrop-blur-xl overflow-hidden dark:bg-zinc-900/60 transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-2xl border-t border-white/10 group">
      <div className={`h-1.5 w-full transition-all duration-700 ${isApproved ? 'bg-emerald-500' : 'bg-amber-500'} group-hover:h-2`} />
      
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold tracking-tight">Your Profile</CardTitle>
            <CardDescription className="text-muted-foreground/80">
              {isApproved 
                ? "Your professional identity is live." 
                : "Boost your visibility by completing your profile."}
            </CardDescription>
          </div>
          <Badge 
            variant={isApproved ? "default" : "secondary"}
            className={`${
              isApproved 
                ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border-amber-500/20'
            } gap-1.5 px-3 py-1 font-medium ring-1 ring-inset`}
          >
            {isApproved ? (
              <ShieldCheck className="h-3.5 w-3.5" />
            ) : (
              <CircleDashed className="h-3.5 w-3.5 animate-spin-pulse" />
            )}
            {isApproved ? "Verified Professional" : "Verification Pending"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Main Progress Overview */}
        <div className="flex flex-col sm:flex-row items-center gap-8 bg-muted/30 rounded-2xl p-6 border border-white/5 shadow-inner">
          <div className="relative flex-shrink-0">
            <svg width={size} height={size} className="transform -rotate-90 drop-shadow-sm">
              <circle
                cx={center}
                cy={center}
                r={radius}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                fill="transparent"
                className="text-muted/20"
              />
              <circle
                cx={center}
                cy={center}
                r={radius}
                stroke={percentage === 100 ? "#10b981" : "#1e1b4b"}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                fill="transparent"
                className={`transition-all duration-1000 ease-in-out dark:stroke-${percentage === 100 ? 'emerald-500' : 'primary'}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center transform rotate-0">
              <span className="text-2xl font-black tracking-tighter">{percentage}%</span>
              <span className="text-[10px] font-semibold uppercase opacity-60">Ready</span>
            </div>
          </div>

          <div className="flex-1 space-y-4 text-center sm:text-left">
            {!isApproved && nextAction && nextAction !== "None" && (
              <div className="p-3 bg-white/40 dark:bg-white/5 rounded-xl border border-white/10">
                <p className="text-xs font-semibold text-muted-foreground uppercase flex items-center justify-center sm:justify-start gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Recommended Action
                </p>
                <Link to="/lawyer/profile/details" className="group flex items-center justify-center sm:justify-start gap-1 mt-1 text-sm font-bold hover:text-primary transition-colors">
                  Complete {nextAction}
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            )}
            
            {isApproved ? (
              <div className="space-y-1">
                <p className="font-bold text-emerald-600 dark:text-emerald-400">Excellence Achievement</p>
                <p className="text-sm text-muted-foreground leading-snug">Your profile meets all professional transparency standards for the LawRoute network.</p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="font-bold text-primary">Strengthen Your Presence</p>
                <p className="text-sm text-muted-foreground leading-snug">Adding more details increases client trust and visibility by up to 3x.</p>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Section Indicators */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2 px-1">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Profile Breakdown</h4>
            <span className="text-[10px] font-medium bg-muted px-2 py-0.5 rounded-full">{sections.filter(s => s.isCompleted).length}/{sections.length}</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {sections.map((section) => (
              <div 
                key={section.id} 
                className={`flex items-center gap-2.5 p-2 rounded-lg border transition-all duration-200 ${
                  section.isCompleted 
                    ? 'bg-emerald-500/5 border-emerald-500/10 dark:bg-emerald-500/5' 
                    : 'bg-muted/10 border-transparent text-muted-foreground'
                }`}
              >
                {section.isCompleted ? (
                  <div className="bg-emerald-500 rounded-full p-0.5 shadow-sm shadow-emerald-500/20">
                    <CheckCircle2 className="h-3 w-3 text-white" />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full border border-dashed border-muted-foreground/30 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20" />
                  </div>
                )}
                <span className={`text-[11px] font-semibold truncate ${section.isCompleted ? 'text-emerald-700 dark:text-emerald-300' : ''}`}>
                  {section.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Button asChild size="lg" className="w-full shadow-lg group relative overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.98]">
          <Link to="/lawyer/profile/details" className="flex items-center justify-center gap-2">
            <span>Manage Professional Profile</span>
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

import { useLawyerDashboard } from "@/hooks/lawyer/useLawyerDashboard";
import { DashboardStats } from "@/lawyer/components/dashboard/DashboardStats";
import { RecentConsultations } from "@/lawyer/components/dashboard/RecentConsultations";
import { ProfileStatusCard } from "@/lawyer/components/dashboard/ProfileStatusCard";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LawyerDashboard() {
  const { data, isLoading, error, refresh } = useLawyerDashboard();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-destructive/10 p-4 mb-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-xl font-bold">Failed to load dashboard</h2>
        <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
          We encountered an error while fetching your dashboard data. Please try again.
        </p>
        <Button onClick={refresh} variant="outline" className="mt-6 gap-2">
          <RefreshCcw className="h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's an overview of your legal practice.
        </p>
      </div>

      <DashboardStats stats={data?.stats} isLoading={isLoading} />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentConsultations requests={data?.recentConsultations} isLoading={isLoading} />
        <ProfileStatusCard status={data?.profileStatus} isLoading={isLoading} />
      </div>
      
      {/* Quick Links Section */}
      <div className="grid gap-4 md:grid-cols-3">
        <QuickLinkCard 
          title="Create Article" 
          description="Share your expertise with the community"
          href="/lawyer/articles/create"
          icon={<BookOpenIcon className="h-5 w-5" />}
        />
        <QuickLinkCard 
          title="View Active Cases" 
          description="Manage your ongoing legal matters"
          href="/lawyer/cases/opened"
          icon={<BriefcaseIcon className="h-5 w-5" />}
        />
        <QuickLinkCard 
          title="Respond to Requests" 
          description="View new consultation requests"
          href="/lawyer/consultation-requests/pending"
          icon={<MessageIcon className="h-5 w-5" />}
        />
      </div>
    </div>
  );
}

function QuickLinkCard({ title, description, href, icon }) {
  return (
    <Button 
      variant="outline" 
      asChild 
      className="h-auto flex-col items-start gap-2 p-4 text-left hover:bg-muted/50 transition-all border-none shadow-sm dark:bg-zinc-900/40"
    >
      <a href={href}>
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          {icon}
        </div>
        <div>
          <div className="font-semibold">{title}</div>
          <div className="text-xs text-muted-foreground line-clamp-1">{description}</div>
        </div>
      </a>
    </Button>
  );
}

function BookOpenIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
  );
}

function BriefcaseIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>
  );
}

function MessageIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  );
}

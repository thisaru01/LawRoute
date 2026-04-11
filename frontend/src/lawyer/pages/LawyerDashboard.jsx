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
          iconColor="text-indigo-600 dark:text-indigo-400"
          iconBg="bg-indigo-100 dark:bg-indigo-900/30"
          hoverBg="hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10"
        />
        <QuickLinkCard 
          title="View Active Cases" 
          description="Manage your ongoing legal matters"
          href="/lawyer/cases/opened"
          icon={<BriefcaseIcon className="h-5 w-5" />}
          iconColor="text-blue-600 dark:text-blue-400"
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          hoverBg="hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
        />
        <QuickLinkCard 
          title="Respond to Requests" 
          description="View new consultation requests"
          href="/lawyer/consultation-requests/pending"
          icon={<MessageIcon className="h-5 w-5" />}
          iconColor="text-purple-600 dark:text-purple-400"
          iconBg="bg-purple-100 dark:bg-purple-900/30"
          hoverBg="hover:bg-purple-50/50 dark:hover:bg-purple-900/10"
        />
      </div>
    </div>
  );
}

function QuickLinkCard({ title, description, href, icon, iconColor, iconBg, hoverBg }) {
  return (
    <Button 
      variant="outline" 
      asChild 
      className={`group h-auto flex-col items-start gap-4 p-6 text-left transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl border-none shadow-sm dark:bg-zinc-900/40 ${hoverBg} active:scale-95 rounded-2xl`}
    >
      <a href={href} className="w-full">
        <div className={`rounded-2xl ${iconBg} p-3.5 ${iconColor} transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm inline-flex items-center justify-center`}>
          {icon}
        </div>
        <div className="space-y-1.5 mt-4">
          <div className="font-bold text-base tracking-tight group-hover:text-primary transition-colors">{title}</div>
          <div className="text-xs text-muted-foreground line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100">{description}</div>
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

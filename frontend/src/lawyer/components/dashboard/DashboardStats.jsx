import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, MessageSquare, BookOpen, Clock } from "lucide-react";

export function DashboardStats({ stats, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="overflow-hidden border-none shadow-md">
            <div className="h-32 animate-pulse bg-muted" />
          </Card>
        ))}
      </div>
    );
  }

  const items = [
    {
      title: "Active Cases",
      value: stats?.cases?.open || 0,
      icon: Briefcase,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      description: `${stats?.cases?.total || 0} total cases`,
    },
    {
      title: "Pending Requests",
      value: stats?.consultations?.pending || 0,
      icon: MessageSquare,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      description: "Needs response",
    },
    {
      title: "Published Articles",
      value: stats?.articles?.published || 0,
      icon: BookOpen,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      description: `${stats?.articles?.pending || 0} pending review`,
    },
    {
      title: "Accepted Consults",
      value: stats?.consultations?.accepted || 0,
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      description: "Ready for consultation",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => (
        <Card 
          key={index} 
          className="group relative overflow-hidden border-none shadow-md transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-2xl dark:bg-zinc-900/50 dark:backdrop-blur-sm border-t border-white/5"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium opacity-80 group-hover:opacity-100 transition-opacity">{item.title}</CardTitle>
            <div className={`rounded-full p-2.5 ${item.bgColor} ${item.color} shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
              <item.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {item.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

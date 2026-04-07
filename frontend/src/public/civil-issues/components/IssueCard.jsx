import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Calendar, ChevronDown, Clock3, Info, MapPin, Phone, User } from "lucide-react";

const hasValue = (value) => typeof value === "string" && value.trim().length > 0;

const formatDateOnly = (value) => {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toLocaleDateString();
};

function DetailRow({ label, value, icon: Icon }) {
  if (!hasValue(value)) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 sm:p-4">
      <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
        <span>{label}</span>
      </div>
      <p className="text-sm leading-relaxed text-slate-700">{value}</p>
    </div>
  );
}

export default function IssueCard({
  issue,
  isOpen,
  onToggle,
  categoryLabels,
  showContactNumber = false,
  reporterLabel = "Anonymous Citizen",
}) {
  const displayTitle =
    typeof issue.subject === "string" && issue.subject.trim().length > 0
      ? issue.subject
      : `${categoryLabels?.[issue.category] || issue.category || "Civil Issue"} - ${issue.district || "Unknown location"}`;

  const shouldShowReporterLabel =
    typeof reporterLabel === "string" && reporterLabel.trim().length > 0;

  return (
    <Collapsible
      className="group"
      open={isOpen}
      onOpenChange={onToggle}
    >
      <Card className="overflow-hidden border-slate-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="h-auto w-full items-start justify-between rounded-none px-4 py-4 text-left hover:bg-slate-50/70 sm:px-5 sm:py-5"
          >
            <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
              <div className="mt-0.5 hidden rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-500 sm:block">
                <Info className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0 space-y-2 overflow-hidden">
                <div className="flex items-start gap-2">
                  <h3 className="truncate text-base font-semibold leading-snug text-slate-900 sm:text-lg">
                    {displayTitle}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-600 sm:text-sm">
                  {shouldShowReporterLabel ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 sm:text-xs">
                      <User className="h-3 w-3" />
                      {reporterLabel}
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                    {issue.district}
                  </span>
                  {hasValue(issue.exactLocation) && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-500" />
                      {issue.exactLocation}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    {new Date(issue.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="ml-3 flex shrink-0 items-center gap-2 sm:gap-3">
              <Badge
                variant="outline"
                className="whitespace-nowrap border-slate-300 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium capitalize text-slate-700 sm:text-xs"
              >
                {issue.status}
              </Badge>
              <span className="hidden text-xs font-medium text-slate-500 sm:inline">
                {isOpen ? "Hide details" : "View details"}
              </span>
              <ChevronDown className="h-4.5 w-4.5 text-slate-400 transition-transform group-data-[state=open]:rotate-180" />
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="border-t border-slate-50 px-4 pb-6 pt-5 text-sm leading-relaxed text-slate-600 sm:px-8 sm:pt-6 animate-in slide-in-from-top-2 duration-300">
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailRow label="Exact location" value={issue.exactLocation} icon={MapPin} />
              <DetailRow label="Postal area / zip" value={issue.postalAreaOrZip} icon={MapPin} />
              <DetailRow label="What happened" value={issue.whatHappened} />
              <DetailRow label="When it happened" value={formatDateOnly(issue.whenItHappened)} icon={Clock3} />
              <DetailRow label="How it affects people" value={issue.impactOnPeople} />
              {showContactNumber ? (
                <DetailRow label="Contact number" value={issue.contactNumber} icon={Phone} />
              ) : null}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

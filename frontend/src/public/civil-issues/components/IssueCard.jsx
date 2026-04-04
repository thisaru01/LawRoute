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

export default function IssueCard({ issue, isOpen, onToggle, categoryLabels, showContactNumber = false }) {
  const displayTitle =
    typeof issue.subject === "string" && issue.subject.trim().length > 0
      ? issue.subject
      : `${categoryLabels?.[issue.category] || issue.category || "Civil Issue"} - ${issue.district || "Unknown location"}`;

  return (
    <Collapsible
      className="group"
      open={isOpen}
      onOpenChange={onToggle}
    >
      <Card className="overflow-hidden border-slate-200 hover:border-primary/30 transition-all shadow-sm hover:shadow-md">
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="h-auto w-full items-start sm:items-center justify-between rounded-none p-4 sm:p-5 text-left hover:bg-slate-50/50"
          >
            <div className="flex items-center gap-4 flex-1 overflow-hidden">
              <div className="bg-primary/5 p-2.5 rounded-xl text-primary hidden sm:block">
                <Info className="h-5 w-5" />
              </div>
              <div className="space-y-1 overflow-hidden">
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 truncate leading-snug">
                  {displayTitle}
                </h3>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" /> Anonymous Citizen
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                    {issue.district}
                  </span>
                  {hasValue(issue.exactLocation) && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {issue.exactLocation}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {new Date(issue.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
              <Badge variant="outline" className="capitalize bg-white text-[11px] sm:text-xs whitespace-nowrap">
                {issue.status}
              </Badge>
              <span className="text-[11px] sm:text-xs font-medium text-slate-500">
                {isOpen ? "Hide details" : "View details"}
              </span>
              <ChevronDown className="h-5 w-5 text-slate-400 group-data-[state=open]:rotate-180 transition-transform" />
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

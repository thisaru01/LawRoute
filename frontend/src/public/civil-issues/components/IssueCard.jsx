import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Calendar, ChevronDown, Clock3, Info, MapPin, Phone, User, Paperclip, ExternalLink, CheckCircle2 } from "lucide-react";

const hasValue = (value) => typeof value === "string" && value.trim().length > 0;

const STATUS_STYLES = {
  pending:     { border: "border-l-amber-400",  badge: "border-amber-200  bg-amber-50   text-amber-700" },
  in_progress: { border: "border-l-blue-400",   badge: "border-blue-200   bg-blue-50    text-blue-700" },
  resolved:    { border: "border-l-emerald-400", badge: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  rejected:    { border: "border-l-red-400",     badge: "border-red-200    bg-red-50     text-red-700" },
};

const getStatusStyles = (status) => STATUS_STYLES[status?.toLowerCase()] ?? { border: "border-l-slate-300", badge: "border-slate-200 bg-slate-50 text-slate-700" };

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
  footerContent = null,
}) {
  const displayTitle =
    typeof issue.subject === "string" && issue.subject.trim().length > 0
      ? issue.subject
      : `${categoryLabels?.[issue.category] || issue.category || "Civil Issue"} - ${issue.district || "Unknown location"}`;

  const shouldShowReporterLabel =
    typeof reporterLabel === "string" && reporterLabel.trim().length > 0;

  const statusStyles = getStatusStyles(issue.status);

  return (
    <Collapsible
      className="group"
      open={isOpen}
      onOpenChange={onToggle}
    >
      <Card className={`overflow-hidden border-slate-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg border-l-4 ${statusStyles.border}`}>
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
                  {issue.category && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 sm:text-xs">
                      {categoryLabels?.[issue.category] || issue.category}
                    </span>
                  )}
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
                className={`whitespace-nowrap px-2.5 py-0.5 text-[11px] font-medium capitalize sm:text-xs ${statusStyles.badge}`}
              >
                {issue.status?.replace("_", " ")}
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
            {issue.status === "resolved" && typeof issue.resolutionSummary === "string" && issue.resolutionSummary.trim().length > 0 && (
              <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Authority Resolution</span>
                </div>
                <p className="text-sm font-medium leading-relaxed text-emerald-900">{issue.resolutionSummary}</p>
              </div>
            )}
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

            {Array.isArray(issue.attachments) && issue.attachments.length > 0 && (
              <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <Paperclip className="h-3.5 w-3.5" />
                  <span>Attachments</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {issue.attachments.map((url, idx) => {
                    const fileName = url.split("/").pop() || `Attachment ${idx + 1}`;
                    return (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-1 items-center justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 sm:flex-none"
                        title={fileName}
                      >
                        <span className="truncate max-w-[200px]">{fileName}</span>
                        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-400 group-hover:text-slate-600" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
            {footerContent ? (
              <div className="mt-5 border-t border-slate-100 pt-4">
                {footerContent}
              </div>
            ) : null}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

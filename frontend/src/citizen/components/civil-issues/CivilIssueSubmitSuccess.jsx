import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function CivilIssueSubmitSuccess({
  countdown,
  onRedirectNow,
  title = "Issue Submitted Successfully",
  description = "Your report has been received and assigned to the relevant authority.",
}) {
  return (
    <div className="space-y-4 px-4 py-8 text-center animate-in fade-in zoom-in duration-500 sm:space-y-6 sm:py-12">
      <div className="flex justify-center">
        <div className="rounded-full bg-green-50 p-2 ring-8 ring-green-50/50 sm:p-3">
          <CheckCircle2 className="h-8 w-8 text-green-600 sm:h-12 sm:w-12" />
        </div>
      </div>
      <div className="space-y-1 sm:space-y-2">
        <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">{title}</h3>
        <p className="text-sm text-slate-500 sm:text-base">{description}</p>
      </div>
      <div className="mx-auto max-w-sm rounded-lg border border-slate-100 bg-slate-50 p-4 sm:rounded-xl sm:p-6">
        <p className="mb-3 text-sm font-medium text-slate-600 sm:mb-4">
          Redirecting in <span className="text-base font-bold text-primary sm:text-lg">{countdown}s</span>
        </p>
        <Button onClick={onRedirectNow} className="w-full">
          Redirect Now
        </Button>
      </div>
    </div>
  );
}

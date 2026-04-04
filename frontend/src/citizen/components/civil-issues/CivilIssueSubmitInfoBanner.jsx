import { Info } from "lucide-react";

export default function CivilIssueSubmitInfoBanner() {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-blue-950 sm:rounded-xl sm:p-4">
      <div className="flex items-start gap-2 sm:gap-3">
        <div className="mt-0.5 shrink-0 rounded-md bg-blue-100 p-1 text-blue-700 sm:p-1.5">
          <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold leading-tight sm:text-sm">Help the community faster</p>
          <p className="text-xs leading-relaxed text-blue-900/90 sm:text-sm">
            If your issue is not highly personal, consider making it public. Public issues help others avoid duplicate reports and help authorities respond faster.
          </p>
          <p className="text-xs font-medium text-blue-800/90">Your identity remains anonymous.</p>
        </div>
      </div>
    </div>
  );
}

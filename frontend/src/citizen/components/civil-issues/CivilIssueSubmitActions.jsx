import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function CivilIssueSubmitActions({
  busy,
  disableSubmit,
  onCancel,
}) {
  return (
    <div className="flex flex-col gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:gap-3 sm:pt-6">
      <Button
        type="submit"
        disabled={disableSubmit}
        className="h-10 text-sm font-semibold shadow-md transition-shadow hover:shadow-blue-500/20 sm:h-12 sm:flex-1 sm:text-base"
      >
        {busy ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Complete Submission"
        )}
      </Button>
      <Button
        type="button"
        variant="ghost"
        onClick={onCancel}
        disabled={busy}
        className="h-10 px-4 text-sm text-slate-500 sm:h-12 sm:px-8 sm:text-base"
      >
        Cancel
      </Button>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { PenLine } from "lucide-react";

export default function FloatingSubmitButton({ onClick }) {
  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 pb-[env(safe-area-inset-bottom)] pr-[env(safe-area-inset-right)]">
      <Button
        type="button"
        onClick={onClick}
        aria-label="Submit a civil issue"
        title="Submit a Civil Issue"
        className="flex h-11 sm:h-12 max-w-[calc(100vw-2rem)] items-center gap-2 justify-center rounded-full bg-slate-900 px-5 sm:px-6 text-xs sm:text-sm font-semibold text-white shadow-xl transition-all hover:scale-105 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
      >
        <PenLine className="h-4 w-4" />
        Submit Civil Issue
      </Button>
    </div>
  );
}

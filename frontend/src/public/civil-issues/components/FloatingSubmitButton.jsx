import { Button } from "@/components/ui/button";

export default function FloatingSubmitButton({ onClick }) {
  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 pb-[env(safe-area-inset-bottom)] pr-[env(safe-area-inset-right)]">
      <Button
        type="button"
        variant="default"
        onClick={onClick}
        aria-label="Submit a civil issue"
        title="Submit a Civil Issue"
        className="flex h-11 sm:h-12 max-w-[calc(100vw-2rem)] items-center justify-center rounded-full bg-slate-900 px-4 sm:px-5 text-xs sm:text-sm font-semibold text-white shadow-2xl transition-all hover:scale-105 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        Submit Civil Issue
      </Button>
    </div>
  );
}

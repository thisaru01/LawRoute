import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FolderOpen } from "lucide-react";

export default function EmptyState({ onClearFilters }) {
  return (
    <Card className="rounded-3xl border-dashed border-slate-200 bg-white">
      <CardContent className="py-14 sm:py-20 text-center">
        <div className="mb-5 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 ring-1 ring-slate-200">
            <FolderOpen className="h-8 w-8 text-slate-400" />
          </div>
        </div>
        <p className="text-slate-700 font-semibold tracking-tight">No issues found</p>
        <p className="mt-1 text-sm text-slate-400">Try adjusting your filters or clear them to see all issues.</p>
        <Button variant="link" onClick={onClearFilters} className="mt-3 text-slate-600 hover:text-slate-900">
          Clear all filters
        </Button>
      </CardContent>
    </Card>
  );
}

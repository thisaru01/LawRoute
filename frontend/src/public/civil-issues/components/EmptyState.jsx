import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FolderOpen } from "lucide-react";

export default function EmptyState({ onClearFilters }) {
  return (
    <Card className="rounded-3xl border-dashed border-slate-200 bg-white">
      <CardContent className="py-14 sm:py-20 text-center">
        <div className="mb-4 flex justify-center">
          <FolderOpen className="h-10 w-10 text-slate-300" />
        </div>
        <p className="text-slate-500 font-medium tracking-tight">No issues found matching your selection.</p>
        <Button variant="link" onClick={onClearFilters} className="mt-2">
          Clear all filters
        </Button>
      </CardContent>
    </Card>
  );
}

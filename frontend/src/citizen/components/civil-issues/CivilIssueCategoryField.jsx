import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CIVIL_ISSUE_CATEGORIES } from "@/constants/civilIssueConstants.js";

export default function CivilIssueCategoryField({ value, onChange, error = "" }) {
  return (
    <div className="space-y-1.5 sm:space-y-2">
      <Label htmlFor="category" className="text-xs font-semibold text-slate-900 sm:text-sm">
        What is the nature of your concern? <span className="text-destructive">*</span>
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          id="category"
          className={cn(
            "h-10 text-sm sm:h-12",
            error && "border-destructive ring-2 ring-destructive/20",
          )}
          aria-invalid={Boolean(error)}
        >
          <SelectValue placeholder="Select a category" />
        </SelectTrigger>
        <SelectContent>
          {CIVIL_ISSUE_CATEGORIES.map((cat) => (
            <SelectItem key={cat.value} value={cat.value}>
              {cat.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error ? (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-2.5 py-2 text-xs text-destructive">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <p className="font-medium leading-snug">{error}</p>
        </div>
      ) : null}
    </div>
  );
}

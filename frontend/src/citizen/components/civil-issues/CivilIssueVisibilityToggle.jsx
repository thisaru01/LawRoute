import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function CivilIssueVisibilityToggle({ checked, onCheckedChange }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-blue-50/40 p-3 sm:gap-3 sm:rounded-xl sm:p-4">
      <Checkbox id="isPublic" checked={checked} onCheckedChange={onCheckedChange} className="mt-1 shrink-0 sm:mt-0.5" />
      <div className="space-y-1">
        <Label
          htmlFor="isPublic"
          className="cursor-pointer text-xs font-semibold leading-tight text-slate-900 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 sm:text-sm sm:leading-none"
        >
          Allow this issue to be displayed publicly on the Civil Issues portal
        </Label>
        <p className="text-xs leading-relaxed text-slate-500">
          Allow other citizens to see the nature of this issue. Your identity will remain <span className="font-bold text-primary">Anonymous</span>.
        </p>
      </div>
    </div>
  );
}

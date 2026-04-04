import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CivilIssueSubjectField({
  value,
  maxLength,
  onChange,
  error = "",
}) {
  const isLimitExceeded = value.length > maxLength;

  return (
    <div className="space-y-1.5 sm:space-y-2">
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between sm:gap-2">
        <Label htmlFor="subject" className="text-xs font-semibold text-slate-900 sm:text-sm">
          Subject <span className="text-destructive">*</span>
        </Label>
        <span className={`self-start rounded-md border px-2 py-0.5 font-mono text-xs font-semibold uppercase whitespace-nowrap sm:self-auto ${
          isLimitExceeded
            ? "text-red-700 border-red-200 bg-red-50"
            : "text-slate-500 border-slate-200 bg-slate-50/50"
        }`}>
          {value.length}/{maxLength}
        </span>
      </div>
      <Input
        id="subject"
        placeholder="e.g., Water outage near Temple Road"
        className="h-10 text-sm sm:h-12"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        required
      />
      {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
    </div>
  );
}

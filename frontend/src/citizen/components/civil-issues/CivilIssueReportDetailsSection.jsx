import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_EXACT_LOCATION_LENGTH = 180;
const MAX_POSTAL_AREA_LENGTH = 60;
const MAX_WHAT_HAPPENED_LENGTH = 1200;
const MAX_IMPACT_LENGTH = 1200;
const MAX_CONTACT_LENGTH = 20;
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const parseDateOnly = (value) => {
  if (!DATE_ONLY_PATTERN.test(value || "")) {
    return undefined;
  }

  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const toDateOnlyValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateLabel = (value) => {
  const parsed = parseDateOnly(value);
  if (!parsed) {
    return "Pick a date";
  }

  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

function DetailFieldCard({ label, helperText, required = false, counter, error = "", children }) {
  return (
    <div className={cn(
      "rounded-xl border bg-white p-4 shadow-sm sm:p-5",
      error ? "border-destructive/40" : "border-slate-200",
    )}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="space-y-1">
          <Label className="text-sm font-semibold text-slate-900">
            {label} {required ? <span className="text-destructive">*</span> : null}
          </Label>
          <p className="text-xs leading-snug text-slate-500">{helperText}</p>
        </div>
        {counter ? (
          <span className="shrink-0 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            {counter}
          </span>
        ) : null}
      </div>
      {children}
      {error ? <p className="mt-2 text-xs font-medium text-destructive">{error}</p> : null}
    </div>
  );
}

export default function CivilIssueReportDetailsSection({ value, onChange, errors = {} }) {
  const setField = (field) => (event) => {
    const nextValue = event.target.value;
    onChange((prev) => ({ ...prev, [field]: nextValue }));
  };

  const setTextareaField = (field) => (event) => {
    const nextValue = event.target.value;
    onChange((prev) => ({ ...prev, [field]: nextValue }));
  };

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-slate-900 sm:text-lg">Issue details</h2>
        <p className="text-sm text-slate-500">
          Fill each card with specific, factual details. This makes the report easier for authorities to act on.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DetailFieldCard
          label="Town / Village"
          helperText="Enter the local town, village, or area name."
          required
          counter={`${value.exactLocation.length}/${MAX_EXACT_LOCATION_LENGTH}`}
          error={errors.exactLocation}
        >
          <Input
            value={value.exactLocation}
            onChange={setField("exactLocation")}
            maxLength={MAX_EXACT_LOCATION_LENGTH}
            placeholder="e.g., Kadawatha"
            className="h-11 text-sm"
            aria-invalid={Boolean(errors.exactLocation)}
            required
          />
        </DetailFieldCard>

        <DetailFieldCard
          label="Postal area or zip code"
          helperText="District is selected above. Add the nearest postal area or zip code here."
          required
          counter={`${value.postalAreaOrZip.length}/${MAX_POSTAL_AREA_LENGTH}`}
          error={errors.postalAreaOrZip}
        >
          <Input
            value={value.postalAreaOrZip}
            onChange={setField("postalAreaOrZip")}
            maxLength={MAX_POSTAL_AREA_LENGTH}
            placeholder="e.g., Colombo 07 / 00700"
            className="h-11 text-sm"
            aria-invalid={Boolean(errors.postalAreaOrZip)}
            required
          />
        </DetailFieldCard>

        <DetailFieldCard
          label="What happened"
          helperText="Describe the actual issue in clear and direct terms."
          required
          counter={`${value.whatHappened.length}/${MAX_WHAT_HAPPENED_LENGTH}`}
          error={errors.whatHappened}
        >
          <Textarea
            value={value.whatHappened}
            onChange={setTextareaField("whatHappened")}
            maxLength={MAX_WHAT_HAPPENED_LENGTH}
            placeholder="e.g., Water has been unavailable for two days and pressure has dropped in nearby homes."
            className="min-h-[130px] resize-y text-sm"
            aria-invalid={Boolean(errors.whatHappened)}
            required
          />
        </DetailFieldCard>

        <DetailFieldCard
          label="When it happened"
          helperText="Select the incident date. Time is not required."
          required
          error={errors.whenItHappened}
        >
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                aria-invalid={Boolean(errors.whenItHappened)}
                className={cn(
                  "h-11 w-full justify-start text-left text-sm font-normal",
                  !value.whenItHappened && "text-slate-500",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formatDateLabel(value.whenItHappened)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={parseDateOnly(value.whenItHappened)}
                onSelect={(date) => {
                  if (!date) {
                    return;
                  }

                  onChange((prev) => ({
                    ...prev,
                    whenItHappened: toDateOnlyValue(date),
                  }));
                }}
                disabled={{ after: new Date() }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </DetailFieldCard>

        <DetailFieldCard
          label="How it affects people"
          helperText="Explain the impact on residents, roads, access, or daily routines."
          required
          counter={`${value.impactOnPeople.length}/${MAX_IMPACT_LENGTH}`}
          error={errors.impactOnPeople}
        >
          <Textarea
            value={value.impactOnPeople}
            onChange={setTextareaField("impactOnPeople")}
            maxLength={MAX_IMPACT_LENGTH}
            placeholder="e.g., Residents cannot cook, school children are late, and businesses are losing customers."
            className="min-h-[130px] resize-y text-sm"
            aria-invalid={Boolean(errors.impactOnPeople)}
            required
          />
        </DetailFieldCard>

        <DetailFieldCard
          label="Contact number"
          helperText="This is kept for authority follow-up and is not shown in the public feed."
          required
          counter={`${value.contactNumber.length}/${MAX_CONTACT_LENGTH}`}
          error={errors.contactNumber}
        >
          <Input
            value={value.contactNumber}
            onChange={setField("contactNumber")}
            maxLength={MAX_CONTACT_LENGTH}
            placeholder="e.g., 07X XXX XXXX"
            className="h-11 text-sm"
            inputMode="tel"
            autoComplete="tel"
            aria-invalid={Boolean(errors.contactNumber)}
            required
          />
        </DetailFieldCard>
      </div>
    </section>
  );
}
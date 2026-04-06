import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSriLankaLocationAutocomplete } from "@/hooks/useSriLankaLocationAutocomplete";
import { CIVIL_ISSUE_DISTRICTS } from "@/constants/civilIssueConstants.js";

const MAX_EXACT_LOCATION_LENGTH = 120;
const MAX_POSTAL_AREA_LENGTH = 5;
const MAX_WHAT_HAPPENED_LENGTH = 1200;
const MAX_IMPACT_LENGTH = 1200;
const MAX_CONTACT_LENGTH = 10;
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const normalizeDistrictText = (value) =>
  (typeof value === "string" ? value.trim().toLowerCase().replace(/\s+/g, " ") : "");

const toCanonicalDistrict = (value) => {
  const normalized = normalizeDistrictText(value).replace(/\s+district$/, "").trim();

  if (!normalized) {
    return "";
  }

  const canonical = CIVIL_ISSUE_DISTRICTS.find(
    (district) => normalizeDistrictText(district) === normalized
  );

  return canonical || "";
};

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
  const { suggestions, loading, error: locationSuggestionError } = useSriLankaLocationAutocomplete({
    query: value.exactLocation,
  });
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [highlightedSuggestionIndex, setHighlightedSuggestionIndex] = useState(-1);
  const [locationSelectionHint, setLocationSelectionHint] = useState("");

  const setField = (field) => (event) => {
    const nextValue = event.target.value;
    onChange((prev) => ({
      ...prev,
      [field]: nextValue,
      ...(field === "exactLocation" ? { exactLocationSelected: false } : {}),
    }));

    if (field === "exactLocation") {
      setLocationSelectionHint("");
      setShowLocationSuggestions(true);
    }
  };

  const setTextareaField = (field) => (event) => {
    const nextValue = event.target.value;
    onChange((prev) => ({ ...prev, [field]: nextValue }));
  };

  const setDigitsField = (field, maxLength) => (event) => {
    const nextValue = event.target.value.replace(/\D/g, "").slice(0, maxLength);
    onChange((prev) => ({ ...prev, [field]: nextValue }));
  };

  const hasLocationSuggestions = showLocationSuggestions && suggestions.length > 0;

  const isSuggestionNameAmbiguousAcrossDistricts = (item) => {
    const targetName = typeof item?.locationName === "string" ? item.locationName.trim().toLowerCase() : "";
    const targetDistrict = typeof item?.district === "string" ? item.district.trim().toLowerCase() : "";

    if (!targetName) {
      return false;
    }

    const districtSet = new Set(
      suggestions
        .filter((entry) => {
          const name = typeof entry?.locationName === "string" ? entry.locationName.trim().toLowerCase() : "";
          return name === targetName;
        })
        .map((entry) => (typeof entry?.district === "string" ? entry.district.trim().toLowerCase() : ""))
        .filter(Boolean)
    );

    if (!targetDistrict) {
      return districtSet.size > 1;
    }

    return districtSet.size > 1 && districtSet.has(targetDistrict);
  };

  const applyLocationSuggestion = (item) => {
    const selectedDistrict = toCanonicalDistrict(item?.district);
    const districtChanged = Boolean(selectedDistrict) && selectedDistrict !== value.district;

    onChange((prev) => ({
      ...prev,
      exactLocation: item.locationName || prev.exactLocation,
      postalAreaOrZip: item.postcode || prev.postalAreaOrZip,
      district: selectedDistrict || prev.district,
      exactLocationSelected: true,
    }));

    if (districtChanged) {
      setLocationSelectionHint(`District changed to ${selectedDistrict} based on selected location.`);
    } else {
      setLocationSelectionHint("");
    }

    setShowLocationSuggestions(false);
    setHighlightedSuggestionIndex(-1);
  };

  const handleLocationKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      if (!showLocationSuggestions) {
        setShowLocationSuggestions(true);
      }

      if (suggestions.length > 0) {
        event.preventDefault();
        setHighlightedSuggestionIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
      }
      return;
    }

    if (event.key === "ArrowUp") {
      if (suggestions.length > 0) {
        event.preventDefault();
        setHighlightedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
      }
      return;
    }

    if (event.key === "Escape") {
      setShowLocationSuggestions(false);
      setHighlightedSuggestionIndex(-1);
      return;
    }

    if (event.key === "Enter") {
      if (hasLocationSuggestions) {
        event.preventDefault();
        const targetIndex = highlightedSuggestionIndex >= 0 ? highlightedSuggestionIndex : 0;
        const targetSuggestion = suggestions[targetIndex];

        if (isSuggestionNameAmbiguousAcrossDistricts(targetSuggestion)) {
          const selectedName =
            typeof targetSuggestion?.locationName === "string" && targetSuggestion.locationName.trim()
              ? targetSuggestion.locationName.trim()
              : "this location";
          setLocationSelectionHint(
            `Multiple results found for ${selectedName} in different districts. Please click the exact district from the list.`
          );
          return;
        }

        applyLocationSuggestion(targetSuggestion);
      } else {
        event.preventDefault();
        setShowLocationSuggestions(false);
      }
    }
  };

  const highlightedSuggestion =
    highlightedSuggestionIndex >= 0 && highlightedSuggestionIndex < suggestions.length
      ? suggestions[highlightedSuggestionIndex]
      : null;

  const isHighlightedSuggestionAmbiguous =
    Boolean(highlightedSuggestion) && isSuggestionNameAmbiguousAcrossDistricts(highlightedSuggestion);

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
          <div className="relative">
            <Input
              value={value.exactLocation}
              onChange={setField("exactLocation")}
              onFocus={() => setShowLocationSuggestions(true)}
              onBlur={() => {
                // Allow suggestion click handlers to run before closing.
                setTimeout(() => setShowLocationSuggestions(false), 120);
              }}
              onKeyDown={handleLocationKeyDown}
              maxLength={MAX_EXACT_LOCATION_LENGTH}
              placeholder="Type town or area to search suggestions"
              className="h-11 text-sm"
              aria-invalid={Boolean(errors.exactLocation)}
              required
            />

            {loading ? (
              <p className="mt-2 text-xs text-slate-500">Loading location suggestions...</p>
            ) : null}

            {locationSuggestionError ? (
              <p className="mt-2 text-xs text-amber-600">{locationSuggestionError}</p>
            ) : null}

            {value.exactLocation && !value.exactLocationSelected ? (
              <p className="mt-2 text-xs text-amber-600">
                Select a suggestion to confirm this location.
              </p>
            ) : null}

            {locationSelectionHint ? (
              <p className="mt-2 text-xs text-slate-600">{locationSelectionHint}</p>
            ) : null}

            {hasLocationSuggestions && isHighlightedSuggestionAmbiguous ? (
              <p className="mt-2 text-xs text-amber-600">
                This location name exists in multiple districts. Please click the exact district from the list.
              </p>
            ) : null}

            {hasLocationSuggestions ? (
              <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
                <ul className="max-h-60 overflow-auto py-1">
                  {suggestions.map((item, index) => (
                    <li key={`${item.formatted}-${index}`}>
                      <button
                        type="button"
                        className={`w-full px-3 py-2 text-left transition-colors ${
                          highlightedSuggestionIndex === index ? "bg-slate-100" : "hover:bg-slate-50"
                        }`}
                        onMouseEnter={() => setHighlightedSuggestionIndex(index)}
                        onMouseDown={(event) => {
                          event.preventDefault();
                          applyLocationSuggestion(item);
                        }}
                        onClick={() => applyLocationSuggestion(item)}
                      >
                        <p className="text-sm font-medium text-slate-800">
                          {item.locationName}
                          {item.postcode ? ` (${item.postcode})` : ""}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.district || item.formatted}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </DetailFieldCard>

        <DetailFieldCard
          label="Postal area or zip code"
          helperText="Enter exactly 5 digits."
          required
          counter={`${value.postalAreaOrZip.length}/${MAX_POSTAL_AREA_LENGTH}`}
          error={errors.postalAreaOrZip}
        >
          <Input
            value={value.postalAreaOrZip}
            onChange={setDigitsField("postalAreaOrZip", MAX_POSTAL_AREA_LENGTH)}
            maxLength={MAX_POSTAL_AREA_LENGTH}
            placeholder="e.g., 11856"
            className="h-11 text-sm"
            aria-invalid={Boolean(errors.postalAreaOrZip)}
            inputMode="numeric"
            pattern="[0-9]{5}"
            title="Postal area or ZIP must be exactly 5 digits."
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
          helperText="Enter exactly 10 digits. This is kept for authority follow-up and is not shown in the public feed."
          required
          counter={`${value.contactNumber.length}/${MAX_CONTACT_LENGTH}`}
          error={errors.contactNumber}
        >
          <Input
            value={value.contactNumber}
            onChange={setDigitsField("contactNumber", MAX_CONTACT_LENGTH)}
            maxLength={MAX_CONTACT_LENGTH}
            placeholder="e.g., 0771234567"
            className="h-11 text-sm"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            aria-invalid={Boolean(errors.contactNumber)}
            pattern="[0-9]{10}"
            title="Contact number must be exactly 10 digits."
            required
          />
        </DetailFieldCard>
      </div>
    </section>
  );
}
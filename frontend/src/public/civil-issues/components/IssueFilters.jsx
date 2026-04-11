import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useSriLankaLocationAutocomplete } from "@/hooks/useSriLankaLocationAutocomplete";

export default function IssueFilters({
  categories,
  districts,
  selectedCategory,
  selectedDistrict,
  locationQuery,
  locationMessage,
  onCategoryChange,
  onDistrictChange,
  onLocationQueryChange,
  onLocationSelect,
}) {
  const locationInputId = useId();
  const locationListboxId = useId();
  const locationHelperTextId = useId();
  const locationContainerRef = useRef(null);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [highlightedSuggestionIndex, setHighlightedSuggestionIndex] = useState(-1);
  const [locationSelectionHint, setLocationSelectionHint] = useState("");

  const {
    suggestions,
    loading,
    mode: autocompleteMode,
    matchedDistrict,
  } = useSriLankaLocationAutocomplete({
    query: locationQuery,
  });

  const normalizedQuery = typeof locationQuery === "string" ? locationQuery.trim() : "";
  const shouldShowSuggestionPanel = showLocationSuggestions && normalizedQuery.length >= 2;
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

  const helperText = useMemo(() => {
    if (normalizedQuery.length < 2) {
      return "Type at least 2 characters to search by town or postcode.";
    }

    if (loading) {
      return "Loading suggestions...";
    }

    if (locationMessage) {
      return locationMessage;
    }

    if (locationSelectionHint) {
      return locationSelectionHint;
    }

    if (autocompleteMode === "district" && matchedDistrict && suggestions.length > 0) {
      return `Showing locations in ${matchedDistrict} District.`;
    }

    if (!shouldShowSuggestionPanel) {
      return "Press Arrow Down to browse suggestions.";
    }

    if (suggestions.length === 0) {
      return "No matching locations found.";
    }

    return `${suggestions.length} suggestion${suggestions.length === 1 ? "" : "s"} available. Use Arrow keys and Enter to select.`;
  }, [
    autocompleteMode,
    loading,
    matchedDistrict,
    locationMessage,
    locationSelectionHint,
    normalizedQuery.length,
    shouldShowSuggestionPanel,
    suggestions.length,
  ]);

  useEffect(() => {
    if (!shouldShowSuggestionPanel || suggestions.length === 0) {
      setHighlightedSuggestionIndex(-1);
      return;
    }

    setHighlightedSuggestionIndex((prev) => {
      if (prev >= 0 && prev < suggestions.length) {
        return prev;
      }

      return 0;
    });
  }, [shouldShowSuggestionPanel, suggestions.length]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!locationContainerRef.current?.contains(event.target)) {
        setShowLocationSuggestions(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  const handleSuggestionSelect = (item) => {
    onLocationSelect(item);
    setLocationSelectionHint("");
    setShowLocationSuggestions(false);
    setHighlightedSuggestionIndex(-1);
  };

  const handleLocationInputKeyDown = (event) => {
    if (!shouldShowSuggestionPanel || suggestions.length === 0) {
      if (event.key === "Escape") {
        setShowLocationSuggestions(false);
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setShowLocationSuggestions(true);
      setHighlightedSuggestionIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedSuggestionIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
      return;
    }

    if (event.key === "Enter") {
      if (suggestions.length > 0) {
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

        handleSuggestionSelect(targetSuggestion);
      }
      return;
    }

    if (event.key === "Escape") {
      setShowLocationSuggestions(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 sm:p-5">
    <div className="grid w-full gap-3 md:grid-cols-3 md:items-start">
      <div className="grid min-w-0 w-full gap-1.5">
        <Label htmlFor={locationInputId} className="ml-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Location / ZIP</Label>
        <div
          ref={locationContainerRef}
          className="relative"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setShowLocationSuggestions(false);
            }
          }}
        >
          <Input
            id={locationInputId}
            value={locationQuery}
            onChange={(event) => {
              onLocationQueryChange(event.target.value);
              setLocationSelectionHint("");
              setShowLocationSuggestions(true);
            }}
            onFocus={() => setShowLocationSuggestions(true)}
            onKeyDown={handleLocationInputKeyDown}
            className="h-11 w-full bg-white text-sm"
            placeholder="Type town or postcode"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={hasLocationSuggestions}
            aria-haspopup="listbox"
            aria-controls={locationListboxId}
            aria-describedby={locationHelperTextId}
            aria-activedescendant={
              hasLocationSuggestions && highlightedSuggestionIndex >= 0
                ? `${locationListboxId}-option-${highlightedSuggestionIndex}`
                : undefined
            }
          />

          <p id={locationHelperTextId} role="status" aria-live="polite" className="mt-1 text-[11px] text-slate-500">
            {helperText}
          </p>

          {hasLocationSuggestions ? (
            <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
              <ul id={locationListboxId} role="listbox" className="max-h-60 overflow-auto py-1">
                {suggestions.map((item, index) => (
                  <li
                    key={`${item.formatted}-${item.postcode || "na"}-${index}`}
                    id={`${locationListboxId}-option-${index}`}
                    role="option"
                    aria-selected={highlightedSuggestionIndex === index}
                  >
                    <button
                      type="button"
                      className={`w-full px-3 py-2 text-left transition-colors ${
                        highlightedSuggestionIndex === index ? "bg-slate-100" : "hover:bg-slate-50"
                      }`}
                      onMouseEnter={() => setHighlightedSuggestionIndex(index)}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        handleSuggestionSelect(item);
                      }}
                      onClick={() => handleSuggestionSelect(item)}
                    >
                      <p className="text-sm font-medium text-slate-800">
                        {item.locationName}
                        {item.postcode ? ` (${item.postcode})` : ""}
                      </p>
                      <p className="text-xs text-slate-500">{item.district || item.formatted}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid min-w-0 w-full gap-1.5">
        <Label className="ml-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Category</Label>
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="h-11 w-full bg-white text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(categories).map(([val, label]) => (
              <SelectItem key={val} value={val}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid min-w-0 w-full gap-1.5">
        <Label className="ml-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">District</Label>
        <Select value={selectedDistrict} onValueChange={onDistrictChange}>
          <SelectTrigger className="h-11 w-full bg-white text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {districts.map((dist) => (
              <SelectItem key={dist} value={dist}>{dist}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
    </div>
  );
}

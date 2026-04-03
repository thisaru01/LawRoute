import { useState } from "react";
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
  onCategoryChange,
  onDistrictChange,
  onLocationQueryChange,
  onLocationSelect,
}) {
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  const { suggestions, loading } = useSriLankaLocationAutocomplete({
    query: locationQuery,
  });

  const hasLocationSuggestions = showLocationSuggestions && suggestions.length > 0;

  const handleSuggestionSelect = (item) => {
    onLocationSelect(item);
    setShowLocationSuggestions(false);
  };

  return (
    <div className="grid w-full gap-3 md:grid-cols-3 md:items-start">
      <div className="grid min-w-0 w-full gap-1.5">
        <Label className="ml-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Location / ZIP</Label>
        <div className="relative">
          <Input
            value={locationQuery}
            onChange={(event) => {
              onLocationQueryChange(event.target.value);
              setShowLocationSuggestions(true);
            }}
            onFocus={() => setShowLocationSuggestions(true)}
            onBlur={() => {
              setTimeout(() => setShowLocationSuggestions(false), 120);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                setShowLocationSuggestions(false);
              }
            }}
            className="h-11 w-full bg-white text-sm"
            placeholder="Type town or postcode"
          />

          <p className="mt-1 text-[11px] text-slate-500">
            Select a suggestion to apply the location filter.
          </p>

          {loading ? (
            <p className="mt-1 text-[11px] text-slate-500">Loading suggestions...</p>
          ) : null}

          {hasLocationSuggestions ? (
            <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
              <ul className="max-h-60 overflow-auto py-1">
                {suggestions.map((item, index) => (
                  <li key={`${item.formatted}-${index}`}>
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left transition-colors hover:bg-slate-50"
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
  );
}

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Loader2, GraduationCap, School } from "lucide-react";
import { cn } from "@/lib/utils";
import { getUniversityAutocomplete } from "@/api/services/locationService";

const COMMON_LAW_DEGREES = [
  "Bachelor of Laws (LLB)",
  "Bachelor of Civil Law (BCL)",
  "Juris Doctor (JD)",
  "Master of Laws (LLM)",
  "Doctor of Juridical Science (SJD)",
  "Doctor of Laws (LLD)",
  "Master of Legal Studies (MLS)",
  "Bachelor of Arts in Law",
  "Postgraduate Diploma in Law (PGDL)",
  "Solicitors Qualifying Examination (SQE)",
  "Law and Business",
  "Law and Society",
];

const COMMON_UNIVERSITIES = [
  "University of Colombo",
  "University of Peradeniya",
  "University of Moratuwa",
  "University of Kelaniya",
  "University of Sri Jayewardenepura",
  "SLIIT (Sri Lanka Institute of Information Technology)",
  "IIT (Informatics Institute of Technology)",
  "NSBM Green University",
  "General Sir John Kotelawala Defence University (KDU)",
  "Open University of Sri Lanka",
  "Harvard University",
  "University of Oxford",
  "University of Cambridge",
  "Stanford University",
  "Yale Law School",
  "London School of Economics (LSE)",
];

const normalizeUniversityQuery = (value) =>
  (typeof value === "string"
    ? value
        .trim()
        .toLowerCase()
        .replace(/\bunivercity\b/g, "university")
        .replace(/\s+/g, " ")
    : "");

const getLocalUniversityMatches = (query) => {
  const normalizedQuery = normalizeUniversityQuery(query);

  if (!normalizedQuery) {
    return COMMON_UNIVERSITIES.slice(0, 5);
  }

  return COMMON_UNIVERSITIES.filter((university) =>
    normalizeUniversityQuery(university).includes(normalizedQuery),
  ).slice(0, 5);
};

export function SuggestionInput({ 
  value, 
  onChange, 
  placeholder, 
  type = "university", // "university" or "degree"
  className 
}) {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");

  // Update internal state when value prop changes
  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  const fetchUniversities = async (query) => {
    // Local filtering as immediate results or fallback
    const localFiltered = getLocalUniversityMatches(query);
    const normalizedQuery = normalizeUniversityQuery(query);

    if (normalizedQuery.length < 3) {
      setSuggestions(localFiltered);
      if (localFiltered.length > 0) setOpen(true);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await getUniversityAutocomplete({ text: normalizedQuery, limit: 8 });
      const apiResults = Array.isArray(response.data?.data) ? response.data.data.slice(0, 8) : [];
      
      const mergedResults = Array.from(new Set([...localFiltered, ...apiResults]));
      setSuggestions(mergedResults);
      if (mergedResults.length > 0) setOpen(true);
    } catch (error) {
      console.error("University autocomplete failed. Using local fallback.", error);
      setSuggestions(localFiltered);
      if (localFiltered.length > 0) setOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const filterDegrees = (query) => {
    const list = COMMON_LAW_DEGREES;
    if (!query) {
      setSuggestions(list.slice(0, 6));
      setOpen(true);
      return;
    }
    const filtered = list.filter(d => 
      d.toLowerCase().includes(query.toLowerCase())
    );
    setSuggestions(filtered.slice(0, 8));
    if (filtered.length > 0) setOpen(true);
  };

  // Simple debounce
  useEffect(() => {
    // Only fetch if input is different from what we've already selected
    // or if we're explicitly looking for suggestions
    if (!inputValue) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      // If we are typing (input is not empty)
      if (type === "university") {
        fetchUniversities(inputValue);
      } else {
        filterDegrees(inputValue);
      }
    }, 300); // Slightly faster debounce

    return () => clearTimeout(timer);
  }, [inputValue, type]);

  const handleSelect = (suggestion) => {
    setInputValue(suggestion);
    onChange(suggestion);
    setOpen(false);
    // Clear suggestions so they don't pop back up immediately
    setSuggestions([]);
  };

  return (
    <div className="relative w-full">
      <Popover open={open && suggestions.length > 0} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative w-full">
            <Input
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                onChange(e.target.value);
              }}
              onFocus={() => {
                if (type === "degree" && !inputValue) {
                  setSuggestions(COMMON_LAW_DEGREES.slice(0, 6));
                  setOpen(true);
                }
              }}
              className={cn("pr-9", className)}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground opacity-40">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : type === "university" ? (
                <School className="h-4 w-4" />
              ) : (
                <GraduationCap className="h-4 w-4" />
              )}
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent 
          className="p-1 w-[var(--radix-popover-trigger-width)] max-h-64 overflow-y-auto shadow-2xl border-blue-100 bg-white/95 backdrop-blur-md" 
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex flex-col">
            {suggestions.map((item, i) => (
              <button
                key={i}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-left hover:bg-blue-50 transition-colors rounded-md group"
                onClick={() => handleSelect(item)}
              >
                {type === "university" ? (
                  <School className="h-3.5 w-3.5 text-blue-400 group-hover:text-blue-600" />
                ) : (
                  <GraduationCap className="h-3.5 w-3.5 text-emerald-400 group-hover:text-emerald-600" />
                )}
                <span className="font-medium text-gray-700 group-hover:text-gray-900 line-clamp-1">{item}</span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

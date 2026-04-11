import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { Search, SlidersHorizontal, X, RotateCcw, AlertCircle } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer.jsx";
import LawyerCard, { EXPERTISE_LABELS } from "./components/LawyerCard";
import LawyerCardSkeleton from "./components/LawyerCardSkeleton";
import { useFindLawyers } from "./hooks/useFindLawyers";

//  Constants 
const EXPERTISE_OPTIONS = Object.entries(EXPERTISE_LABELS); // [["general","General"], ...]
const DEBOUNCE_MS = 350;

//  Helpers 
function useDebounced(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

//  Component 
export default function FindLawyerPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Controlled inputs — read initial values from URL
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  // "all" is the sentinel for "no expertise filter" (Radix Select forbids empty-string values)
  const [expertise, setExpertise]     = useState(searchParams.get("expertise") || "all");
  const [isFree, setIsFree]           = useState(searchParams.get("isFree") === "true");

  // Debounce the raw search input before syncing to URL / fetching
  const debouncedSearch = useDebounced(searchInput, DEBOUNCE_MS);

  // Keep URL in sync with filter state
  useEffect(() => {
    const next = {};
    if (debouncedSearch)           next.search    = debouncedSearch;
    if (expertise && expertise !== "all") next.expertise = expertise;
    if (isFree)                    next.isFree    = "true";
    setSearchParams(next, { replace: true });
  }, [debouncedSearch, expertise, isFree, setSearchParams]);

  // Fetch lawyers
  const { data: lawyers, isLoading, error, refresh } = useFindLawyers({
    search:    debouncedSearch,
    expertise: expertise === "all" ? "" : expertise,
    isFree,
  });


  function clearFilters() {
    setSearchInput("");
    setExpertise("all");
    setIsFree(false);
  }

  const hasActiveFilters = debouncedSearch || (expertise && expertise !== "all") || isFree;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/*  Page hero header & filters  */}
      <div className="border-b border-border bg-card pb-8 pt-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Find a Lawyer
            </h1>
            <p className="mt-2 text-muted-foreground">
              Browse verified lawyers for your legal needs.
            </p>
          </div>

          {/*  Search + filters panel  */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="lawyer-search"
                placeholder="Search by name, title, or specialty…"
                className="pl-9"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Expertise filter */}
            <div className="w-full sm:w-52">
              <Select value={expertise} onValueChange={setExpertise}>
                <SelectTrigger id="expertise-filter">
                  <SelectValue placeholder="All expertise areas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All expertise areas</SelectItem>
                  {EXPERTISE_OPTIONS.map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Free consultation toggle */}
            <div className="flex items-center gap-2 pb-0.5">
              <Checkbox
                id="free-filter"
                checked={isFree}
                onCheckedChange={(checked) => setIsFree(Boolean(checked))}
              />
              <Label htmlFor="free-filter" className="cursor-pointer select-none text-sm">
                Free consultation
              </Label>
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="shrink-0 gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Clear
              </Button>
            )}
          </div>

          {/* Active filter pills */}
          {(expertise || isFree) && (
            <>
              <Separator className="mt-4" />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filters:
                </span>

                {expertise && expertise !== "all" && (
                  <Badge
                    variant="secondary"
                    className="gap-1 pr-1.5 text-xs"
                    onClick={() => setExpertise("all")}
                    role="button"
                    aria-label={`Remove expertise filter: ${EXPERTISE_LABELS[expertise]}`}
                  >
                    {EXPERTISE_LABELS[expertise] || expertise}
                    <X className="h-3 w-3 cursor-pointer" />
                  </Badge>
                )}

                {isFree && (
                  <Badge
                    variant="secondary"
                    className="gap-1 pr-1.5 text-xs"
                    onClick={() => setIsFree(false)}
                    role="button"
                    aria-label="Remove free consultation filter"
                  >
                    Free consultation
                    <X className="h-3 w-3 cursor-pointer" />
                  </Badge>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 flex-1 w-full">
        {/*  Results header  */}
        {!isLoading && !error && (
          <p className="mb-4 text-sm text-muted-foreground">
            {lawyers.length === 0
              ? "No lawyers found"
              : `${lawyers.length} lawyer${lawyers.length !== 1 ? "s" : ""} found`}
          </p>
        )}

        {/*  Loading skeleton  */}
        {isLoading && <LawyerCardSkeleton count={6} />}

        {/*  Error state  */}
        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-destructive/40 bg-destructive/5 py-16 text-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Couldn't load lawyers</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {error?.message || "Request failed. Please try again."}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={refresh}>
              Retry
            </Button>
          </div>
        )}

        {/*  Empty state  */}
        {!isLoading && !error && lawyers.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center text-muted-foreground">
            <Search className="h-8 w-8 opacity-40" />
            <div>
              <p className="font-medium">No lawyers match your search</p>
              <p className="mt-1 text-sm">Try adjusting your filters or search terms.</p>
            </div>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear all filters
              </Button>
            )}
          </div>
        )}

        {/*  Lawyer grid  */}
        {!isLoading && !error && lawyers.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lawyers.map((lawyer) => (
              <LawyerCard key={lawyer.id} lawyer={lawyer} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin } from "lucide-react";

/**
 * List of districts in Sri Lanka.
 * Hardcoded here to ensure the component is self-contained for cross-triage use.
 */
const SRI_LANKA_DISTRICTS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha",
  "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala",
  "Mannar", "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya",
  "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
];

/**
 * Reusable District Filter component for Admin and Authority dashboards.
 * Responsibility: Provide a clean, consistent interface for regional filtering.
 */
export default function DistrictFilter({ value, onValueChange, className = "" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="hidden items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:flex">
        <MapPin className="h-3.5 w-3.5" />
        <span>District:</span>
      </div>
      
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-9 w-[160px] bg-white text-xs font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50">
          <SelectValue placeholder="All Districts" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-xs font-medium">All Districts</SelectItem>
          {SRI_LANKA_DISTRICTS.map((district) => (
            <SelectItem key={district} value={district} className="text-xs">
              {district}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

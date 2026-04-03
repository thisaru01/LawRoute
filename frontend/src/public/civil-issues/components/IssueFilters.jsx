import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function IssueFilters({
  categories,
  districts,
  selectedCategory,
  selectedDistrict,
  onCategoryChange,
  onDistrictChange,
}) {
  return (
    <div className="flex w-full flex-wrap gap-3 sm:w-auto">
      <div className="grid w-full gap-1.5 sm:w-auto">
        <Label className="ml-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Category</Label>
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="h-11 w-full sm:w-[180px] bg-white text-sm">
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

      <div className="grid w-full gap-1.5 sm:w-auto">
        <Label className="ml-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">District</Label>
        <Select value={selectedDistrict} onValueChange={onDistrictChange}>
          <SelectTrigger className="h-11 w-full sm:w-[180px] bg-white text-sm">
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

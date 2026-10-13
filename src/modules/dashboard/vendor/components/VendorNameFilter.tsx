import { X } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "@/components/common/SearchableSelect.tsx";
import { cn } from "@/lib/utils.ts";

interface VendorNameFilterProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  options: SearchableSelectOption[];
  isLoading?: boolean;
  className?: string;
}

/**
 * Vendor-name dropdown + Clear button for the market lists (spots / live /
 * standard rates). Fully controlled — the selected value lives in the parent
 * page (persisted to localStorage), so refetches, status toggles and view
 * switches never reset it. It only clears via the Clear button.
 */
export function VendorNameFilter({
  id,
  value,
  onChange,
  onClear,
  options,
  isLoading = false,
  className,
}: VendorNameFilterProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="w-full min-w-0 sm:w-64 sm:shrink-0">
        <SearchableSelect
          id={id}
          value={value}
          onChange={onChange}
          options={options}
          placeholder={isLoading ? "Loading vendors..." : "All Vendors"}
          disabled={isLoading}
          clearable={false}
          className="bg-background"
        />
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onClear}
        disabled={!value}
        title="Clear vendor filter"
        className="shrink-0 gap-1.5"
      >
        <X className="size-3.5" />
        <span>Clear</span>
      </Button>
    </div>
  );
}

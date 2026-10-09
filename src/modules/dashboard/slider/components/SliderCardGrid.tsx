import { useEffect, useRef, useState } from "react";
import { ArrowDownWideNarrow, Plus, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { TablePagination } from "@/components/ui/table-pagination.tsx";
import {
  CardEmptyState,
  CardErrorState,
  CardGridSkeleton,
} from "@/components/common/CardStates.tsx";
import { sortByRecency, type LatestFirstOrder } from "@/lib/sort.ts";
import { useHighlightFromHash } from "@/hooks/useHighlightFromHash.ts";
import { cn } from "@/lib/utils.ts";
import { useUpdateSliderStatus } from "../hook/useSlider.ts";
import type { SliderItem, SliderStatus } from "../types/slider.types.ts";
import { SliderCard } from "./SliderCard.tsx";

interface SliderCardGridProps {
  sliders: SliderItem[];
  isLoading: boolean;
  isFetching?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
  search: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onEdit: (slider: SliderItem) => void;
  onAdd?: () => void;
  addLabel?: string;
}

const SORT_OPTIONS: Array<{ value: LatestFirstOrder; label: string }> = [
  { value: "latest", label: "Latest updated" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
];

type Density = "cozy" | "compact";
const DENSITY_KEY = "kmr-slider-density";

/**
 * Card View grid for Sliders — same shared AppFeedCard design as News/Blog.
 * Same data + search + pagination contract as SliderTable.
 */
export function SliderCardGrid({
  sliders,
  isLoading,
  isFetching = false,
  errorMessage,
  onRetry,
  page,
  totalPages,
  total,
  perPage,
  search,
  onSearchChange,
  onPageChange,
  onEdit,
  onAdd,
  addLabel,
}: SliderCardGridProps) {
  const updateStatusMutation = useUpdateSliderStatus();
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [order, setOrder] = useState<LatestFirstOrder>("latest");
  const [density, setDensity] = useState<Density>(() => {
    try {
      return localStorage.getItem(DENSITY_KEY) === "compact" ? "compact" : "cozy";
    } catch {
      return "cozy";
    }
  });
  const searchRef = useRef<HTMLInputElement>(null);


  // Search is server-side (?search=); sort the loaded page latest-first.
  const visible = sortByRecency(sliders, order);
  const highlight = useHighlightFromHash();

  const handleToggleStatus = async (item: SliderItem) => {
    const nextStatus = item.slider_status === "Active" ? "Inactive" : "Active";
    setTogglingId(item.id);
    try {
      await updateStatusMutation.mutateAsync({ id: item.id, status: nextStatus as SliderStatus });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDensity = (d: Density) => {
    setDensity(d);
    try {
      localStorage.setItem(DENSITY_KEY, d);
    } catch {
      // ignore (private mode)
    }
  };

  const handleSearchKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && visible.length > 0) {
      e.preventDefault();
      onEdit(visible[0]);
    }
  };

  const compact = density === "compact";

  return (
    <div className="flex flex-col gap-4">
      <div className="sticky top-14 z-10 -mx-1 bg-background/95 px-1 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              ref={searchRef}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={handleSearchKey}
              placeholder="Search..."
              className="pl-8"
              aria-label="Search slider banners"
            />
          </div>
          <div className="flex items-center gap-2 sm:ml-auto">
            <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <ArrowDownWideNarrow className="size-3.5" />
              <span className="sr-only">Sort banners</span>
              <select
                value={order}
                onChange={(e) => setOrder(e.target.value as LatestFirstOrder)}
                aria-label="Sort banners"
                className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <div
              role="group"
              aria-label="Card density"
              className="inline-flex items-center gap-0.5 rounded-lg border border-border/80 bg-muted/40 p-0.5"
            >
              {(["cozy", "compact"] as Density[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleDensity(d)}
                  aria-pressed={density === d}
                  title={d === "cozy" ? "Comfortable cards" : "Compact cards — scan more per screen"}
                  className={cn(
                    "h-7 rounded-md px-2.5 text-xs font-medium capitalize transition-colors",
                    density === d
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
            {onAdd && (
              <Button size="sm" onClick={onAdd} className="gap-2 shrink-0">
                <Plus className="size-4" />
                <span>{addLabel || "Upload Banner"}</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <CardGridSkeleton count={6} />
      ) : errorMessage ? (
        <CardErrorState title="Could not load slider banners" message={errorMessage} onRetry={onRetry} />
      ) : visible.length === 0 ? (
        <CardEmptyState
          icon={SlidersHorizontal}
          title="No banners found"
          hint={search ? "Try adjusting your search criteria." : "Upload your first banner using the button above."}
        />
      ) : (
        <div
          className={cn(
            "grid gap-4",
            compact
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
              : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3",
          )}
        >
          {visible.map((item) => (
            <SliderCard
              key={item.id}
              slider={item}
              isToggling={togglingId === item.id}
              compact={compact}
              highlighted={highlight === `feed-${item.id}`}
              onEdit={onEdit}
              onToggleStatus={(s) => void handleToggleStatus(s)}
            />
          ))}
        </div>
      )}

      <TablePagination
        page={page}
        totalPages={totalPages}
        total={total}
        perPage={perPage}
        isLoading={isLoading}
        isFetching={isFetching}
        onPageChange={onPageChange}
      />
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { ArrowDownWideNarrow, Images, Search } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { TablePagination } from "@/components/ui/table-pagination.tsx";
import {
  CardEmptyState,
  CardErrorState,
  CardGridSkeleton,
} from "@/components/common/CardStates.tsx";
import { sortByRecency, type LatestFirstOrder } from "@/lib/sort.ts";
import { useHighlightFromHash } from "@/hooks/useHighlightFromHash.ts";
import { useFeedDeepLink } from "@/hooks/useFeedDeepLink.ts";
import { cn } from "@/lib/utils.ts";
import { useUpdateGalleryStatus } from "../hook/useGallery.ts";
import { fetchGalleryPage } from "../api/gallery.api.ts";
import type { GalleryItem, GalleryStatus } from "../types/gallery.types.ts";
import { GalleryCard } from "./GalleryCard.tsx";

interface GalleryCardGridProps {
  galleryItems: GalleryItem[];
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
  onEdit: (item: GalleryItem) => void;
}

const SORT_OPTIONS: Array<{ value: LatestFirstOrder; label: string }> = [
  { value: "latest", label: "Latest updated" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
];

type Density = "cozy" | "compact";
const DENSITY_KEY = "kmr-gallery-density";

/**
 * Card View grid for Gallery — same shared AppFeedCard design as News/Blog.
 * Same data + search + pagination contract as GalleryTable.
 */
export function GalleryCardGrid({
  galleryItems,
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
}: GalleryCardGridProps) {
  const updateStatusMutation = useUpdateGalleryStatus();
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (
        !t ||
        t.tagName === "INPUT" ||
        t.tagName === "TEXTAREA" ||
        t.isContentEditable ||
        document.querySelector('[role="dialog"]')
      ) {
        return;
      }
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Search is server-side (?search=); sort the loaded page latest-first.
  const visible = sortByRecency(galleryItems, order);
  const highlight = useHighlightFromHash({ paused: isLoading });

  // Deep link (#feed-<id>): jump to the page holding the item, even when it
  // isn't on the current server page. Clears a hiding search filter first.
  useFeedDeepLink({
    highlight,
    pageIds: galleryItems.map((g) => g.id),
    totalPages,
    isLoading,
    fetchPageIds: (p) =>
      fetchGalleryPage(p, perPage, "", "all").then((r) => r.items.map((g) => g.id)),
    onPageChange,
    hasActiveSearch: search.trim() !== "",
    onClearSearch: () => onSearchChange(""),
  });

  const handleToggleStatus = async (item: GalleryItem) => {
    const nextStatus = item.gallery_status === "Active" ? "Inactive" : "Active";
    setTogglingId(item.id);
    try {
      await updateStatusMutation.mutateAsync({ id: item.id, status: nextStatus as GalleryStatus });
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
              placeholder="Search gallery images... ( / )"
              className="pl-8 pr-9"
              aria-label="Search gallery images"
            />
            <kbd className="pointer-events-none absolute right-2.5 top-2 hidden h-5 items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground sm:inline-flex">
              /
            </kbd>
          </div>
          <div className="flex items-center gap-2 sm:ml-auto">
            <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <ArrowDownWideNarrow className="size-3.5" />
              <span className="sr-only">Sort images</span>
              <select
                value={order}
                onChange={(e) => setOrder(e.target.value as LatestFirstOrder)}
                aria-label="Sort images"
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
          </div>
        </div>
      </div>

      {isLoading ? (
        <CardGridSkeleton count={6} />
      ) : errorMessage ? (
        <CardErrorState title="Could not load gallery images" message={errorMessage} onRetry={onRetry} />
      ) : visible.length === 0 ? (
        <CardEmptyState
          icon={Images}
          title="No images found"
          hint={search ? "Try adjusting your search criteria." : "Upload your first image using the button above."}
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
            <GalleryCard
              key={item.id}
              item={item}
              isToggling={togglingId === item.id}
              compact={compact}
              highlighted={highlight === `feed-${item.id}`}
              onEdit={onEdit}
              onToggleStatus={(g) => void handleToggleStatus(g)}
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

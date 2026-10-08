import { useEffect, useRef, useState } from "react";
import { ArrowDownWideNarrow, FolderTree, Search } from "lucide-react";
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
import { useUpdateCategoryStatus } from "../hook/useCategory.ts";
import type { Category } from "../types/category.types.ts";
import { CategoryCard } from "./CategoryCard.tsx";

interface CategoryCardGridProps {
  categories: Category[];
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
  onEdit: (category: Category) => void;
  tabLabel: string;
}

const SORT_OPTIONS: Array<{ value: LatestFirstOrder; label: string }> = [
  { value: "latest", label: "Latest updated" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
];

type Density = "cozy" | "compact";
const DENSITY_KEY = "kmr-category-density";

/**
 * Card View grid for Categories — same shared AppFeedCard design.
 * Same data + search + pagination contract as CategoryTable
 * (client-paginated over the active Main/Sub tab).
 */
export function CategoryCardGrid({
  categories,
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
  tabLabel,
}: CategoryCardGridProps) {
  const updateStatusMutation = useUpdateCategoryStatus();
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [order, setOrder] = useState<LatestFirstOrder>("latest");
  const [density, setDensity] = useState<Density>(() => {
    try {
      const stored = localStorage.getItem(DENSITY_KEY);
      if (stored === "cozy" || stored === "compact") return stored;
      return "compact";
    } catch {
      return "compact";
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
  const visible = sortByRecency(categories, order);
  const highlight = useHighlightFromHash();

  const handleToggleStatus = async (item: Category) => {
    const nextStatus = item.categories_status === "Active" ? "Inactive" : "Active";
    setTogglingId(item.id);
    try {
      await updateStatusMutation.mutateAsync({ id: item.id, status: nextStatus });
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
              placeholder="Search categories by name... ( / )"
              className="pl-8 pr-9"
              aria-label="Search categories"
            />
            <kbd className="pointer-events-none absolute right-2.5 top-2 hidden h-5 items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground sm:inline-flex">
              /
            </kbd>
          </div>
          <div className="flex items-center gap-2 sm:ml-auto">
            <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <ArrowDownWideNarrow className="size-3.5" />
              <span className="sr-only">Sort categories</span>
              <select
                value={order}
                onChange={(e) => setOrder(e.target.value as LatestFirstOrder)}
                aria-label="Sort categories"
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
        <CardErrorState title="Could not load categories" message={errorMessage} onRetry={onRetry} />
      ) : visible.length === 0 ? (
        <CardEmptyState
          icon={FolderTree}
          title="No categories found"
          hint={search ? "Try adjusting your search criteria." : `Create your first ${tabLabel} using the button above.`}
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
            <CategoryCard
              key={item.id}
              category={item}
              isToggling={togglingId === item.id}
              compact={compact}
              highlighted={highlight === `feed-${item.id}`}
              onEdit={onEdit}
              onToggleStatus={(c) => void handleToggleStatus(c)}
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

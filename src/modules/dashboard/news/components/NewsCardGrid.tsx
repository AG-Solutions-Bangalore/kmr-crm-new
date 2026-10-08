import { useEffect, useRef, useState } from "react";
import { ArrowDownWideNarrow, Newspaper, Search } from "lucide-react";
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
import { useUpdateNewsStatus } from "../hook/useNews.ts";
import type { NewsItem } from "../types/news.types.ts";
import { NewsCard } from "./NewsCard.tsx";

interface NewsCardGridProps {
  articles: NewsItem[];
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
  onEdit: (article: NewsItem) => void;
}

const SORT_OPTIONS: Array<{ value: LatestFirstOrder; label: string }> = [
  { value: "latest", label: "Latest updated" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
];

type Density = "cozy" | "compact";
const DENSITY_KEY = "kmr-news-density";

/**
 * Card View grid for News (pilot). Same data + search + pagination contract
 * as NewsTable, so List ⇄ Card is a pure presentation switch.
 * Sorting is client-side over the loaded page (backend has no ?sort=).
 *
 * Speed features for daily ops:
 * - sticky toolbar (search/sort never scroll away),
 * - `/` focuses search from anywhere, `Enter` opens the top result,
 * - compact density scans ~2x items per screen.
 */
export function NewsCardGrid({
  articles,
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
}: NewsCardGridProps) {
  const updateStatusMutation = useUpdateNewsStatus();
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

  // `/` focuses search from anywhere (unless typing or a dialog is open).
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
  const visible = sortByRecency(articles, order, ["news_created_date"]);
  const highlight = useHighlightFromHash();

  const handleToggleStatus = async (item: NewsItem) => {
    const nextStatus = item.news_status === "Active" ? "Inactive" : "Active";
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

  // Enter in search opens the top result: Search → Enter → Edit → Save.
  const handleSearchKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && visible.length > 0) {
      e.preventDefault();
      onEdit(visible[0]);
    }
  };

  const compact = density === "compact";

  return (
    <div className="flex flex-col gap-4">
      {/* Sticky toolbar — search + sort + density stay reachable on long lists. */}
      <div className="sticky top-14 z-10 -mx-1 bg-background/95 px-1 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              ref={searchRef}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={handleSearchKey}
              placeholder="Search headline, details, category... ( / )"
              className="pl-8 pr-9"
              aria-label="Search news articles"
            />
            <kbd className="pointer-events-none absolute right-2.5 top-2 hidden h-5 items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground sm:inline-flex">
              /
            </kbd>
          </div>
          <div className="flex items-center gap-2 sm:ml-auto">
            <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <ArrowDownWideNarrow className="size-3.5" />
              <span className="sr-only">Sort articles</span>
              <select
                value={order}
                onChange={(e) => setOrder(e.target.value as LatestFirstOrder)}
                aria-label="Sort articles"
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
        <CardErrorState
          title="Could not load news articles"
          message={errorMessage}
          onRetry={onRetry}
        />
      ) : visible.length === 0 ? (
        <CardEmptyState
          icon={Newspaper}
          title="No articles found"
          hint={
            search
              ? "Try adjusting your search criteria."
              : "Publish your first market update using the button above — it will appear here exactly as customers see it in the app."
          }
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
            <NewsCard
              key={item.id}
              article={item}
              isToggling={togglingId === item.id}
              compact={compact}
              highlighted={highlight === `feed-${item.id}`}
              onEdit={onEdit}
              onToggleStatus={(a) => void handleToggleStatus(a)}
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

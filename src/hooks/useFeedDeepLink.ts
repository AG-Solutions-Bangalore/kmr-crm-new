import { useEffect, useRef } from "react";

interface FeedDeepLinkOptions {
  /** Anchor id from useHighlightFromHash (`feed-<id>`) — null when no deep link. */
  highlight: string | null;
  /** Ids rendered on the current page. */
  pageIds: Array<number | string>;
  /** Total server pages for the unfiltered list. */
  totalPages: number;
  /** True while the current page query is loading. */
  isLoading: boolean;
  /** Fetch one unfiltered server page; resolves to the ids it contains. */
  fetchPageIds: (page: number) => Promise<Array<number | string>>;
  /** Jump the grid to a page. */
  onPageChange: (page: number) => void;
  /** True when a search filter is hiding rows. */
  hasActiveSearch: boolean;
  /** Clear the search box (also resets server paging to page 1). */
  onClearSearch: () => void;
  /** Upper bound for the page scan (deep links only). Defaults to 20. */
  maxScanPages?: number;
}

/** Extract the record id from a `feed-<id>` anchor, or null. */
export function feedTargetId(highlight: string | null): string | null {
  if (!highlight || !highlight.startsWith("feed-")) return null;
  const id = highlight.slice("feed-".length);
  return id || null;
}

/**
 * Make `#feed-<id>` share links land on the item even when it lives on
 * another server page: scan unfiltered pages for the id, then jump to it.
 * Only runs for deep links; normal browsing is untouched. Gives up silently
 * when the item can't be found (deleted, or beyond the scan cap).
 */
export function useFeedDeepLink({
  highlight,
  pageIds,
  totalPages,
  isLoading,
  fetchPageIds,
  onPageChange,
  hasActiveSearch,
  onClearSearch,
  maxScanPages = 20,
}: FeedDeepLinkOptions): void {
  const targetId = feedTargetId(highlight);
  const scannedRef = useRef<string | null>(null);
  const fetchRef = useRef(fetchPageIds);
  fetchRef.current = fetchPageIds;

  useEffect(() => {
    if (!targetId || isLoading) return;
    // Already on screen — the card highlights + scrolls itself.
    if (pageIds.some((id) => String(id) === targetId)) return;
    // A search filter would hide the row even on the right page:
    // clear it first (also resets to page 1), the next pass jumps.
    if (hasActiveSearch) {
      onClearSearch();
      return;
    }
    if (scannedRef.current === targetId) return;
    let cancelled = false;
    (async () => {
      const total = Math.max(1, Math.min(totalPages, maxScanPages));
      for (let p = 1; p <= total; p++) {
        let ids: Array<number | string>;
        try {
          ids = await fetchRef.current(p);
        } catch {
          break;
        }
        if (cancelled) return;
        if (ids.some((id) => String(id) === targetId)) {
          onPageChange(p);
          break;
        }
      }
      scannedRef.current = targetId;
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId, isLoading, pageIds, totalPages, hasActiveSearch]);
}

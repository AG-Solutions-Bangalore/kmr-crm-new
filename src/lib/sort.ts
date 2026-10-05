export type LatestFirstOrder = "latest" | "newest" | "oldest";

/**
 * Timestamp candidates for "latest updates first" ordering.
 * The backend has no `?sort=` param, so daily-workflow lists are
 * sorted client-side: updatedAt → createdAt/publishedAt → id.
 */
interface Timestamped {
  id?: number | string;
  updated_at?: string | number | null;
  created_at?: string | number | null;
  updatedAt?: string | number | null;
  createdAt?: string | number | null;
  publishedAt?: string | number | null;
}

function extraField(item: Timestamped, field: string): unknown {
  return (item as unknown as Record<string, unknown>)[field];
}

function toTime(value: unknown): number {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const t = new Date(String(value)).getTime();
  return Number.isNaN(t) ? 0 : t;
}

/** Extra date-field fallbacks per module (e.g. news_created_date). */
export function itemTimestamp(item: Timestamped, extraFields: string[] = []): number {
  const candidates: unknown[] = [
    item.updated_at,
    item.updatedAt,
    ...extraFields.map((f) => extraField(item, f)),
    item.created_at,
    item.createdAt,
    item.publishedAt,
  ];
  for (const c of candidates) {
    const t = toTime(c);
    if (t > 0) return t;
  }
  return typeof item.id === "number" ? item.id : 0;
}

/**
 * Sort a loaded page latest-first without touching the server query.
 * Reusable for News / Rates / Live / Spot card & table views.
 */
export function sortByRecency<T extends Timestamped>(
  items: T[],
  order: LatestFirstOrder = "latest",
  extraFields: string[] = [],
): T[] {
  if (order === "newest") {
    return [...items].sort((a, b) => {
      const ta = Math.max(toTime(a.created_at ?? a.createdAt), ...extraFields.map((f) => toTime(extraField(a, f))));
      const tb = Math.max(toTime(b.created_at ?? b.createdAt), ...extraFields.map((f) => toTime(extraField(b, f))));
      if (tb !== ta) return tb - ta;
      return Number(b.id ?? 0) - Number(a.id ?? 0);
    });
  }
  if (order === "oldest") {
    return [...items].sort(
      (a, b) => itemTimestamp(a, extraFields) - itemTimestamp(b, extraFields),
    );
  }
  // "latest": updatedAt → createdAt/publishedAt → id, descending.
  return [...items].sort((a, b) => {
    const diff = itemTimestamp(b, extraFields) - itemTimestamp(a, extraFields);
    if (diff !== 0) return diff;
    return Number(b.id ?? 0) - Number(a.id ?? 0);
  });
}

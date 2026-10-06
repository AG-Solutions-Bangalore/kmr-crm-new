/**
 * Extract a newly-created record id from the backend's varied responses:
 * `{ id }`, `{ data: { id } }` or `{ data: { data: { id } } }`.
 * Returns null when the shape is unrecognized (callers fall back to
 * refetch-and-match by a unique field such as slug or mobile).
 */
export function extractCreatedId(res: unknown): string | null {
  if (!res || typeof res !== "object") return null;
  const outer = res as Record<string, unknown>;
  const data = (outer.data ?? outer) as Record<string, unknown> | unknown;
  const nested =
    data && typeof data === "object" && "data" in (data as Record<string, unknown>)
      ? ((data as Record<string, unknown>).data as Record<string, unknown> | unknown)
      : data;
  const candidates: unknown[] = [
    nested && typeof nested === "object"
      ? (nested as Record<string, unknown>).id
      : undefined,
    data && typeof data === "object" ? (data as Record<string, unknown>).id : undefined,
    outer.id,
  ];
  for (const cand of candidates) {
    if (typeof cand === "number" && Number.isFinite(cand)) return String(cand);
    if (typeof cand === "string" && cand.trim()) return cand.trim();
  }
  return null;
}

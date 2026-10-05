/**
 * Format any API date value as dd-mm-yyyy (e.g. 05-10-2026).
 * Handles `YYYY-MM-DD`, `YYYY-MM-DD HH:MM:SS`, ISO strings and
 * already-formatted `dd-mm-yyyy` values without timezone shifts.
 * Returns "—" for empty/unparseable input.
 */
export function formatDateDMY(value?: string | number | null): string {
  if (value === null || value === undefined || value === "") return "—";
  const raw = String(value).trim();
  if (!raw) return "—";

  // Plain `YYYY-MM-DD...` — slice the date part to avoid TZ day-shifts.
  const datePart = raw.slice(0, 10);
  const ymd = datePart.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (ymd) {
    return `${ymd[3].padStart(2, "0")}-${ymd[2].padStart(2, "0")}-${ymd[1]}`;
  }
  // Already `dd-mm-yyyy` (any separator) — normalize separators.
  const dmy = datePart.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmy) {
    return `${dmy[1].padStart(2, "0")}-${dmy[2].padStart(2, "0")}-${dmy[3]}`;
  }

  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}-${mm}-${d.getFullYear()}`;
}

function toTimestamp(value?: string | number | null): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const raw = value.trim();
  if (!raw) return null;
  // Plain `YYYY-MM-DD` parses as UTC midnight — fine for relative display.
  const t = new Date(raw).getTime();
  return Number.isNaN(t) ? null : t;
}

/**
 * Relative freshness ("just now", "5m ago", "3h ago", "Yesterday", "4d ago").
 * Returns null for empty/unparseable input or anything older than a week —
 * callers fall back to `formatDateDMY` for absolute dates.
 */
export function timeAgo(value?: string | number | null): string | null {
  const t = toTimestamp(value);
  if (t === null) return null;
  const diff = Date.now() - t;
  if (diff < 0) return "just now";
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return null;
}

/** True when `value` is within the last `hours` hours (drives "Updated" pills). */
export function isWithinHours(value?: string | number | null, hours = 24): boolean {
  const t = toTimestamp(value);
  if (t === null) return false;
  const diff = Date.now() - t;
  return diff >= 0 && diff <= hours * 3600 * 1000;
}

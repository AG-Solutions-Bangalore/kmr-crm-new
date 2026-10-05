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

/**
 * Stable accent color per category name (hash → palette).
 * Gives card feeds a recognizable, app-like identity per category
 * without storing any extra data. Reusable for Rates / Live / Spot.
 */
const ACCENTS = [
  "#10b981", // emerald
  "#0ea5e9", // sky
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#f43f5e", // rose
  "#06b6d4", // cyan
  "#f97316", // orange
  "#84cc16", // lime
];

export function categoryAccent(name?: string | null): string {
  const s = (name || "").trim().toLowerCase() || "uncategorized";
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return ACCENTS[h % ACCENTS.length];
}

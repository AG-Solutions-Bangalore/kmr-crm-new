/**
 * Stable accent color per category name (hash → palette).
 * Gives card feeds a recognizable, app-like identity per category
 * without storing any extra data. Reusable for Rates / Live / Spot.
 */
const ACCENTS = [
  "#2563eb", // blue-600
  "#0284c7", // sky-600
  "#3b82f6", // blue-500
  "#4f46e5", // indigo-600
  "#0ea5e9", // sky-500
  "#6366f1", // indigo-500
  "#0284c7", // light-blue
  "#1d4ed8", // blue-700
];

export function categoryAccent(name?: string | null): string {
  const s = (name || "").trim().toLowerCase() || "uncategorized";
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return ACCENTS[h % ACCENTS.length];
}

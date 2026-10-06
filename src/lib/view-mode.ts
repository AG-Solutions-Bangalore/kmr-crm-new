export type ListViewMode = "list" | "card";

/** Read a persisted view preference; falls back to `fallback`. */
export function readViewMode(key: string, fallback: ListViewMode = "card"): ListViewMode {
  try {
    const v = localStorage.getItem(key);
    return v === "list" || v === "card" ? v : fallback;
  } catch {
    return fallback;
  }
}

/** Persist a view preference (best-effort; ignores private-mode errors). */
export function writeViewMode(key: string, mode: ListViewMode): void {
  try {
    localStorage.setItem(key, mode);
  } catch {
    // ignore
  }
}

/** Persistent vendor-name filter (vendor id as string; "" = no filter). */

export const SPOT_VENDOR_FILTER_KEY = "kmr-vendor-spots-vendor-filter";
export const LIVE_VENDOR_FILTER_KEY = "kmr-vendor-live-vendor-filter";
export const RATE_VENDOR_FILTER_KEY = "kmr-vendor-rates-vendor-filter";

/** Read a persisted vendor filter; falls back to "" (no filter). */
export function readVendorFilter(key: string): string {
  try {
    return localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

/** Persist a vendor filter (best-effort; ignores private-mode errors). */
export function writeVendorFilter(key: string, value: string): void {
  try {
    if (value) {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
  } catch {
    // ignore
  }
}

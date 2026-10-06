import type { Vendor } from "../types/vendor.types.ts";

export type VendorTradeType = "live" | "rate" | "spot";

export const TRADE_MAPPING: Record<VendorTradeType, { id: string; label: string }> = {
  live: { id: "1", label: "Live" },
  rate: { id: "2", label: "Rate" },
  spot: { id: "3", label: "Spot" },
};

/**
 * Checks whether a vendor is assigned to a specific trade ("live", "rate", or "spot").
 * Evaluates both `vendor_trade` (IDs e.g. "1", "1, 2") and `vendor_trade_name` (e.g. "Live", "Rate", "Spot").
 */
export function vendorMatchesTrade(
  vendor: Pick<Vendor, "vendor_trade" | "vendor_trade_name">,
  trade: VendorTradeType,
): boolean {
  const { id, label } = TRADE_MAPPING[trade];
  const targetLabel = label.toLowerCase();

  // 1. Check numeric/comma-separated IDs in vendor_trade (e.g. "1", "1, 2", "3")
  if (vendor.vendor_trade) {
    const ids = String(vendor.vendor_trade)
      .split(",")
      .map((s) => s.trim().toLowerCase());
    if (ids.includes(id) || ids.includes(targetLabel)) {
      return true;
    }
  }

  // 2. Check textual names in vendor_trade_name (e.g. "Live", "Rate", "Spot", "Live, Rate")
  if (vendor.vendor_trade_name) {
    const names = String(vendor.vendor_trade_name)
      .toLowerCase()
      .split(",")
      .map((s) => s.trim());
    if (names.some((n) => n.includes(targetLabel))) {
      return true;
    }
  }

  return false;
}

/**
 * Filters a list of vendors to only those matching the specified trade.
 */
export function filterVendorsByTrade(
  vendors: Vendor[],
  trade: VendorTradeType,
): Vendor[] {
  return vendors.filter((v) => vendorMatchesTrade(v, trade));
}

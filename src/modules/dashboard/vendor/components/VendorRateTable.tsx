import { useState } from "react";
import { AlertCircle, IndianRupee, Power, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import type { VendorRateProduct } from "../types/vendor.types.ts";

interface VendorRateTableProps {
  rates: VendorRateProduct[];
  isLoading: boolean;
  type: "live" | "standard";
  onToggleStatus?: (item: VendorRateProduct) => Promise<void>;
  errorMessage?: string | null;
  onRetry?: () => void;
}

export function VendorRateTable({
  rates,
  isLoading,
  type,
  onToggleStatus,
  errorMessage,
  onRetry,
}: VendorRateTableProps) {
  const [search, setSearch] = useState("");
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const filtered = rates.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.vendor_product?.toLowerCase().includes(q) ||
      r.vendor_product_size?.toLowerCase().includes(q) ||
      String(r.vendor_product_rate).includes(q) ||
      String(r.id).includes(q)
    );
  });

  const handleToggle = async (item: VendorRateProduct) => {
    if (!onToggleStatus) return;
    setTogglingId(item.id);
    try {
      await onToggleStatus(item);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {errorMessage && (
        <div className="flex flex-col gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
            <AlertCircle className="size-4 shrink-0" />
            <span>
              <strong>Server Notice:</strong> Backend returned 500 for {type === "live" ? "Live Rates" : "Standard Rates"} (table/relationship empty on server). You can still submit new rates using the button above.
            </span>
          </div>
          {onRetry && (
            <Button size="sm" variant="outline" onClick={onRetry} className="h-7 shrink-0 text-xs">
              Retry Query
            </Button>
          )}
        </div>
      )}

      {/* Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${type === "live" ? "live" : "standard"} rates by product or size...`}
            className="pl-8"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border/60 bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Sl/No</th>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">Size / Unit</th>
                <th className="px-4 py-3">Rate</th>
                <th className="px-4 py-3">Vendor / Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span>Loading {type === "live" ? "live" : "standard"} rates...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <IndianRupee className="size-8 text-muted-foreground/40" />
                      <p className="font-medium text-foreground">
                        No {type === "live" ? "live" : "standard"} rates found
                      </p>
                      <p className="text-xs">
                        {rates.length === 0
                          ? `No rates have been created yet. Click "+ Add ${type === "live" ? "Live" : "Standard"} Rate" to add one.`
                          : "Try adjusting your search filter."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item, index) => {
                  const slNo = index + 1;
                  const isActive =
                    item.vendor_product_status === "Active" ||
                    (item as { status?: string }).status === "Active" ||
                    item.vendor_product_status === "1";

                  return (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {slNo}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {item.vendor_product}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {item.vendor_product_size || "—"}
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground">
                        ₹{item.vendor_product_rate}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        Vendor #{item.vendor_id} | Cat #{item.category_id}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={
                            isActive
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "border-muted-foreground/30 bg-muted/40 text-muted-foreground"
                          }
                        >
                          {isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {onToggleStatus && (
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={togglingId === item.id}
                            onClick={() => void handleToggle(item)}
                            title={isActive ? "Deactivate Rate" : "Activate Rate"}
                            className="size-8 text-muted-foreground hover:text-foreground"
                          >
                            <Power
                              className={`size-4 ${
                                isActive ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                              }`}
                            />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

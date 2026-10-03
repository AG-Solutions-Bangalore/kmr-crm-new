import { useState } from "react";
import { Edit2, Power, Search, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { useUpdateVendorSpotStatus } from "../hook/useVendor.ts";
import type { VendorSpotItem } from "../types/vendor.types.ts";

interface VendorSpotTableProps {
  spots: VendorSpotItem[];
  isLoading: boolean;
  onEdit: (spot: VendorSpotItem) => void;
}

export function VendorSpotTable({ spots, isLoading, onEdit }: VendorSpotTableProps) {
  const [search, setSearch] = useState("");
  const updateStatusMutation = useUpdateVendorSpotStatus();
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const filtered = spots.filter((spot) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      spot.vendor_spot_heading?.toLowerCase().includes(q) ||
      spot.vendor_spot_details?.toLowerCase().includes(q) ||
      spot.vendor_name?.toLowerCase().includes(q) ||
      spot.vendor_mobile?.toLowerCase().includes(q) ||
      spot.categories_name?.toLowerCase().includes(q) ||
      spot.sub_categories_name?.toLowerCase().includes(q) ||
      String(spot.id).includes(q)
    );
  });

  const handleToggleStatus = async (item: VendorSpotItem) => {
    const nextStatus = item.vendor_spot_status === "Active" ? "Inactive" : "Active";
    setTogglingId(item.id);
    try {
      await updateStatusMutation.mutateAsync({
        id: item.id,
        status: nextStatus,
      });
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search spot quotes by title, vendor, or details..."
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
                <th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Spot</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span>Loading vendor spot quotes...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Sparkles className="size-8 opacity-40 text-sky-500" />
                      <p className="font-medium">No spot quotes found</p>
                      <p className="text-xs">
                        {search
                          ? "Try adjusting your search criteria"
                          : "Create spot quotes using the button above."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isActive = item.vendor_spot_status === "Active";
                  const isToggling = togglingId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-0.5">
                          <p className="font-medium text-foreground">
                            {item.vendor_name || `Vendor #${item.vendor_id}`}
                          </p>
                          <span className="text-[11px] text-muted-foreground">
                            {item.vendor_mobile || `#${item.vendor_id}`}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-medium text-foreground">
                            {item.categories_name || `Category #${item.category_id}`}
                          </span>
                          {item.sub_categories_name ? (
                            <span className="text-[11px] text-muted-foreground">
                              {item.sub_categories_name}
                            </span>
                          ) : item.sub_category_id ? (
                            <span className="text-[11px] text-muted-foreground">
                              Sub #{item.sub_category_id}
                            </span>
                          ) : null}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 max-w-[260px]">
                        <p className="font-medium text-foreground">
                          {item.vendor_spot_heading}
                        </p>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          ID: #{item.id}
                        </span>
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {item.vendor_spot_details}
                        </p>
                      </td>

                      <td className="px-4 py-3.5 text-xs">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-foreground">
                            {item.vendor_spot_created_date || "—"}
                          </span>
                          <span className="text-muted-foreground">
                            {item.vendor_spot_created_time || "—"}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <Badge
                          variant={isActive ? "default" : "secondary"}
                          className={
                            isActive
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-medium"
                              : "bg-muted text-muted-foreground font-medium"
                          }
                        >
                          {item.vendor_spot_status || "Active"}
                        </Badge>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(item)}
                            disabled={isToggling}
                            title={isActive ? "Set Inactive" : "Set Active"}
                            className="size-8 p-0"
                          >
                            <Power
                              className={`size-3.5 ${
                                isActive ? "text-emerald-600" : "text-muted-foreground"
                              }`}
                            />
                            <span className="sr-only">Toggle</span>
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(item)}
                            className="size-8 p-0"
                            title="Edit Spot Quote"
                          >
                            <Edit2 className="size-3.5" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </div>
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

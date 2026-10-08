import { useState } from "react";
import { Edit2, MapPin, Phone, Power, Search, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { TablePagination } from "@/components/ui/table-pagination.tsx";
import { formatDateDMY } from "@/lib/date.ts";
import { resolveDynamicImageUrl, useApiNoImageUrl } from "@/lib/image.ts";
import { useUpdateVendorStatus } from "../hook/useVendor.ts";
import type { Vendor } from "../types/vendor.types.ts";

function VendorThumb({ filename, name }: { filename?: string | null; name?: string }) {
  const [error, setError] = useState(false);
  const fallback = useApiNoImageUrl();
  const url = resolveDynamicImageUrl(filename, "vendor_images");
  const src = error ? fallback : url;
  return (
    <img
      src={src}
      alt={name || "Vendor"}
      loading="lazy"
      className="size-9 shrink-0 rounded-lg border border-border/60 object-cover"
      onError={() => setError(true)}
    />
  );
}

interface VendorTableProps {
  vendors: Vendor[];
  isLoading: boolean;
  isFetching?: boolean;
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
  search: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onEdit: (vendor: Vendor) => void;
}

export function VendorTable({
  vendors,
  isLoading,
  isFetching = false,
  page,
  totalPages,
  total,
  perPage,
  search,
  onSearchChange,
  onPageChange,
  onEdit,
}: VendorTableProps) {
  const updateStatusMutation = useUpdateVendorStatus();
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Search is server-side (?search=); render the loaded page directly.

  const handleToggleStatus = async (vendor: Vendor) => {
    const nextStatus = vendor.vendor_status === "Active" ? "Inactive" : "Active";
    setTogglingId(vendor.id);
    try {
      await updateStatusMutation.mutateAsync({
        id: vendor.id,
        status: nextStatus,
      });
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by vendor name, mobile, or city..."
            className="pl-8"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border/60 bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Sl/No</th>
                <th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3">Trade</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">City & Registered</th>
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
                      <span>Loading vendors...</span>
                    </div>
                  </td>
                </tr>
              ) : vendors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Store className="size-8 opacity-40" />
                      <p className="font-medium">No vendors found</p>
                      <p className="text-xs">
                        {search
                          ? "Try adjusting your search filters"
                          : "Add your first vendor using the button above."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                vendors.map((vendor, index) => {
                  const slNo = (page - 1) * perPage + index + 1;
                  const isActive = vendor.vendor_status === "Active";
                  const isToggling = togglingId === vendor.id;

                  return (
                    <tr
                      key={vendor.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {slNo}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <VendorThumb filename={vendor.vendor_image} name={vendor.vendor_name} />
                          <div>
                            <p className="font-medium text-foreground">
                              {vendor.vendor_name}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-xs">
                        <div className="flex flex-col gap-1">
                          {vendor.vendor_trade_name ? (
                            <Badge variant="secondary" className="w-fit font-medium">
                              {vendor.vendor_trade_name}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-xs">
                        <div className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-1 font-medium text-foreground">
                            <Phone className="size-3 text-muted-foreground" />
                            {vendor.vendor_mobile || "—"}
                          </span>
                          <span className="text-muted-foreground truncate max-w-[160px]">
                            {vendor.vendor_email || "—"}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-xs">
                        <div className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-1 font-medium text-foreground">
                            <MapPin className="size-3 text-muted-foreground" />
                            {vendor.vendor_city || "—"}
                          </span>
                          <span className="text-muted-foreground">
                            {formatDateDMY(vendor.vendor_register_date)}
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
                          {vendor.vendor_status || "Active"}
                        </Badge>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(vendor)}
                            disabled={isToggling}
                            title={isActive ? "Deactivate Vendor" : "Activate Vendor"}
                            className="size-8 p-0"
                          >
                            <Power
                              className={`size-3.5 ${
                                isActive ? "text-emerald-600" : "text-muted-foreground"
                              }`}
                            />
                            <span className="sr-only">Toggle Status</span>
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(vendor)}
                            className="size-8 p-0"
                            title="Edit Vendor"
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

      <TablePagination
        page={page}
        totalPages={totalPages}
        total={total}
        perPage={perPage}
        isLoading={isLoading}
        isFetching={isFetching}
        onPageChange={onPageChange}
      />
    </div>
  );
}

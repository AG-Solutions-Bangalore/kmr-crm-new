import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  Edit2,
  IndianRupee,
  Power,
  Search,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { TablePagination } from "@/components/ui/table-pagination.tsx";
import { CardEmptyState } from "@/components/common/CardStates.tsx";
import { resolveAssetImageUrl } from "@/lib/image.ts";
import { cn } from "@/lib/utils.ts";
import type { VendorRateProduct, VendorSpotItem } from "../types/vendor.types.ts";

export type MarketItemType = "rates" | "live" | "spots";

interface VendorMarketCardGridProps {
  type: MarketItemType;
  items: Array<VendorRateProduct | VendorSpotItem>;
  isLoading: boolean;
  isFetching?: boolean;
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
  search: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onEdit: (item: any) => void;
  onToggleStatus?: (item: any) => void;
}

function formatCardDate(item: VendorRateProduct | VendorSpotItem): {
  date: string;
  time: string;
} {
  const isSpot = "vendor_spot_heading" in item;
  if (isSpot && item.vendor_spot_created_date) {
    const time = item.vendor_spot_created_time || "—";
    return { date: item.vendor_spot_created_date, time };
  }

  const rawDate = item.updated_at || item.created_at;
  if (!rawDate) return { date: "—", time: "—" };

  const d = new Date(rawDate.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) {
    return { date: rawDate, time: "—" };
  }

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");
  const secs = String(d.getSeconds()).padStart(2, "0");

  return {
    date: `${day} - ${month} - ${year}`,
    time: `${hours}:${mins}:${secs}`,
  };
}

function NoImagePlaceholder() {
  return (
    <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 p-1 text-center">
      <svg
        className="size-6 text-muted-foreground/50"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" strokeWidth="0" />
        <path
          d="M21 15l-5-5L5 21"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="mt-1 text-[8px] font-bold leading-tight tracking-tight text-muted-foreground/60">
        NO IMAGE
        <br />
        AVAILABLE
      </span>
    </div>
  );
}

export function VendorMarketCardGrid({
  type,
  items,
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
  onToggleStatus,
}: VendorMarketCardGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Extract unique category names only from available products/items
  const categoryPills = useMemo(() => {
    const names = new Set<string>();
    for (const it of items) {
      const cat = it.categories_name?.trim();
      if (cat) names.add(cat);
    }
    const sorted = Array.from(names).sort((a, b) => a.localeCompare(b));
    return ["All", ...sorted];
  }, [items]);

  // If items change and selected category no longer exists, reset to "All"
  useEffect(() => {
    if (
      selectedCategory !== "All" &&
      !categoryPills.some((p) => p.toLowerCase() === selectedCategory.toLowerCase())
    ) {
      setSelectedCategory("All");
    }
  }, [categoryPills, selectedCategory]);

  // Client-filter items by active category pill
  const filteredItems = useMemo(() => {
    if (selectedCategory === "All") return items;
    return items.filter(
      (it) =>
        it.categories_name?.toLowerCase().trim() ===
        selectedCategory.toLowerCase().trim(),
    );
  }, [items, selectedCategory]);

  const handleToggle = async (item: VendorRateProduct | VendorSpotItem) => {
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
      {/* Category Filter Pills (Matches Image 4) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categoryPills.map((catName) => {
          const isActive = selectedCategory.toLowerCase() === catName.toLowerCase();
          return (
            <button
              key={catName}
              type="button"
              onClick={() => setSelectedCategory(catName)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors shadow-sm",
                isActive
                  ? "bg-blue-600 text-white dark:bg-blue-600 dark:text-white"
                  : "bg-blue-50/80 text-blue-900 border border-blue-200/80 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60 dark:hover:bg-blue-900/50",
              )}
            >
              {catName}
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={`Search ${type === "spots" ? "spot quotes" : type === "live" ? "live rates" : "standard rates"}...`}
            className="pl-8"
          />
        </div>
      </div>

      {/* Grid: 4 per row on desktop (matches requirement and image 4) */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-2xl border border-border/60 bg-muted/30 p-4"
            />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <CardEmptyState
          icon={type === "spots" ? Sparkles : IndianRupee}
          title="No items found"
          hint={
            search || selectedCategory !== "All"
              ? "Try adjusting your search criteria or category filter."
              : "No rates published yet."
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => {
            const isSpot = "vendor_spot_heading" in item;
            const spotItem = isSpot ? (item as VendorSpotItem) : null;
            const rateItem = !isSpot ? (item as VendorRateProduct) : null;

            const vendorName =
              item.vendor_name || `Vendor #${item.vendor_id}`;
            const categoryName = item.categories_name || "General";
            const imageUrl = item.vendor_image
              ? resolveAssetImageUrl(item.vendor_image, "vendor_images")
              : null;
            const { date, time } = formatCardDate(item);

            const isActive = isSpot
              ? spotItem?.vendor_spot_status === "Active"
              : rateItem?.vendor_product_status === "Active";

            return (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-border"
              >
                {/* Upper Section */}
                <div className="flex items-start gap-3">
                  {/* Left Thumbnail Box */}
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={vendorName}
                      className="size-16 shrink-0 rounded-xl border border-border/60 object-cover"
                    />
                  ) : (
                    <NoImagePlaceholder />
                  )}

                  {/* Middle Content + Price Badge */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-1">
                      <h3
                        className="truncate text-xs font-bold uppercase tracking-wide text-foreground"
                        title={vendorName}
                      >
                        {vendorName}
                      </h3>

                      {/* Right Badge: Rate */}
                      {rateItem && (
                        <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200/80 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800/80 whitespace-nowrap">
                          ₹ {rateItem.vendor_product_rate}
                        </span>
                      )}

                      {spotItem && (
                        <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200/80 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800/80 whitespace-nowrap">
                          Spot
                        </span>
                      )}
                    </div>

                    {/* Category Name (Uppercase) */}
                    <p className="mt-1 text-xs font-semibold uppercase text-muted-foreground truncate">
                      {categoryName}
                    </p>

                    {/* Product / Size Details */}
                    {rateItem && (
                      <p className="mt-0.5 text-xs font-medium text-foreground/80 truncate">
                        {rateItem.vendor_product_size || "Unit"}
                        {rateItem.vendor_product ? ` • ${rateItem.vendor_product}` : ""}
                      </p>
                    )}

                    {spotItem && (
                      <p
                        className="mt-0.5 text-xs font-medium text-foreground/80 line-clamp-2"
                        title={spotItem.vendor_spot_heading}
                      >
                        {spotItem.vendor_spot_heading}
                      </p>
                    )}
                  </div>
                </div>

                {/* Divider Line */}
                <div className="my-3 border-t border-border/60" />

                {/* Footer Section: Date, Time & View More */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Calendar className="size-3 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span className="truncate">{date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Clock className="size-3 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span>{time}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {onToggleStatus && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggle(item)}
                        disabled={togglingId === item.id}
                        title={isActive ? "Set Inactive" : "Set Active"}
                        className="size-7 p-0"
                      >
                        <Power
                          className={cn(
                            "size-3.5",
                            isActive ? "text-blue-600" : "text-muted-foreground",
                          )}
                        />
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(item)}
                      title="Edit"
                      className="size-7 p-0"
                    >
                      <Edit2 className="size-3.5" />
                    </Button>

                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="inline-flex items-center gap-0.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      View More &gt;
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
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

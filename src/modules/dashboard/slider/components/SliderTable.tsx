import { useState } from "react";
import { Edit2, ExternalLink, Power, Search, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { TablePagination } from "@/components/ui/table-pagination.tsx";
import { resolveAssetImageUrl } from "@/lib/image.ts";
import { useUpdateSliderStatus } from "../hook/useSlider.ts";
import type { SliderItem, SliderStatus } from "../types/slider.types.ts";

function SliderThumb({ filename }: { filename?: string | null }) {
  const [failed, setFailed] = useState(false);
  const url = resolveAssetImageUrl(filename, "slider_images");
  if (!url || failed) {
    return <SlidersHorizontal className="size-4 text-muted-foreground" />;
  }
  return (
    <img
      src={url}
      alt="Slider"
      loading="lazy"
      className="h-full w-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}

interface SliderTableProps {
  sliders: SliderItem[];
  isLoading: boolean;
  isFetching?: boolean;
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
  search: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onEdit: (slider: SliderItem) => void;
}

export function SliderTable({
  sliders,
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
}: SliderTableProps) {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const updateStatusMutation = useUpdateSliderStatus();
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Search is server-side (?search=); type filter applies to the loaded page.
  const filtered = sliders.filter((s) => {
    return (
      typeFilter === "all" ||
      s.slider_type?.toLowerCase() === typeFilter.toLowerCase()
    );
  });

  const handleToggleStatus = async (item: SliderItem) => {
    const nextStatus = item.slider_status === "Active" ? "Inactive" : "Active";
    setTogglingId(item.id);
    try {
      await updateStatusMutation.mutateAsync({
        id: item.id,
        status: nextStatus as SliderStatus,
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
            placeholder="Search by image, URL, or type..."
            className="pl-8"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">All Banners</option>
            <option value="Home">Home Banners</option>
            <option value="Category">Category Banners</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border/60 bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Banner Image</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Target URL</th>
                <th className="px-4 py-3">Sort Order</th>
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
                      <span>Loading slider banners...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <SlidersHorizontal className="size-8 opacity-40" />
                      <p className="font-medium">No sliders found</p>
                      <p className="text-xs">
                        {search
                          ? "Try adjusting your search criteria"
                          : "Upload your first banner using the button above."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((slider) => {
                  const isActive = slider.slider_status === "Active";
                  const isToggling = togglingId === slider.id;

                  return (
                    <tr
                      key={slider.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/30 font-mono text-xs overflow-hidden">
                            <SliderThumb filename={slider.slider_image} />
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-xs font-mono truncate max-w-[160px]">
                              {slider.slider_image || "—"}
                            </p>
                            <span className="text-[11px] text-muted-foreground">
                              ID: #{slider.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <Badge
                          variant={slider.slider_type === "Home" ? "default" : "secondary"}
                          className="text-xs font-normal"
                        >
                          {slider.slider_type}
                        </Badge>
                      </td>

                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {slider.slider_type === "Category"
                          ? slider.categories_name || `Category #${slider.category_id}`
                          : "All / Global"}
                      </td>

                      <td className="px-4 py-3.5 text-xs text-muted-foreground max-w-[180px] truncate">
                        {slider.slider_url ? (
                          <a
                            href={slider.slider_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <span className="truncate">{slider.slider_url}</span>
                            <ExternalLink className="size-3 shrink-0" />
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {slider.slider_sort_order ?? "1"}
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
                          {slider.slider_status || "Active"}
                        </Badge>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(slider)}
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
                            onClick={() => onEdit(slider)}
                            className="size-8 p-0"
                            title="Edit Slider"
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

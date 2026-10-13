import { useState } from "react";
import { Edit2, ExternalLink, Plus, Power, Search, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { TablePagination } from "@/components/ui/table-pagination.tsx";
import { resolveDynamicImageUrl, useApiNoImageUrl } from "@/lib/image.ts";
import { useUpdateSliderStatus } from "../hook/useSlider.ts";
import type { SliderItem, SliderStatus } from "../types/slider.types.ts";

function SliderThumb({ filename }: { filename?: string | null }) {
  const [error, setError] = useState(false);
  const fallback = useApiNoImageUrl();
  const url = resolveDynamicImageUrl(filename, "slider_images");
  const src = error ? fallback : url;
  return (
    <img
      src={src}
      alt="Slider"
      loading="lazy"
      className="h-full w-full object-cover"
      onError={() => setError(true)}
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
  onAdd?: () => void;
  addLabel?: string;
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
  onAdd,
  addLabel,
}: SliderTableProps) {
  const updateStatusMutation = useUpdateSliderStatus();
  const [togglingId, setTogglingId] = useState<number | null>(null);

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
            placeholder="Search..."
            className="pl-8"
          />
        </div>
        {onAdd && (
          <Button size="sm" onClick={onAdd} className="gap-2 shrink-0">
            <Plus className="size-4" />
            <span>{addLabel || "Upload Banner"}</span>
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border/60 bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Sl/No</th>
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
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span>Loading slider banners...</span>
                    </div>
                  </td>
                </tr>
              ) : sliders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
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
                sliders.map((slider, index) => {
                  const slNo = (page - 1) * perPage + index + 1;
                  const isActive = slider.slider_status === "Active";
                  const isToggling = togglingId === slider.id;

                  return (
                    <tr
                      key={slider.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {slNo}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/30 font-mono text-xs overflow-hidden">
                            <SliderThumb filename={slider.slider_image} />
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
                          ? slider.categories_name || "—"
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

import { useState } from "react";
import { Edit2, Images, Power, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { TablePagination } from "@/components/ui/table-pagination.tsx";
import { resolveAssetImageUrl } from "@/lib/image.ts";
import { useUpdateGalleryStatus } from "../hook/useGallery.ts";
import type { GalleryItem, GalleryStatus } from "../types/gallery.types.ts";

function GalleryThumb({
  filename,
  baseUrl,
}: {
  filename?: string;
  baseUrl?: string | null;
}) {
  const [failed, setFailed] = useState(false);
  // Prefer server-provided base (e.g. .../gallerys_images/) — actual folder
  // is `gallerys_images`, not `gallery_images`.
  const url = baseUrl
    ? `${baseUrl.replace(/\/?$/, "/")}${(filename || "").replace(/^\/+/, "")}`
    : resolveAssetImageUrl(filename, "gallerys_images");
  if (!url || failed) {
    return (
      <div
        className="flex h-full w-full flex-col items-center justify-center gap-1 p-1 text-center"
        title={filename || "No file"}
      >
        <Images className="size-5 text-muted-foreground" />
        <span className="text-[9px] leading-tight text-muted-foreground">
          {filename ? "No preview" : "No file"}
        </span>
      </div>
    );
  }
  return (
    <img
      src={url}
      alt="Gallery"
      loading="lazy"
      className="h-full w-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}

interface GalleryTableProps {
  galleryItems: GalleryItem[];
  isLoading: boolean;
  isFetching?: boolean;
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
  search: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onEdit: (item: GalleryItem) => void;
}

export function GalleryTable({
  galleryItems,
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
}: GalleryTableProps) {
  const updateStatusMutation = useUpdateGalleryStatus();
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Search is server-side (?search=); the loaded page is rendered as-is.
  const filtered = galleryItems;

  const handleToggleStatus = async (item: GalleryItem) => {
    const nextStatus = item.gallery_status === "Active" ? "Inactive" : "Active";
    setTogglingId(item.id);
    try {
      await updateStatusMutation.mutateAsync({
        id: item.id,
        status: nextStatus as GalleryStatus,
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
            placeholder="Search gallery images by name or ID..."
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
                <th className="px-4 py-3">Image Preview</th>
                <th className="px-4 py-3">Image Filename</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span>Loading gallery images...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Images className="size-8 opacity-40" />
                      <p className="font-medium">No gallery images found</p>
                      <p className="text-xs">
                        {search
                          ? "Try adjusting your search criteria"
                          : "Upload your first image using the button above."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item, index) => {
                  const slNo = (page - 1) * perPage + index + 1;
                  const isActive = item.gallery_status === "Active";
                  const isToggling = togglingId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {slNo}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/30 font-mono text-xs overflow-hidden">
                          <GalleryThumb
                            filename={item.gallery_image}
                            baseUrl={item.gallery_url}
                          />
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <p className="font-medium text-foreground text-xs font-mono truncate max-w-[240px]">
                          {item.gallery_image || "—"}
                        </p>
                        <span className="text-[11px] text-muted-foreground">
                          ID: #{item.id}
                        </span>
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
                          {item.gallery_status || "Active"}
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
                            title="Edit Item"
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

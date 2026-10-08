import { useState } from "react";
import { Check, Copy, Edit2, Images, Power, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { TablePagination } from "@/components/ui/table-pagination.tsx";
import { getApiNoImageUrl, resolveGalleryImageUrl } from "@/lib/image.ts";
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
  const fallback = getApiNoImageUrl();
  const directUrl = resolveGalleryImageUrl(filename, baseUrl);
  const url = failed ? fallback : directUrl || fallback;

  return (
    <img
      src={url}
      alt="Gallery"
      loading="lazy"
      className="h-full w-full object-contain p-1 bg-muted/20"
      onError={() => {
        if (!failed && directUrl) {
          setFailed(true);
        }
      }}
    />
  );
}

/** Full image URL — prefers the exact URL coming from the API. */
function galleryImageUrl(item: GalleryItem): string {
  return resolveGalleryImageUrl(item.gallery_image, item.gallery_url) ?? "";
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
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Search + status filter are server-side (?search=&status=); the loaded page is rendered as-is.

  const handleCopyUrl = async (item: GalleryItem) => {
    const text = galleryImageUrl(item);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for non-secure contexts (plain http).
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedId(item.id);
    window.setTimeout(() => {
      setCopiedId((current) => (current === item.id ? null : current));
    }, 2000);
  };

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
      {/* Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search gallery images by name..."
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
              ) : galleryItems.length === 0 ? (
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
                galleryItems.map((item, index) => {
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
                        <div className="flex items-center gap-2">
                          <p
                            className="font-medium text-foreground text-xs font-mono truncate max-w-[240px]"
                            title={item.gallery_image || undefined}
                          >
                            {item.gallery_image || "—"}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => void handleCopyUrl(item)}
                            disabled={!item.gallery_image && !item.gallery_url}
                            className="size-7 shrink-0 p-0"
                            title="Copy image URL"
                          >
                            {copiedId === item.id ? (
                              <Check className="size-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="size-3.5" />
                            )}
                            <span className="sr-only">Copy image URL</span>
                          </Button>
                        </div>
                        {copiedId === item.id && (
                          <p className="mt-0.5 text-[11px] font-medium text-emerald-600">
                            Copied!
                          </p>
                        )}
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

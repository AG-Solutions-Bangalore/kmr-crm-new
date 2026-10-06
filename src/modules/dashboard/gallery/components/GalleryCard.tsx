import { useEffect, useState } from "react";
import { AppFeedCard } from "@/components/common/AppFeedCard.tsx";
import { formatDateDMY, isWithinHours, timeAgo } from "@/lib/date.ts";
import { resolveAssetImageUrl } from "@/lib/image.ts";
import { categoryAccent } from "@/lib/category-color.ts";
import type { GalleryItem } from "../types/gallery.types.ts";

interface GalleryCardProps {
  item: GalleryItem;
  isToggling: boolean;
  compact?: boolean;
  highlighted?: boolean;
  onEdit: (item: GalleryItem) => void;
  onToggleStatus: (item: GalleryItem) => void;
}

/** Full image URL — same resolution rule as the table preview thumbnail. */
function galleryImageUrl(item: GalleryItem): string | null {
  if (item.gallery_url) {
    return `${item.gallery_url.replace(/\/?$/, "/")}${(item.gallery_image || "").replace(/^\/+/, "")}`;
  }
  return resolveAssetImageUrl(item.gallery_image, "gallerys_images");
}

/**
 * Gallery adapter over the shared AppFeedCard — full-bleed image cover,
 * filename preview, dates in the footer.
 */
export function GalleryCard({ item, isToggling, compact = false, highlighted = false, onEdit, onToggleStatus }: GalleryCardProps) {
  const [imgError, setImgError] = useState(false);
  const isActive = item.gallery_status === "Active";
  const imageUrl = imgError ? null : galleryImageUrl(item);

  useEffect(() => {
    setImgError(false);
  }, [item.gallery_image, item.gallery_url]);

  const updatedStamp = item.updated_at ?? item.created_at;
  const ago = timeAgo(updatedStamp);
  const justUpdated = isWithinHours(item.updated_at, 24);
  const accent = categoryAccent("Gallery");

  return (
    <AppFeedCard
      cover={{ imageUrl, accent }}
      title={`Image #${item.id}`}
      snippet={item.gallery_image || "Untitled image"}
      snippetClamp={2}
      statusActive={isActive}
      statusText={item.gallery_status || "Active"}
      recordId={item.id}
      chipLabel="Gallery"
      chipAccent={accent}
      ageLabel={ago ?? (item.created_at ? formatDateDMY(item.created_at) : null)}
      updatedPill={justUpdated ? `Updated${ago ? ` • ${ago}` : ""}` : null}
      justUpdated={justUpdated}
      metaPrimary={item.created_at ? formatDateDMY(item.created_at) : "—"}
      metaSecondary={
        <span className="text-muted-foreground/70">{ago ? `Updated ${ago}` : "—"}</span>
      }
      compact={compact}
      isToggling={isToggling}
      highlighted={highlighted}
      onEdit={() => onEdit(item)}
      onToggleStatus={() => onToggleStatus(item)}
    />
  );
}

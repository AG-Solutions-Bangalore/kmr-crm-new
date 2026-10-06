import { useEffect, useState } from "react";
import { AppFeedCard } from "@/components/common/AppFeedCard.tsx";
import { formatDateDMY, isWithinHours, timeAgo } from "@/lib/date.ts";
import { resolveGalleryImageUrl } from "@/lib/image.ts";
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

/**
 * Gallery adapter over the shared AppFeedCard — full-bleed image cover,
 * filename preview, dates in the footer. The copy-link button copies the
 * full image file URL (not the page deep link).
 */
export function GalleryCard({ item, isToggling, compact = false, highlighted = false, onEdit, onToggleStatus }: GalleryCardProps) {
  const [imgError, setImgError] = useState(false);
  const isActive = item.gallery_status === "Active";
  const imageUrl = imgError ? null : resolveGalleryImageUrl(item.gallery_image, item.gallery_url);
  // Card copy button: the full image URL only.
  const shareText = imageUrl ?? "";

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
      title={item.gallery_image || `Image #${item.id}`}
      snippetClamp={2}
      statusActive={isActive}
      statusText={item.gallery_status || "Active"}
      recordId={item.id}
      chipLabel="Gallery"
      chipAccent={accent}
      ageLabel={ago ?? (item.created_at ? formatDateDMY(item.created_at) : null)}
      updatedPill={justUpdated ? `Updated${ago ? ` • ${ago}` : ""}` : null}
      justUpdated={justUpdated}
      actionPlacement="title"
      metaPrimary={item.created_at ? formatDateDMY(item.created_at) : null}
      metaSecondary={
        ago ? (
          <span className="text-muted-foreground/70">{`Updated ${ago}`}</span>
        ) : null
      }
      compact={compact}
      isToggling={isToggling}
      highlighted={highlighted}
      showShare={shareText !== ""}
      shareUrl={shareText || null}
      onEdit={() => onEdit(item)}
      onToggleStatus={() => onToggleStatus(item)}
    />
  );
}

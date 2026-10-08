import { AppFeedCard } from "@/components/common/AppFeedCard.tsx";
import { formatDateDMY, isWithinHours, timeAgo } from "@/lib/date.ts";
import { resolveAssetImageUrl, useApiNoImageUrl } from "@/lib/image.ts";
import { categoryAccent } from "@/lib/category-color.ts";
import type { SliderItem } from "../types/slider.types.ts";

interface SliderCardProps {
  slider: SliderItem;
  isToggling: boolean;
  compact?: boolean;
  highlighted?: boolean;
  onEdit: (slider: SliderItem) => void;
  onToggleStatus: (slider: SliderItem) => void;
}

/**
 * Slider adapter over the shared AppFeedCard — banner cover, type chip,
 * target URL preview, and action buttons inline with the title.
 */
export function SliderCard({ slider, isToggling, compact = false, highlighted = false, onEdit, onToggleStatus }: SliderCardProps) {
  const isActive = slider.slider_status === "Active";
  const fallbackUrl = useApiNoImageUrl();
  const imageUrl = resolveAssetImageUrl(slider.slider_image, "slider_images");

  const updatedStamp = slider.updated_at ?? slider.created_at;
  const ago = timeAgo(updatedStamp);
  const justUpdated = isWithinHours(slider.updated_at, 24);
  const accent = categoryAccent(slider.slider_type);

  const title =
    slider.slider_type === "Home"
      ? "Home Banner"
      : slider.categories_name || "Category Banner";

  return (
    <AppFeedCard
      cover={{ imageUrl, fallbackUrl, accent }}
      title={title}
      snippet={slider.slider_url || null}
      snippetClamp={2}
      statusActive={isActive}
      statusText={slider.slider_status || "Active"}
      recordId={slider.id}
      chipLabel={slider.categories_name ? `${slider.slider_type} • ${slider.categories_name}` : slider.slider_type || "Banner"}
      chipAccent={accent}
      ageLabel={ago ?? (slider.created_at ? formatDateDMY(slider.created_at) : null)}
      updatedPill={justUpdated ? `Updated${ago ? ` • ${ago}` : ""}` : null}
      justUpdated={justUpdated}
      actionPlacement="title"
      compact={compact}
      isToggling={isToggling}
      highlighted={highlighted}
      onEdit={() => onEdit(slider)}
      onToggleStatus={() => onToggleStatus(slider)}
    />
  );
}

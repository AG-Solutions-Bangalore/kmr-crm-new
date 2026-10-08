import { AppFeedCard } from "@/components/common/AppFeedCard.tsx";
import { formatDateDMY, isWithinHours, timeAgo } from "@/lib/date.ts";
import { resolveAssetImageUrl, useApiNoImageUrl } from "@/lib/image.ts";
import { categoryAccent } from "@/lib/category-color.ts";
import type { Category } from "../types/category.types.ts";

interface CategoryCardProps {
  category: Category;
  isToggling: boolean;
  compact?: boolean;
  highlighted?: boolean;
  onEdit: (category: Category) => void;
  onToggleStatus: (category: Category) => void;
}

/**
 * Category adapter over the shared AppFeedCard — image cover,
 * Main/Sub chip, dates in the footer.
 * Falls back dynamically to the API no_image placeholder when no custom
 * category image is present.
 */
export function CategoryCard({
  category,
  isToggling,
  compact = false,
  highlighted = false,
  onEdit,
  onToggleStatus,
}: CategoryCardProps) {
  const isActive = category.categories_status === "Active";
  const fallbackUrl = useApiNoImageUrl();
  const directImage = category.categories_image
    ? resolveAssetImageUrl(category.categories_image, "category_images")
    : null;

  const updatedStamp = category.updated_at ?? category.created_at;
  const ago = timeAgo(updatedStamp);
  const justUpdated = isWithinHours(category.updated_at, 24);
  const accent = categoryAccent(category.categories_name);

  return (
    <AppFeedCard
      cover={{
        imageUrl: directImage,
        fallbackUrl,
        imageFit: "contain",
        accent,
      }}
      title={category.categories_name}
      statusActive={isActive}
      statusText={category.categories_status || "Active"}
      recordId={category.id}
      chipAccent={accent}
      ageLabel={
        ago ?? (category.created_at ? formatDateDMY(category.created_at) : null)
      }
      updatedPill={justUpdated ? `Updated${ago ? ` • ${ago}` : ""}` : null}
      justUpdated={justUpdated}
      compact={compact}
      isToggling={isToggling}
      highlighted={highlighted}
      onEdit={() => onEdit(category)}
      onToggleStatus={() => onToggleStatus(category)}
    />
  );
}

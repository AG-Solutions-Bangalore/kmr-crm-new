import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { AppFeedCard } from "@/components/common/AppFeedCard.tsx";
import { formatDateDMY, isWithinHours, timeAgo } from "@/lib/date.ts";
import { resolveAssetImageUrl } from "@/lib/image.ts";
import { categoryAccent } from "@/lib/category-color.ts";
import type { BlogItem } from "../types/blog.types.ts";

interface BlogCardProps {
  blog: BlogItem;
  isToggling: boolean;
  compact?: boolean;
  highlighted?: boolean;
  onEdit: (blog: BlogItem) => void;
  onToggleStatus: (blog: BlogItem) => void;
}

function isOn(value: string | number | null | undefined): boolean {
  return value === 1 || value === "1" || value === "Yes" || value === "yes";
}

/**
 * Blog adapter over the shared AppFeedCard — banner cover, category chip,
 * title + SEO summary with app-like clamping, flags in the footer.
 */
export function BlogCard({ blog, isToggling, compact = false, highlighted = false, onEdit, onToggleStatus }: BlogCardProps) {
  const [imgError, setImgError] = useState(false);
  const isActive = blog.blog_status === "Active";
  const imageUrl = imgError ? null : resolveAssetImageUrl(blog.blog_banner_image, "blog_images");

  useEffect(() => {
    setImgError(false);
  }, [blog.blog_banner_image]);

  const updatedStamp =
    blog.updated_at ?? blog.blog_updated_date ?? blog.created_at ?? blog.blog_created_date;
  const ago = timeAgo(updatedStamp);
  const justUpdated = isWithinHours(blog.updated_at ?? blog.blog_updated_date, 24);
  const accent = categoryAccent(blog.categories);
  const featured = isOn(blog.blog_featured);
  const front = isOn(blog.blog_front);

  return (
    <AppFeedCard
      cover={{ imageUrl, accent }}
      title={blog.blog_title}
      snippet={blog.blog_short_description || blog.blog_description}
      snippetClamp={3}
      statusActive={isActive}
      statusText={blog.blog_status || "Active"}
      recordId={blog.id}
      chipLabel={blog.categories || "Blog"}
      chipAccent={accent}
      ageLabel={ago ?? formatDateDMY(blog.blog_created_date ?? blog.created_at)}
      updatedPill={justUpdated ? `Updated${ago ? ` • ${ago}` : ""}` : null}
      justUpdated={justUpdated}
      metaPrimary={formatDateDMY(blog.blog_created_date ?? blog.created_at)}
      metaSecondary={
        featured || front ? (
          <span className="inline-flex items-center gap-1.5">
            {featured && (
              <span className="inline-flex items-center gap-0.5 font-semibold text-amber-600 dark:text-amber-400">
                <Star className="size-3" /> Featured
              </span>
            )}
            {front && <span className="text-muted-foreground/70">• Front page</span>}
          </span>
        ) : (
          <span className="text-muted-foreground/70">
            {blog.blog_slug ? `/${blog.blog_slug}` : (ago ? `Updated ${ago}` : "—")}
          </span>
        )
      }
      compact={compact}
      isToggling={isToggling}
      highlighted={highlighted}
      onEdit={() => onEdit(blog)}
      onToggleStatus={() => onToggleStatus(blog)}
    />
  );
}

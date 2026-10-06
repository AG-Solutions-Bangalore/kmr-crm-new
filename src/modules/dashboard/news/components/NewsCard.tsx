import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { AppFeedCard } from "@/components/common/AppFeedCard.tsx";
import { formatDateDMY, isWithinHours, timeAgo } from "@/lib/date.ts";
import { resolveAssetImageUrl } from "@/lib/image.ts";
import { categoryAccent } from "@/lib/category-color.ts";
import type { NewsItem } from "../types/news.types.ts";

interface NewsCardProps {
  article: NewsItem;
  isToggling: boolean;
  compact?: boolean;
  highlighted?: boolean;
  onEdit: (article: NewsItem) => void;
  onToggleStatus: (article: NewsItem) => void;
}

/**
 * News adapter over the shared AppFeedCard — maps the news API shape
 * onto the common feed design. No visual logic lives here.
 */
export function NewsCard({ article, isToggling, compact = false, highlighted = false, onEdit, onToggleStatus }: NewsCardProps) {
  const [imgError, setImgError] = useState(false);
  const isActive = article.news_status === "Active";
  const imageUrl = imgError ? null : resolveAssetImageUrl(article.news_image, "news_images");

  // Retry the cover if the article's image changes (e.g. after an edit).
  useEffect(() => {
    setImgError(false);
  }, [article.news_image]);

  const updatedStamp = article.updated_at ?? article.created_at ?? article.news_created_date;
  const ago = timeAgo(updatedStamp);
  const justUpdated = isWithinHours(article.updated_at, 24);
  const accent = categoryAccent(article.categories_name);

  return (
    <AppFeedCard
      cover={{ imageUrl, accent }}
      title={article.news_heading}
      snippet={article.news_details}
      snippetClamp={3}
      statusActive={isActive}
      statusText={article.news_status || "Active"}
      recordId={article.id}
      chipLabel={article.categories_name || "Uncategorized"}
      chipAccent={accent}
      ageLabel={ago ?? formatDateDMY(article.news_created_date)}
      updatedPill={justUpdated ? `Updated${ago ? ` • ${ago}` : ""}` : null}
      justUpdated={justUpdated}
      metaPrimary={`${formatDateDMY(article.news_created_date)}${article.news_created_time ? ` • ${article.news_created_time}` : ""}`}
      metaSecondary={
        article.news_other_image ? (
          <span title={article.news_other_image} className="inline-flex items-center gap-1">
            <FileText className="size-3 shrink-0 text-primary" />
            <span className="max-w-[130px] truncate font-mono">{article.news_other_image}</span>
            <span className="shrink-0 rounded bg-primary/10 px-1 text-[9px] font-bold uppercase text-primary">
              PDF
            </span>
          </span>
        ) : (
          <span className="text-muted-foreground/70">{ago ? `Updated ${ago}` : "No attachment"}</span>
        )
      }
      compact={compact}
      isToggling={isToggling}
      highlighted={highlighted}
      onEdit={() => onEdit(article)}
      onToggleStatus={() => onToggleStatus(article)}
    />
  );
}

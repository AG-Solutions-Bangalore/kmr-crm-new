import { useEffect, useRef, useState, type ReactNode } from "react";
import { Copy, Edit2, ImageOff, Power, type LucideIcon } from "lucide-react";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { cn } from "@/lib/utils.ts";

export interface FeedCover {
  /** Photo URL. When absent, a monogram tile (icon/initial) renders instead. */
  imageUrl?: string | null;
  noImageLabel?: string;
  monogramText?: string;
  monogramIcon?: LucideIcon;
  /** Accent used for the monogram glow + chip dot. */
  accent?: string;
}

export interface AppFeedCardProps {
  cover: FeedCover;
  title: string;
  /** Muted preview text under the title (clamped like the mobile app). */
  snippet?: string | null;
  snippetClamp?: 2 | 3;
  /** Big value row between title and snippet (e.g. ₹ rate). */
  highlight?: string | null;
  statusActive: boolean;
  /** Defaults to Active / Inactive. */
  statusText?: string;
  recordId: number | string;
  /** Bottom-left glass chip (e.g. category). */
  chipLabel?: string;
  chipAccent?: string;
  /** Bottom-right glass chip (e.g. "2d ago" or date). */
  ageLabel?: string | null;
  /** Amber pill replacing ageLabel when freshly updated (e.g. "Updated • 3h ago"). */
  updatedPill?: string | null;
  justUpdated?: boolean;
  /** Footer line 1 (e.g. date). */
  metaPrimary?: string | null;
  /** Footer line 2 (e.g. attachment or "Updated x ago"). */
  metaSecondary?: ReactNode;
  compact?: boolean;
  isToggling?: boolean;
  showEdit?: boolean;
  showToggle?: boolean;
  /** Copy button. Only gallery shows it (copies image path + name). Default false. */
  showShare?: boolean;
  /**
   * Exact URL the copy-link button copies. When omitted, the card's deep
   * link (`<page>#feed-<id>`) is copied instead. Gallery passes the full
   * image file URL here.
   */
  shareUrl?: string | null;
  /** DOM anchor id for deep links. Defaults to `feed-<recordId>`. */
  domId?: string;
  /** Emphasizes the card + scrolls it into view (deep-link landing). */
  highlighted?: boolean;
  /**
   * Action buttons placement: "title" (default, inline on the right side of the card title)
   * or "footer" (bottom-right of card).
   */
  actionPlacement?: "title" | "footer";
  onEdit?: () => void;
  onToggleStatus?: () => void;
}

/**
 * THE common feed card — one design reused by every list
 * (News, Spot, Rates, Live, …): cinematic 16:9 cover with status pill,
 * chip row, app-like clamped title/snippet, meta footer, 1-click actions.
 *
 * Modules with photos pass `cover.imageUrl`; imageless modules pass a
 * monogram (icon/initial + accent) and get the identical chrome.
 * Truncation mirrors the mobile app so bad content is caught pre-publish.
 */
export function AppFeedCard({
  cover,
  title,
  snippet,
  snippetClamp = 3,
  highlight,
  statusActive,
  statusText,
  recordId,
  chipLabel,
  chipAccent,
  ageLabel,
  updatedPill,
  justUpdated = false,
  metaPrimary,
  metaSecondary,
  compact = false,
  isToggling = false,
  showEdit = true,
  showToggle = true,
  showShare = false,
  shareUrl,
  domId,
  highlighted = false,
  actionPlacement = "title",
  onEdit,
  onToggleStatus,
}: AppFeedCardProps) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = imgError ? null : (cover.imageUrl ?? null);
  const MonogramIcon = cover.monogramIcon;
  const canEdit = showEdit && Boolean(onEdit);
  const canToggle = showToggle && Boolean(onToggleStatus);
  const anchorId = domId ?? `feed-${recordId}`;
  const cardRef = useRef<HTMLDivElement>(null);

  // Deep-link landing: jump to + emphasize the linked card.
  useEffect(() => {
    if (highlighted) {
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlighted]);

  const handleShare = async () => {
    const directUrl = (shareUrl || "").trim();
    const url =
      directUrl ||
      `${window.location.origin}${window.location.pathname}${window.location.search}#${anchorId}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    toast.success(
      directUrl
        ? "Image URL copied."
        : "Link copied — reopening it jumps straight to this item.",
    );
  };

  const coverBody = (
    <>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          aria-hidden="true"
          loading="lazy"
          onError={() => setImgError(true)}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />
      ) : (
        <span
          className="flex size-full flex-col items-center justify-center gap-1 text-muted-foreground"
          style={
            cover.accent
              ? {
                  background: `radial-gradient(circle at 30% 20%, ${cover.accent}2e, transparent 65%)`,
                }
              : undefined
          }
        >
          {MonogramIcon && (
            <MonogramIcon
              className={compact ? "size-7" : "size-9"}
              style={cover.accent ? { color: cover.accent } : undefined}
            />
          )}
          {cover.monogramText && (
            <span className="text-lg font-extrabold tracking-tight text-foreground/70">
              {cover.monogramText}
            </span>
          )}
          {!MonogramIcon && !cover.monogramText && (
            <>
              <ImageOff className="size-6 opacity-40" />
              <span className="px-4 text-center text-[11px]">
                {cover.noImageLabel ?? "No cover image — app shows placeholder"}
              </span>
            </>
          )}
        </span>
      )}
      {/* Readability gradients for overlay chips. */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/55 to-transparent" />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/65 to-transparent" />

      {/* Top row: status + id. */}
      <span className="absolute inset-x-2.5 top-2.5 flex items-center justify-between">
        <Badge
          variant="outline"
          className={cn(
            "border-0 backdrop-blur-md",
            statusActive
              ? "bg-emerald-500/90 text-white"
              : "bg-black/55 text-white/85",
          )}
        >
          <span
            className={cn(
              "mr-1.5 inline-block size-1.5 rounded-full",
              statusActive ? "bg-white" : "bg-white/60",
            )}
          />
          {statusText ?? (statusActive ? "Active" : "Inactive")}
        </Badge>
        <Badge
          variant="outline"
          className="border-0 bg-black/55 font-mono text-white/85 backdrop-blur-md"
        >
          #{recordId}
        </Badge>
      </span>

      {/* Bottom row: chip + freshness. */}
      {(chipLabel || ageLabel || updatedPill) && (
        <span className="absolute inset-x-2.5 bottom-2.5 flex items-center justify-between gap-2">
          <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-black/55 py-1 pl-2 pr-2.5 backdrop-blur-md">
            {chipAccent && (
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: chipAccent }}
              />
            )}
            <span className="truncate text-[11px] font-semibold text-white">
              {chipLabel}
            </span>
          </span>
          {updatedPill ? (
            <span className="shrink-0 rounded-full bg-amber-400 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-black">
              {updatedPill}
            </span>
          ) : ageLabel ? (
            <span className="shrink-0 rounded-full bg-black/55 px-2 py-1 text-[10px] font-medium text-white/85 backdrop-blur-md">
              {ageLabel}
            </span>
          ) : null}
        </span>
      )}

      {/* Hover quick actions — edit/toggle without scrolling to the footer. */}
      {(canEdit || canToggle) && (
        <span className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/35 group-hover:opacity-100 group-focus-within:opacity-100">
          {canEdit && (
            <span
              role="button"
              tabIndex={0}
              aria-label={`Quick edit: ${title}`}
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit?.();
                }
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-xs font-bold text-black shadow-lg transition-transform hover:scale-105"
            >
              <Edit2 className="size-3.5" />
              Edit
            </span>
          )}
          {canToggle && (
            <span
              role="button"
              tabIndex={0}
              aria-label={statusActive ? "Hide item" : "Publish item"}
              onClick={(e) => {
                e.stopPropagation();
                onToggleStatus?.();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleStatus?.();
                }
              }}
              className={cn(
                "inline-flex size-9 items-center justify-center rounded-full shadow-lg backdrop-blur-md transition-transform hover:scale-105",
                statusActive
                  ? "bg-emerald-500/90 text-white"
                  : "bg-white/90 text-black",
                isToggling && "animate-pulse",
              )}
            >
              <Power className="size-4" />
            </span>
          )}
        </span>
      )}
    </>
  );

  const hasActions = canEdit || canToggle || showShare;
  const hasMeta = Boolean(metaPrimary || metaSecondary);
  const showFooter =
    actionPlacement === "title" ? hasMeta : (hasMeta || hasActions);

  const renderActions = () => {
    if (!hasActions) return null;
    return (
      <div className="flex shrink-0 items-center gap-1.5">
        {showShare && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              void handleShare();
            }}
            title={shareUrl ? "Copy image URL" : "Copy link to this item"}
            aria-label={
              shareUrl ? "Copy image URL" : "Copy link to this item"
            }
            className="size-8 shrink-0 p-0"
          >
            <Copy className="size-4 text-muted-foreground" />
          </Button>
        )}
        {canEdit && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
            title="Edit"
            className={cn(
              "gap-1.5 font-semibold",
              compact ? "h-7 px-2.5 text-[11px]" : "h-8 px-3 text-xs",
            )}
          >
            <Edit2 className="size-3.5" />
            Edit
          </Button>
        )}
        {canToggle && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isToggling}
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus?.();
            }}
            title={statusActive ? "Hide" : "Publish"}
            aria-label={statusActive ? "Hide" : "Publish"}
            className="size-8 shrink-0 p-0"
          >
            <Power
              className={cn(
                "size-4",
                statusActive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground",
                isToggling && "animate-pulse",
              )}
            />
          </Button>
        )}
      </div>
    );
  };

  return (
    <Card
      ref={cardRef}
      id={anchorId}
      className={cn(
        "group flex scroll-mt-32 flex-col overflow-hidden rounded-2xl ring-1 ring-border/70 transition-all duration-200",
        "shadow-[0_1px_2px_rgb(0_0_0/0.05)] hover:-translate-y-1 hover:shadow-[0_16px_32px_-12px_rgb(0_0_0/0.25)] hover:ring-primary/30",
        justUpdated && "ring-amber-500/40 hover:ring-amber-500/60",
        highlighted && "ring-2 ring-primary hover:ring-primary",
      )}
    >
      {/* Cover — clickable only when an edit action exists. */}
      {canEdit ? (
        <div
          role="button"
          tabIndex={0}
          aria-label={`Edit: ${title}`}
          onClick={() => onEdit?.()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onEdit?.();
            }
          }}
          className={cn(
            "relative block w-full cursor-pointer overflow-hidden bg-gradient-to-br from-primary/15 via-muted to-muted",
            compact ? "aspect-[16/7]" : "aspect-[16/9]",
          )}
        >
          {coverBody}
        </div>
      ) : (
        <div
          className={cn(
            "relative block w-full overflow-hidden bg-gradient-to-br from-primary/15 via-muted to-muted",
            compact ? "aspect-[16/7]" : "aspect-[16/9]",
          )}
        >
          {coverBody}
        </div>
      )}

      <CardContent
        className={cn(
          "flex flex-1 flex-col",
          compact ? "gap-1.5 p-3" : "gap-2 p-4",
        )}
      >
        {actionPlacement === "title" ? (
          <div className="flex items-center justify-between gap-2">
            {canEdit ? (
              <button
                type="button"
                onClick={() => onEdit?.()}
                title={title}
                className="min-w-0 flex-1 cursor-pointer text-left"
              >
                <CardTitle title={title} compact={compact} fixedHeight={false} />
              </button>
            ) : (
              <div className="min-w-0 flex-1">
                <CardTitle title={title} compact={compact} fixedHeight={false} />
              </div>
            )}
            {renderActions()}
          </div>
        ) : canEdit ? (
          <button
            type="button"
            onClick={() => onEdit?.()}
            title={title}
            className="cursor-pointer text-left"
          >
            <CardTitle title={title} compact={compact} />
          </button>
        ) : (
          <CardTitle title={title} compact={compact} />
        )}

        {highlight && (
          <p
            className={cn(
              "font-extrabold tracking-tight text-foreground",
              compact ? "text-lg" : "text-[22px]",
            )}
          >
            {highlight}
          </p>
        )}

        {snippet ? (
          <p
            title={snippet}
            className={cn(
              "leading-relaxed text-muted-foreground",
              compact ? "text-xs" : "text-[13px]",
              snippetClamp === 2 ? "line-clamp-2" : "line-clamp-3",
            )}
          >
            {snippet}
          </p>
        ) : null}

        {/* Footer: meta on the left, actions on the right (if not placed in title). */}
        {showFooter && (
          <div
            className={cn(
              "mt-auto flex items-end justify-between gap-2 border-t border-border/60",
              compact ? "pt-2" : "pt-3",
            )}
          >
            <div className="flex min-w-0 flex-col gap-1 text-[11px] text-muted-foreground">
              {metaPrimary && <span className="truncate">{metaPrimary}</span>}
              {metaSecondary}
            </div>
            {actionPlacement !== "title" && renderActions()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CardTitle({
  title,
  compact,
  fixedHeight = true,
}: {
  title: string;
  compact: boolean;
  fixedHeight?: boolean;
}) {
  return (
    <h3
      className={cn(
        "line-clamp-2 font-bold leading-snug tracking-tight text-foreground transition-colors hover:text-primary",
        fixedHeight && (compact ? "min-h-[2.4em]" : "min-h-[2.6em]"),
        compact ? "text-sm" : "text-[15px]",
      )}
    >
      {title}
    </h3>
  );
}

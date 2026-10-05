import { AlertCircle, Inbox, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { cn } from "@/lib/utils.ts";

/**
 * Shared loading / empty / error states for Card View grids.
 * One implementation reused by News (pilot) and later Rates / Live / Spot,
 * so the four modules stay visually consistent.
 */

/** Pulsing skeleton cards shown while the list query is loading. */
export function CardGridSkeleton({
  count = 6,
  layout = "vertical",
  className,
}: {
  count?: number;
  /** "horizontal" matches feed cards (thumb left, text right). */
  layout?: "vertical" | "horizontal";
  className?: string;
}) {
  const grid =
    layout === "horizontal"
      ? "grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3"
      : "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3";
  return (
    <div aria-busy="true" aria-label="Loading content" className={cn(grid, className)}>
      {Array.from({ length: count }).map((_, i) =>
        layout === "horizontal" ? (
          <Card key={i} className="flex gap-3 border-l-4 border-l-muted p-3 shadow-sm">
            <div className="size-24 shrink-0 animate-pulse rounded-xl bg-muted" />
            <div className="flex min-w-0 flex-1 flex-col gap-2 py-0.5">
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
              <div className="mt-auto flex items-center justify-between">
                <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                <div className="h-7 w-16 animate-pulse rounded-md bg-muted" />
              </div>
            </div>
          </Card>
        ) : (
          <Card key={i} className="overflow-hidden shadow-sm">
            <div className="aspect-video animate-pulse bg-muted" />
            <CardContent className="flex flex-col gap-2 p-4">
              <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
              <div className="mt-2 flex items-center justify-between">
                <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
                <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
              </div>
            </CardContent>
          </Card>
        ),
      )}
    </div>
  );
}

/** Empty state: no records, or search with zero matches. */
export function CardEmptyState({
  icon: Icon = Inbox,
  title,
  hint,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  hint: string;
  className?: string;
}) {
  return (
    <Card className={cn("shadow-sm", className)}>
      <CardContent className="flex flex-col items-center justify-center gap-2 px-4 py-14 text-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="size-5" />
        </span>
        <p className="font-medium text-foreground">{title}</p>
        <p className="max-w-sm text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

/** Error state with retry — the grid never leaves the admin stranded. */
export function CardErrorState({
  title = "Could not load content",
  message,
  onRetry,
  className,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <Card className={cn("border-destructive/30 bg-destructive/5 shadow-sm", className)}>
      <CardContent className="flex flex-col items-center justify-center gap-2 px-4 py-14 text-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="size-5" />
        </span>
        <p className="font-medium text-foreground">{title}</p>
        <p className="max-w-md text-xs text-muted-foreground">{message}</p>
        {onRetry && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-2 border-destructive/40 hover:bg-destructive/10"
          >
            Retry
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

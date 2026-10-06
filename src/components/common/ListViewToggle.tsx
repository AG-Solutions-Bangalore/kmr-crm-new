import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";
import type { ListViewMode } from "@/lib/view-mode.ts";

interface ListViewToggleProps {
  mode: ListViewMode;
  onChange: (mode: ListViewMode) => void;
  listLabel?: string;
  cardLabel?: string;
}

/**
 * Shared List ⇄ Card view switcher (pilot: News; later: Rates / Live / Spot).
 * Controlled — the page owns persistence (localStorage) so the
 * preference survives reloads per module via `storageKey` at call site.
 */
export function ListViewToggle({
  mode,
  onChange,
  listLabel = "List",
  cardLabel = "Card",
}: ListViewToggleProps) {
  return (
    <div
      role="group"
      aria-label="Switch list or card view"
      className="inline-flex items-center gap-0.5 rounded-lg border border-border/80 bg-muted/40 p-0.5"
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onChange("list")}
        aria-pressed={mode === "list"}
        title={`${listLabel} view`}
        className={cn(
          "h-7 gap-1.5 px-2.5 text-xs font-medium",
          mode === "list"
            ? "bg-card text-foreground shadow-sm hover:bg-card"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <List className="size-3.5" />
        <span className="hidden sm:inline">{listLabel}</span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onChange("card")}
        aria-pressed={mode === "card"}
        title={`${cardLabel} view (like the mobile app)`}
        className={cn(
          "h-7 gap-1.5 px-2.5 text-xs font-medium",
          mode === "card"
            ? "bg-card text-foreground shadow-sm hover:bg-card"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <LayoutGrid className="size-3.5" />
        <span className="hidden sm:inline">{cardLabel}</span>
      </Button>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/utils.ts";

export interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  clearable?: boolean;
  className?: string;
  direction?: "up" | "down" | "auto";
  /** Callback triggered when user chooses to create an item with the typed query. */
  onCreateNew?: (query: string) => void;
  /** Custom label for the create option. Defaults to `Create "${query}"`. */
  createLabel?: (query: string) => string;
}

function getScrollParents(node: HTMLElement | null): HTMLElement[] {
  const parents: HTMLElement[] = [];
  let parent = node?.parentElement ?? null;
  while (parent && parent !== document.body && parent !== document.documentElement) {
    const style = window.getComputedStyle(parent);
    const overflowY = style.overflowY;
    if (overflowY === "auto" || overflowY === "scroll" || overflowY === "hidden") {
      parents.push(parent);
    }
    parent = parent.parentElement;
  }
  return parents;
}

/**
 * Searchable dropdown — in-tree relative positioning.
 * Supports configurable open direction ("up" | "down" | "auto").
 */
export function SearchableSelect({
  id,
  value,
  onChange,
  options,
  placeholder = "Select...",
  disabled = false,
  required = false,
  clearable = false,
  className,
  direction = "auto",
  onCreateNew,
  createLabel,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [openUp, setOpenUp] = useState(direction === "up");

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const exactMatchExists = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return options.some((o) => o.label.trim().toLowerCase() === q);
  }, [options, query]);

  const showCreateOption = Boolean(onCreateNew && query.trim() && !exactMatchExists);
  const totalNavItems = filtered.length + (showCreateOption ? 1 : 0);

  // Keep highlighted index within bounds
  useEffect(() => {
    setHighlightedIndex(0);
  }, [query, open]);

  // Keep the highlighted item visible inside the list only
  useEffect(() => {
    if (!open) return;
    const list = listRef.current;
    if (!list) return;
    const activeEl = list.children[highlightedIndex] as HTMLElement | undefined;
    if (!activeEl) return;
    const top = activeEl.offsetTop;
    const bottom = top + activeEl.offsetHeight;
    if (top < list.scrollTop) list.scrollTop = top;
    else if (bottom > list.scrollTop + list.clientHeight) {
      list.scrollTop = bottom - list.clientHeight;
    }
  }, [highlightedIndex, open]);

  // Dynamically check whether to open upward or downward based on viewport and scroll container space
  useEffect(() => {
    if (!open) return;

    const checkDirection = () => {
      if (direction === "up") {
        setOpenUp(true);
        return;
      }
      if (direction === "down") {
        setOpenUp(false);
        return;
      }
      const el = triggerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      // Check all scroll parent containers (modal / card / rows list)
      const scrollParents = getScrollParents(el);
      let minSpaceAbove = spaceAbove;
      for (const p of scrollParents) {
        const pRect = p.getBoundingClientRect();
        const aboveInP = rect.top - pRect.top;
        if (aboveInP < minSpaceAbove) {
          minSpaceAbove = aboveInP;
        }
      }

      // If room above in any scroll container is less than 240px, NEVER flip up
      // because the search input and top items would be cut off!
      if (minSpaceAbove < 240) {
        setOpenUp(false);
        return;
      }

      // Flip up only when room below is tight (< 220px) and there's ample room above
      setOpenUp(spaceBelow < 220 && spaceAbove > spaceBelow);
    };

    checkDirection();
    window.addEventListener("resize", checkDirection);
    window.addEventListener("scroll", checkDirection, true);

    const focusTimer = setTimeout(() => {
      searchRef.current?.focus();
    }, 10);

    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current && !rootRef.current.contains(t)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onDown);

    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener("resize", checkDirection);
      window.removeEventListener("scroll", checkDirection, true);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setQuery("");
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (totalNavItems > 0) {
        setHighlightedIndex((i) => (i + 1) % totalNavItems);
      }
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (totalNavItems > 0) {
        setHighlightedIndex((i) => (i - 1 + totalNavItems) % totalNavItems);
      }
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex < filtered.length) {
        const item = filtered[highlightedIndex];
        if (item) {
          onChange(item.value);
          setOpen(false);
          setQuery("");
        }
      } else if (showCreateOption && onCreateNew) {
        const q = query.trim();
        setOpen(false);
        setQuery("");
        onCreateNew(q);
      }
    }
  };

  return (
    <div ref={rootRef} className="relative w-full" onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          !selected && "text-muted-foreground",
          className,
        )}
      >
        <span className="truncate" title={selected?.label}>{selected ? selected.label : placeholder}</span>
        <div className="flex items-center gap-1 shrink-0">
          {clearable && selected && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  onChange("");
                }
              }}
              title="Clear selection"
              className="text-muted-foreground/60 hover:text-foreground transition-colors p-0.5 rounded cursor-pointer"
            >
              <X className="size-3.5" />
            </span>
          )}
          <ChevronDown className="size-4 opacity-50" />
        </div>
      </button>

      {required && !value ? (
        <input required className="sr-only" value="" onChange={() => {}} tabIndex={-1} />
      ) : null}

      {open && (
        <div
          className={cn(
            "absolute z-50 w-full min-w-[200px] rounded-md border border-border bg-popover text-popover-foreground shadow-xl animate-in fade-in-0 zoom-in-95 duration-100",
            openUp ? "bottom-full mb-1" : "top-full mt-1",
          )}
        >
          <div className="flex items-center gap-2 border-b border-border/60 px-2 shrink-0 bg-popover">
            <Search className="size-3.5 shrink-0 text-muted-foreground" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to search..."
              className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <ul
            ref={listRef}
            className={cn(
              "overflow-x-hidden overflow-y-auto overscroll-contain p-1 touch-pan-y",
              openUp ? "max-h-48" : "max-h-60",
            )}
          >
            {filtered.length === 0 && !showCreateOption ? (
              <li className="px-2 py-4 text-center text-xs text-muted-foreground">
                No matches found
              </li>
            ) : (
              filtered.map((o, idx) => {
                const isHighlighted = idx === highlightedIndex;
                const isSelected = o.value === value;
                return (
                  <li key={o.value || `opt-${idx}`}>
                    <button
                      type="button"
                      title={o.label}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      onClick={() => {
                        onChange(o.value);
                        setOpen(false);
                        setQuery("");
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors cursor-pointer",
                        isHighlighted && "bg-accent text-accent-foreground",
                        isSelected && !isHighlighted && "bg-accent/50",
                      )}
                    >
                      <span className="min-w-0 flex-1 truncate">{o.label}</span>
                      {isSelected && <Check className="size-3.5 shrink-0 text-primary" />}
                    </button>
                  </li>
                );
              })
            )}

            {showCreateOption && (
              <li key="__create_new__" className="border-t border-border/50 pt-1 mt-1">
                <button
                  type="button"
                  onMouseEnter={() => setHighlightedIndex(filtered.length)}
                  onClick={() => {
                    const q = query.trim();
                    setOpen(false);
                    setQuery("");
                    onCreateNew?.(q);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm font-medium text-primary transition-colors cursor-pointer",
                    highlightedIndex === filtered.length
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-primary/5",
                  )}
                >
                  <Plus className="size-4 shrink-0" />
                  <span className="min-w-0 truncate">
                    {createLabel ? createLabel(query.trim()) : `Create "${query.trim()}"`}
                  </span>
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

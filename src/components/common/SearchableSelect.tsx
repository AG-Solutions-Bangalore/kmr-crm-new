import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
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
}

/**
 * Searchable dropdown — type to filter long option lists
 * (e.g. categories). Closes on outside click / Escape.
 */
export function SearchableSelect({
  id,
  value,
  onChange,
  options,
  placeholder = "Select...",
  disabled = false,
  required = false,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open ]);

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          !selected && "text-muted-foreground",
        )}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <ChevronDown className="size-4 shrink-0 opacity-50" />
      </button>
      {required && !value ? (
        <input required className="sr-only" value="" onChange={() => {}} tabIndex={-1} />
      ) : null}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover text-popover-foreground shadow-md">
          <div className="flex items-center gap-2 border-b border-border/60 px-2">
            <Search className="size-3.5 shrink-0 text-muted-foreground" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to search..."
              className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <ul className="max-h-56 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <li className="px-2 py-4 text-center text-xs text-muted-foreground">
                No matches found
              </li>
            ) : (
              filtered.map((o) => (
                <li key={o.value || "(none)"}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(o.value);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      o.value === value && "bg-accent/60",
                    )}
                  >
                    <span className="flex-1 truncate">{o.label}</span>
                    {o.value === value && <Check className="size-3.5 shrink-0" />}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

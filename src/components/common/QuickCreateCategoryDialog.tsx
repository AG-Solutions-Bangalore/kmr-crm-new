import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Plus, RotateCcw, Settings2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { getApiErrorMessage } from "@/lib/axios.ts";
import { extractCreatedId } from "@/lib/created-id.ts";
import { PATHS } from "@/constants/paths.ts";
import { SearchableSelect } from "./SearchableSelect.tsx";
import { fetchCategories } from "@/modules/dashboard/category/api/category.api.ts";
import {
  useActiveCategories,
  useCategories,
  useCreateCategory,
} from "@/modules/dashboard/category/hook/useCategory.ts";

interface QuickCreateCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-filled name from search or caller. */
  initialName?: string;
  /** Pre-selected parent for the new category. Defaults to root ("0"). */
  defaultParentId?: string;
  /** Called with the new category id so the caller can auto-select it. */
  onCreated: (id: string) => void;
}

function slugifyName(val: string): string {
  return val
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Create the missing category WITHOUT leaving the current form.
 * Kills the old dead-end: close form → open Categories → create →
 * come back → re-fill everything. The new id is handed back and
 * auto-selected; drafts are never lost.
 */
export function QuickCreateCategoryDialog({
  open,
  onOpenChange,
  initialName = "",
  defaultParentId = "0",
  onCreated,
}: QuickCreateCategoryDialogProps) {
  const createMutation = useCreateCategory();
  const { data: activeCategories = [] } = useActiveCategories();
  const { data: allCategories = [] } = useCategories();
  const categories = activeCategories.length > 0 ? activeCategories : allCategories;

  const [name, setName] = useState(initialName);
  const [slug, setSlug] = useState(initialName ? slugifyName(initialName) : "");
  const [slugTouched, setSlugTouched] = useState(false);
  const [parentId, setParentId] = useState(defaultParentId);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Sync initial state when dialog opens
  useEffect(() => {
    if (open) {
      const trimmed = initialName.trim();
      setName(trimmed);
      setSlug(trimmed ? slugifyName(trimmed) : "");
      setSlugTouched(false);
      setParentId(defaultParentId);
      setErrorMessage(null);
      setTimeout(() => {
        if (nameInputRef.current) {
          nameInputRef.current.focus();
          if (trimmed) nameInputRef.current.select();
        }
      }, 50);
    }
  }, [open, initialName, defaultParentId]);

  const reset = () => {
    setName("");
    setSlug("");
    setSlugTouched(false);
    setParentId(defaultParentId);
    setErrorMessage(null);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slugTouched) setSlug(slugifyName(val));
  };

  const handleSlugReset = () => {
    setSlug(slugifyName(name));
    setSlugTouched(false);
  };

  const resolveNewId = async (res: unknown, finalSlug: string, finalName: string): Promise<string | null> => {
    const direct = extractCreatedId(res);
    if (direct) return direct;
    // Backend didn't echo the id — find it by the unique slug, then name.
    try {
      const items = await fetchCategories();
      const bySlug = items.find(
        (c) => (c.categories_slug || "").toLowerCase() === finalSlug.toLowerCase(),
      );
      if (bySlug) return String(bySlug.id);
      const byName = items.find(
        (c) => (c.categories_name || "").trim().toLowerCase() === finalName.toLowerCase(),
      );
      if (byName) return String(byName.id);
    } catch {
      // fall through to null
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!name.trim()) {
      setErrorMessage("Category name is required.");
      return;
    }
    const finalSlug = slug.trim() || slugifyName(name);
    setSaving(true);
    try {
      const res = await createMutation.mutateAsync({
        categories_name: name.trim(),
        categories_slug: finalSlug,
        parent_id: parentId || "0",
        categories_sort_order: "1",
        categories_status: "Active",
      });
      const id = await resolveNewId(res, finalSlug, name.trim());
      reset();
      onOpenChange(false);
      if (id) onCreated(id);
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, "Failed to create category."));
    } finally {
      setSaving(false);
    }
  };

  const parentOptions = useMemo(() => {
    return [
      { value: "0", label: "Root (No Parent)" },
      ...categories.map((c) => {
        const isRoot = !c.parent_id || c.parent_id === "0" || c.parent_id === 0;
        return {
          value: String(c.id),
          label: isRoot
            ? `${c.categories_name} (ID: ${c.id})`
            : `  ↳ ${c.categories_name} (ID: ${c.id})`,
        };
      }),
    ];
  }, [categories]);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
              e.preventDefault();
              void handleSubmit(e);
            }
          }}
          className="flex flex-col gap-4"
        >
          <DialogHeader>
            <div className="flex items-center justify-between pr-6">
              <DialogTitle className="flex items-center gap-2 text-base">
                <Plus className="size-4 text-primary" />
                New Category
              </DialogTitle>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                Quick Add
              </span>
            </div>
            <DialogDescription className="text-xs">
              Create it here — it will be auto-selected instantly. Your current form stays untouched.
            </DialogDescription>
          </DialogHeader>

          {errorMessage && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              {errorMessage}
            </div>
          )}

          <div className="grid gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="qc-name">
                Category Name <span className="text-destructive">*</span>
              </Label>
              <Input
                ref={nameInputRef}
                id="qc-name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Mustard Oil"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="qc-slug">Slug</Label>
                {slugTouched && (
                  <button
                    type="button"
                    onClick={handleSlugReset}
                    className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
                    title="Reset slug to auto-match category name"
                  >
                    <RotateCcw className="size-3" />
                    <span>Auto-sync</span>
                  </button>
                )}
              </div>
              <Input
                id="qc-slug"
                value={slug}
                onChange={(e) => {
                  const val = e.target.value;
                  setSlug(val);
                  setSlugTouched(Boolean(val.trim()));
                }}
                placeholder="auto-generated"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="qc-parent">Parent</Label>
              <SearchableSelect
                id="qc-parent"
                value={parentId}
                onChange={setParentId}
                options={parentOptions}
                placeholder="Select parent"
              />
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 pt-2 sm:flex-col">
            <div className="flex w-full items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Link
                  to={PATHS.category}
                  tabIndex={-1}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary hover:underline"
                >
                  <Settings2 className="size-3" />
                  Full manager
                </Link>
                <span className="hidden text-[11px] text-muted-foreground/70 sm:inline">
                  <kbd className="rounded border border-border/80 bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                    Ctrl+Enter
                  </kbd>{" "}
                  to save
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={saving || createMutation.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving || createMutation.isPending}>
                  {saving || createMutation.isPending ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" /> Creating...
                    </>
                  ) : (
                    "Create & Select"
                  )}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ImagePlus, Loader2, Plus, Settings2, X } from "lucide-react";
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
import {
  getParentCategories,
  mergeCategories,
} from "@/lib/category-tree.ts";
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
  /** Pre-selected tab: "category" or "sub". */
  initialTab?: "category" | "sub";
  /** Called with the new category id so the caller can auto-select it. */
  onCreated: (id: string) => void;
}

type QuickTab = "category" | "sub";

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
  initialTab,
  onCreated,
}: QuickCreateCategoryDialogProps) {
  const createMutation = useCreateCategory();
  const { data: activeCategories = [] } = useActiveCategories();
  const { data: allCategories = [] } = useCategories();
  const categories = mergeCategories(activeCategories, allCategories);
  const parentCategories = getParentCategories(categories);

  const defaultTab: QuickTab =
    initialTab ??
    (defaultParentId && defaultParentId !== "0" ? "sub" : "category");
  const [tab, setTab] = useState<QuickTab>(defaultTab);

  const [name, setName] = useState(initialName);
  // Slug is fully auto-generated from the name — never hand-edited.
  const slug = slugifyName(name);
  const [parentId, setParentId] = useState(defaultParentId);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const firstParentId = parentCategories[0]?.id ? String(parentCategories[0].id) : "";

  // Sync initial state when dialog opens
  useEffect(() => {
    if (open) {
      const trimmed = initialName.trim();
      setName(trimmed);
      const startTab: QuickTab =
        initialTab ??
        (defaultParentId && defaultParentId !== "0" ? "sub" : "category");
      setTab(startTab);
      setParentId(
        startTab === "sub"
          ? (defaultParentId && defaultParentId !== "0" ? defaultParentId : firstParentId)
          : "0",
      );
      setImageFile(null);
      setErrorMessage(null);
      setTimeout(() => {
        if (nameInputRef.current) {
          nameInputRef.current.focus();
          if (trimmed) nameInputRef.current.select();
        }
      }, 50);
    }
  }, [open, initialName, defaultParentId]);

  // Revoke image preview on change/unmount.
  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const reset = () => {
    setName("");
    setTab(defaultTab);
    setParentId(defaultParentId);
    setImageFile(null);
    setErrorMessage(null);
  };

  const handleTabChange = (next: QuickTab) => {
    setTab(next);
    setErrorMessage(null);
    if (next === "category") {
      setParentId("0");
    } else {
      setParentId((prev) => {
        if (prev && prev !== "0" && parentCategories.some((c) => String(c.id) === prev)) {
          return prev;
        }
        if (
          defaultParentId &&
          defaultParentId !== "0" &&
          parentCategories.some((c) => String(c.id) === defaultParentId)
        ) {
          return defaultParentId;
        }
        return firstParentId;
      });
    }
  };

  const handleNameChange = (val: string) => {
    setName(val);
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
    const finalParentId = tab === "category" ? "0" : parentId;
    if (tab === "sub" && (!finalParentId || finalParentId === "0")) {
      setErrorMessage("Please select a parent category for the sub-category.");
      return;
    }
    const finalSlug = slug.trim() || slugifyName(name);
    setSaving(true);
    try {
      const res = await createMutation.mutateAsync({
        categories_name: name.trim(),
        categories_slug: finalSlug,
        parent_id: finalParentId || "0",
        categories_sort_order: "1",
        categories_status: "Active",
        ...(imageFile ? { categories_image: imageFile } : {}),
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
    return parentCategories.map((c) => ({
      value: String(c.id),
      label: c.categories_name,
    }));
  }, [parentCategories]);

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
                New {tab === "category" ? "Category" : "Sub-Category"}
              </DialogTitle>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                Quick Add
              </span>
            </div>
            <DialogDescription className="text-xs">
              Create it here — it will be auto-selected instantly. Your current form stays untouched.
            </DialogDescription>
          </DialogHeader>

          {/* Category / Sub-Category tabs */}
          <div className="grid grid-cols-2 gap-1 rounded-lg border border-border/70 bg-muted/40 p-1">
            {(["category", "sub"] as QuickTab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTabChange(t)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  tab === t
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "category" ? "Category" : "Sub-Category"}
              </button>
            ))}
          </div>

          {errorMessage && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              {errorMessage}
            </div>
          )}

          <div className="grid gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="qc-name">
                {tab === "category" ? "Category" : "Sub-Category"} Name{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                ref={nameInputRef}
                id="qc-name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder={tab === "category" ? "e.g. Mustard Oil" : "e.g. Filtered Mustard Oil"}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="qc-slug">Slug (auto-generated)</Label>
              <Input
                id="qc-slug"
                value={slug}
                readOnly
                tabIndex={-1}
                placeholder="auto-generated from name"
                className="bg-muted/40 text-muted-foreground"
              />
            </div>

            {tab === "sub" && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="qc-parent">
                  Parent Category <span className="text-destructive">*</span>
                </Label>
                <SearchableSelect
                  id="qc-parent"
                  direction="up"
                  value={parentId}
                  onChange={setParentId}
                  options={parentOptions}
                  placeholder={
                    parentOptions.length > 0
                      ? "Search parent category..."
                      : "No parent categories found"
                  }
                  disabled={parentOptions.length === 0}
                  required
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="qc-image">
                {tab === "sub" ? "Sub Category Image" : "Category Image"}{" "}
                <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
              </Label>
              {previewUrl ? (
                <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 p-2">
                  <img
                    src={previewUrl}
                    alt="New category preview"
                    className="size-16 shrink-0 rounded-md border border-border/60 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-foreground">
                      New image preview
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {imageFile?.name}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setImageFile(null)}
                    className="size-7 shrink-0 p-0"
                    title="Remove selected image"
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor="qc-image"
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-input bg-background px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                >
                  <ImagePlus className="size-4 shrink-0" />
                  <span>Choose image — same as category creation</span>
                </label>
              )}
              <Input
                id="qc-image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setImageFile(file);
                  e.target.value = "";
                }}
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

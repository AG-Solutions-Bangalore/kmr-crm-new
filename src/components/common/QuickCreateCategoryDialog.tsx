import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Plus, Settings2 } from "lucide-react";
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
  defaultParentId = "0",
  onCreated,
}: QuickCreateCategoryDialogProps) {
  const createMutation = useCreateCategory();
  const { data: activeCategories = [] } = useActiveCategories();
  const { data: allCategories = [] } = useCategories();
  const categories = activeCategories.length > 0 ? activeCategories : allCategories;

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [parentId, setParentId] = useState(defaultParentId);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="size-4 text-primary" />
              New Category
            </DialogTitle>
            <DialogDescription>
              Create it here — it will be selected automatically. Your current form stays untouched.
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
                id="qc-name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Mustard Oil"
                required
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="qc-slug">Slug</Label>
              <Input
                id="qc-slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugTouched(true);
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
                options={[
                  { value: "0", label: "Root (No Parent)" },
                  ...categories.map((c) => ({
                    value: String(c.id),
                    label: `${c.categories_name} (ID: ${c.id})`,
                  })),
                ]}
                placeholder="Select parent"
              />
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 pt-2 sm:flex-col">
            <div className="flex w-full items-center justify-between gap-2">
              <Link
                to={PATHS.category}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary hover:underline"
              >
                <Settings2 className="size-3" />
                Full category manager
              </Link>
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

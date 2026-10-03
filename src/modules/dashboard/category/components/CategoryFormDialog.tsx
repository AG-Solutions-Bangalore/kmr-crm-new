import { useState } from "react";
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
import { useCreateCategory, useUpdateCategory } from "../hook/useCategory.ts";
import type { Category, CategoryStatus } from "../types/category.types.ts";

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
}

interface InnerFormProps {
  category?: Category | null;
  onClose: () => void;
}

function CategoryFormContent({ category, onClose }: InnerFormProps) {
  const isEditing = Boolean(category);
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const [name, setName] = useState(category?.categories_name || "");
  const [slug, setSlug] = useState(category?.categories_slug || "");
  const [parentId, setParentId] = useState(String(category?.parent_id ?? "0"));
  const [sortOrder, setSortOrder] = useState(
    String(category?.categories_sort_order ?? "1"),
  );
  const [status, setStatus] = useState<CategoryStatus>(
    (category?.categories_status as CategoryStatus) || "Active",
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "-")
          .replace(/^-+|-+$/g, ""),
      );
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Category name is required.");
      return;
    }

    try {
      if (isEditing && category) {
        await updateMutation.mutateAsync({
          id: category.id,
          payload: {
            categories_name: name.trim(),
            categories_slug: slug.trim(),
            parent_id: parentId,
            categories_sort_order: sortOrder,
            categories_status: status,
            categories_image: imageFile ?? undefined,
          },
        });
      } else {
        await createMutation.mutateAsync({
          categories_name: name.trim(),
          categories_slug: slug.trim(),
          parent_id: parentId,
          categories_sort_order: sortOrder,
          categories_status: status,
          categories_image: imageFile ?? undefined,
        });
      }
      onClose();
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, "Failed to save category."));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Edit Category" : "Add New Category"}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Update category details and publication status."
            : "Create a new product category for your catalog."}
        </DialogDescription>
      </DialogHeader>

      {errorMessage && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cat-name">
            Category Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="cat-name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Edible Oil, Rice, Pulses"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cat-slug">Slug</Label>
          <Input
            id="cat-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. edible-oil"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cat-sort">Sort Order</Label>
            <Input
              id="cat-sort"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              min="0"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cat-status">Status</Label>
            <select
              id="cat-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as CategoryStatus)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cat-parent">Parent Category ID (0 for root)</Label>
          <Input
            id="cat-parent"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            placeholder="0"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cat-image">Category Image</Label>
          <Input
            id="cat-image"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setImageFile(file);
            }}
          />
          {category?.categories_image && !imageFile && (
            <p className="text-xs text-muted-foreground truncate">
              Current image: {category.categories_image}
            </p>
          )}
        </div>
      </div>

      <DialogFooter className="pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Saving..."
            : isEditing
              ? "Update Category"
              : "Create Category"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
}: CategoryFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {open && (
          <CategoryFormContent
            key={category?.id ?? "new-category"}
            category={category}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

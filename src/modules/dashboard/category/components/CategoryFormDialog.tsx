import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
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
import { resolveAssetImageUrl, useApiNoImageUrl } from "@/lib/image.ts";
import { CategorySelectWithCreate } from "@/components/common/EntitySelectWithCreate.tsx";
import {
  useCategories,
  useCategory,
  useCreateCategory,
  useUpdateCategory,
} from "../hook/useCategory.ts";
import { isRootCategory } from "@/lib/category-tree.ts";
import type { Category, CategoryStatus } from "../types/category.types.ts";

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  defaultType?: "parent" | "sub";
}

interface InnerFormProps {
  category?: Category | null;
  defaultType?: "parent" | "sub";
  onClose: () => void;
}

function CategoryFormContent({
  category,
  defaultType = "parent",
  onClose,
}: InnerFormProps) {
  const isEditing = Boolean(category);
  const isSub = isEditing
    ? Boolean(category && !isRootCategory(category))
    : defaultType === "sub";

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const [name, setName] = useState(category?.categories_name || "");
  // Slug is fully auto-generated and never hand-edited: live from the name
  // when creating, frozen to the saved value when editing.
  const [slug, setSlug] = useState(category?.categories_slug || "");
  const [parentId, setParentId] = useState(
    category?.parent_id ? String(category.parent_id) : "",
  );
  const [sortOrder, setSortOrder] = useState(
    String(category?.categories_sort_order ?? "1"),
  );
  const [status, setStatus] = useState<CategoryStatus>(
    (category?.categories_status as CategoryStatus) || "Active",
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [newPreviewUrl, setNewPreviewUrl] = useState<string | null>(null);
  const [existingImgError, setExistingImgError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const apiNoImage = useApiNoImageUrl();

  const { data: allCategories = [] } = useCategories();
  // In Parent Category only root categories (parent_id is null / 0) should appear
  const parentOptions = allCategories
    .filter(
      (c) =>
        isRootCategory(c) &&
        (!category || String(c.id) !== String(category.id)),
    )
    .map((c) => ({
      value: String(c.id),
      label: c.categories_name,
    }));

  const slugifyName = (val: string) =>
    val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleNameChange = (val: string) => {
    setName(val);
    // Slug is auto-generated only — always derived from the name on create.
    if (!isEditing) {
      setSlug(slugifyName(val));
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!imageFile) {
      setNewPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setNewPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const existingImageUrl = resolveAssetImageUrl(
    category?.categories_image,
    "category_images",
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage(
        isSub ? "Sub-category name is required." : "Category name is required.",
      );
      return;
    }

    if (isSub && (!parentId || parentId === "0")) {
      setErrorMessage("Please select a parent category.");
      return;
    }

    try {
      // A hand-typed slug is always respected; a blank one falls back to the name.
      const finalSlug = slug.trim() || slugifyName(name);
      const finalParentId = isSub ? parentId : "0";
      if (isEditing && category) {
        await updateMutation.mutateAsync({
          id: category.id,
          payload: {
            categories_name: name.trim(),
            categories_slug: finalSlug,
            parent_id: finalParentId,
            categories_sort_order: sortOrder,
            categories_status: status,
            categories_image: imageFile ?? undefined,
          },
        });
      } else {
        await createMutation.mutateAsync({
          categories_name: name.trim(),
          categories_slug: finalSlug,
          parent_id: finalParentId,
          categories_sort_order: sortOrder,
          categories_status: "Active",
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
          {isEditing
            ? isSub
              ? "Edit Sub Category"
              : "Edit Category"
            : isSub
              ? "Add New Sub Category"
              : "Add New Category"}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? isSub
              ? "Update sub-category details and publication status."
              : "Update category details and publication status."
            : isSub
              ? "Create a new sub-category linked to a primary category."
              : "Create a new product category for your catalog."}
        </DialogDescription>
      </DialogHeader>

      {errorMessage && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-3">
        {isSub && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cat-parent">
              Parent Category <span className="text-destructive">*</span>
            </Label>
            <CategorySelectWithCreate
              id="cat-parent"
              direction="down"
              value={parentId === "0" ? "" : parentId}
              onChange={setParentId}
              options={parentOptions}
              placeholder="Select parent category — or + to create one"
              defaultParentId="0"
              disabled={isEditing}
              required
            />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cat-name">
            {isSub ? "Sub Category Name" : "Category Name"}{" "}
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="cat-name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder={
              isSub
                ? "e.g. 1st Grade Refined Rice Bran Oil, Copra"
                : "e.g. Edible Oil, Rice, Pulses"
            }
            required
          />
        </div>

        {isEditing && (
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
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cat-image">
            {isSub ? "Sub Category Image" : "Category Image"}{" "}
            <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
          </Label>
          <Input
            id="cat-image"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setImageFile(file);
            }}
          />
          {newPreviewUrl ? (
            <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 p-2">
              <img
                src={newPreviewUrl}
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
            existingImageUrl && (
              <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 p-2">
                {existingImgError ? (
                  <img
                    src={apiNoImage}
                    alt="No image placeholder"
                    className="size-16 shrink-0 rounded-md border border-border/60 object-cover"
                  />
                ) : (
                  <img
                    src={existingImageUrl}
                    alt={name || "Currently uploaded category"}
                    className="size-16 shrink-0 rounded-md border border-border/60 object-cover"
                    onError={() => setExistingImgError(true)}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground">
                    Currently uploaded
                  </p>
                  <p className="text-[11px] text-muted-foreground/80">
                    Upload a new file to replace it.
                  </p>
                </div>
              </div>
            )
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
              ? isSub
                ? "Update Sub Category"
                : "Update Category"
              : isSub
                ? "Create Sub Category"
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
  defaultType,
}: CategoryFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
        {open && (
          <CategoryFormContainer
            categoryId={category?.id}
            initialCategory={category}
            defaultType={defaultType}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function CategoryFormContainer({
  categoryId,
  initialCategory,
  defaultType,
  onClose,
}: {
  categoryId?: number;
  initialCategory?: Category | null;
  defaultType?: "parent" | "sub";
  onClose: () => void;
}) {
  // GET /category/:id — fetch fresh details for edit.
  const { data: detailedCategory, isLoading } = useCategory(categoryId);

  if (categoryId && isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-sm text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-primary" />
        <span>Loading category details from server...</span>
      </div>
    );
  }

  const effectiveCategory = detailedCategory || initialCategory;
  return (
    <CategoryFormContent
      key={
        effectiveCategory?.id
          ? `${effectiveCategory.id}-${effectiveCategory.updated_at ?? ""}-${effectiveCategory.categories_image?.length ?? 0}`
          : `new-${defaultType ?? "parent"}`
      }
      category={effectiveCategory}
      defaultType={defaultType}
      onClose={onClose}
    />
  );
}

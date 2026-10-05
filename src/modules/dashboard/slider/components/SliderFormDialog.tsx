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
import { resolveAssetImageUrl } from "@/lib/image.ts";
import { useCreateSlider, useSlider, useUpdateSlider } from "../hook/useSlider.ts";
import {
  useActiveCategories,
  useCategories,
} from "../../category/hook/useCategory.ts";
import type { SliderItem, SliderStatus, SliderType } from "../types/slider.types.ts";

interface SliderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slider?: SliderItem | null;
}

interface InnerFormProps {
  slider?: SliderItem | null;
  onClose: () => void;
}

function SliderFormContent({ slider, onClose }: InnerFormProps) {
  const isEditing = Boolean(slider);
  const createMutation = useCreateSlider();
  const updateMutation = useUpdateSlider();

  const [sliderType, setSliderType] = useState<SliderType>(
    (slider?.slider_type as SliderType) || "Category",
  );
  const { data: activeCategories = [], isLoading: categoriesLoading } =
    useActiveCategories();
  const { data: allCategories = [] } = useCategories();
  // Prefer /activeCategories, fallback to /category (backend sometimes 500s on one).
  const categories =
    activeCategories.length > 0 ? activeCategories : allCategories;
  const [categoryId, setCategoryId] = useState(
    String(slider?.category_id ?? ""),
  );

  // Default to first real category instead of hardcoded "1".
  useEffect(() => {
    if (!categoryId && categories.length > 0) {
      setCategoryId(String(categories[0].id));
    }
  }, [categories, categoryId]);
  const [sortOrder, setSortOrder] = useState(String(slider?.slider_sort_order ?? "1"));
  const [url, setUrl] = useState(slider?.slider_url || "");
  const [status, setStatus] = useState<SliderStatus>(
    (slider?.slider_status as SliderStatus) || "Active",
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [newPreviewUrl, setNewPreviewUrl] = useState<string | null>(null);
  const [existingImgError, setExistingImgError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isPending = createMutation.isPending || updateMutation.isPending;

  // Preview for newly selected file (revoke on change/unmount).
  useEffect(() => {
    if (!imageFile) {
      setNewPreviewUrl(null);
      return;
    }
    const objUrl = URL.createObjectURL(imageFile);
    setNewPreviewUrl(objUrl);
    return () => URL.revokeObjectURL(objUrl);
  }, [imageFile]);

  const existingImageUrl = resolveAssetImageUrl(
    slider?.slider_image,
    "slider_images",
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isEditing && !imageFile) {
      setErrorMessage("Please select a banner image file.");
      return;
    }
    if (sliderType === "Category" && !categoryId) {
      setErrorMessage("Please select a category.");
      return;
    }

    try {
      if (isEditing && slider) {
        await updateMutation.mutateAsync({
          id: slider.id,
          payload: {
            slider_type: sliderType,
            category_id: sliderType === "Category" ? categoryId : undefined,
            slider_sort_order: sortOrder,
            slider_url: url.trim(),
            slider_status: status,
            slider_image: imageFile ?? undefined,
          },
        });
      } else {
        await createMutation.mutateAsync({
          slider_type: sliderType,
          category_id: sliderType === "Category" ? categoryId : undefined,
          slider_sort_order: sortOrder,
          slider_url: url.trim(),
          slider_status: "Active",
          slider_image: imageFile ?? undefined,
        });
      }
      onClose();
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, "Failed to save slider banner."));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit Slider" : "Add Slider Banner"}</DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Update slider banner image and target link."
            : "Upload a home screen or category hero banner."}
        </DialogDescription>
      </DialogHeader>

      {errorMessage && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-3">
        <div className={isEditing ? "grid grid-cols-2 gap-3" : "grid gap-3"}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="s-type">Slider Type</Label>
            <select
              id="s-type"
              value={sliderType}
              onChange={(e) => setSliderType(e.target.value as SliderType)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="Category">Category Banner</option>
              <option value="Home">Home Screen</option>
            </select>
          </div>

          {isEditing && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="s-status">Status</Label>
              <select
                id="s-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as SliderStatus)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          )}
        </div>

        {sliderType === "Category" && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="s-cat">Category</Label>
            <select
              id="s-cat"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
            >
              <option value="" disabled>
                {categoriesLoading ? "Loading categories..." : "Select category"}
              </option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.categories_name} (ID: {c.id})
                </option>
              ))}
            </select>
            {slider?.categories_name && (
              <p className="text-xs text-muted-foreground">
                Current: {slider.categories_name} (ID: {slider.category_id})
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="s-sort">Sort Order</Label>
            <Input
              id="s-sort"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              min="0"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="s-url">Target / Redirect URL</Label>
            <Input
              id="s-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="s-image">
            Banner Image {!isEditing && <span className="text-destructive">*</span>}
          </Label>
          <Input
            id="s-image"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setImageFile(file);
            }}
            required={!isEditing}
          />
          {newPreviewUrl ? (
            <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 p-2">
              <img
                src={newPreviewUrl}
                alt="New banner preview"
                className="size-16 shrink-0 rounded-md border border-border/60 object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground">
                  New banner preview
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
                  <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-md border border-destructive/30 bg-destructive/10 p-1 text-center">
                    <span className="text-[10px] font-medium leading-tight text-destructive">
                      Preview not available
                    </span>
                  </div>
                ) : (
                  <img
                    src={existingImageUrl}
                    alt="Currently uploaded banner"
                    className="size-16 shrink-0 rounded-md border border-border/60 object-cover"
                    onError={() => setExistingImgError(true)}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground">
                    Currently uploaded
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {slider?.slider_image}
                  </p>
                  {existingImgError && (
                    <p className="text-[11px] text-destructive">
                      File not found at this URL — check folder/filename.
                    </p>
                  )}
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
          {isPending ? "Saving..." : isEditing ? "Update Banner" : "Upload Banner"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function SliderFormDialog({
  open,
  onOpenChange,
  slider,
}: SliderFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
        {open && (
          <SliderFormContainer
            sliderId={slider?.id}
            initialSlider={slider}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function SliderFormContainer({
  sliderId,
  initialSlider,
  onClose,
}: {
  sliderId?: number;
  initialSlider?: SliderItem | null;
  onClose: () => void;
}) {
  // GET /slider/:id — fetch fresh details for edit.
  const { data: detailedSlider, isLoading } = useSlider(sliderId);

  if (sliderId && isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-sm text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-primary" />
        <span>Loading slider details from server...</span>
      </div>
    );
  }

  const effectiveSlider = detailedSlider || initialSlider;
  return (
    <SliderFormContent
      key={
        effectiveSlider?.id
          ? `${effectiveSlider.id}-${effectiveSlider.updated_at ?? ""}-${effectiveSlider.slider_image?.length ?? 0}`
          : "new-slider"
      }
      slider={effectiveSlider}
      onClose={onClose}
    />
  );
}

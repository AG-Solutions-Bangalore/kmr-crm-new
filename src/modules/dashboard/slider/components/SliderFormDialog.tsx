import { useEffect, useMemo, useState } from "react";
import { Loader2, SlidersHorizontal, X } from "lucide-react";
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
import { isRootCategory, mergeCategories } from "@/lib/category-tree.ts";
import { CategorySelectWithCreate } from "@/components/common/EntitySelectWithCreate.tsx";
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

  const [sliderType, setSliderType] = useState<SliderType | "">(
    (slider?.slider_type as SliderType) || (isEditing ? "Category" : ""),
  );
  const { data: activeCategories = [], isLoading: categoriesLoading } =
    useActiveCategories();
  const { data: allCategories = [] } = useCategories();

  // Show ONLY root categories (exclude sub-categories) in Slider
  const parentCategories = useMemo(() => {
    const merged = mergeCategories(activeCategories, allCategories);
    return merged.filter(isRootCategory);
  }, [activeCategories, allCategories]);

  const [categoryId, setCategoryId] = useState(
    slider?.category_id ? String(slider.category_id) : "",
  );

  const categoryOptions = useMemo(() => {
    const list = parentCategories.map((c) => ({
      value: String(c.id),
      label: c.categories_name,
    }));
    if (
      slider?.category_id &&
      !list.some((o) => o.value === String(slider.category_id))
    ) {
      list.unshift({
        value: String(slider.category_id),
        label: slider.categories_name || `Category #${slider.category_id}`,
      });
    }
    return list;
  }, [parentCategories, slider]);

  const [sortOrder, setSortOrder] = useState(String(slider?.slider_sort_order ?? "1"));
  const [url, setUrl] = useState(slider?.slider_url || "");
  const [status, setStatus] = useState<SliderStatus>(
    (slider?.slider_status as SliderStatus) || "Active",
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [newPreviewUrl, setNewPreviewUrl] = useState<string | null>(null);
  const [existingImgError, setExistingImgError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const apiNoImage = useApiNoImageUrl();

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
    if (!sliderType) {
      setErrorMessage("Please select a slider type.");
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
          slider_status: status,
          slider_image: imageFile ?? undefined,
        });
      }
      onClose();
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, "Failed to save slider banner."));
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={(e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
          e.preventDefault();
          void handleSubmit(e);
        }
      }}
      className="flex flex-col gap-5"
    >
      <DialogHeader className="gap-1 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
            <SlidersHorizontal className="size-4" />
          </div>
          <div>
            <DialogTitle className="text-lg font-semibold">
              {isEditing ? "Edit Slider Banner" : "Add Slider Banner"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {isEditing
                ? "Update slider banner image, display order, and target redirection link."
                : "Upload and configure a hero banner for the home screen or category page."}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {errorMessage && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          {errorMessage}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {/* Row 1: Type + Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="s-type">Slider Type</Label>
            <select
              id="s-type"
              value={sliderType}
              onChange={(e) => setSliderType(e.target.value as SliderType)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Select Slider Type...</option>
              <option value="Category">Category Banner</option>
              <option value="Home">Home Screen Hero</option>
            </select>
          </div>

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
        </div>

        {/* Row 2: Category (only when Category type) */}
        {sliderType === "Category" && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="s-cat">
                Target Category <span className="text-destructive">*</span>
              </Label>
              {slider?.categories_name && (
                <span className="text-[11px] text-muted-foreground">
                  Current: {slider.categories_name}
                </span>
              )}
            </div>
            <CategorySelectWithCreate
              id="s-cat"
              value={categoryId}
              onChange={setCategoryId}
              options={categoryOptions}
              placeholder={
                categoriesLoading
                  ? "Loading categories..."
                  : "Select category — or + to create one"
              }
              required
            />
          </div>
        )}

        {/* Row 3: Sort Order + Target URL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="s-sort">Sort Order</Label>
            <Input
              id="s-sort"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              min="0"
              placeholder="e.g. 1"
            />
            <p className="text-[11px] text-muted-foreground">
              Lower numbers appear first in the banner carousel
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="s-url">Target / Redirect URL (optional)</Label>
            <Input
              id="s-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/promo or /category/12"
            />
            <p className="text-[11px] text-muted-foreground">
              URL opened when users tap or click this banner
            </p>
          </div>
        </div>

        {/* Row 4: Banner Image Upload & Wide Preview */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="s-image">
              Banner Image {!isEditing && <span className="text-destructive">*</span>}
            </Label>
            <span className="text-[11px] text-muted-foreground">
              Landscape recommended (e.g. 1200 × 500 px or 16:9)
            </span>
          </div>

          {newPreviewUrl ? (
            <div className="flex flex-col overflow-hidden rounded-xl border border-border/80 bg-muted/20">
              <div className="relative aspect-[16/7] w-full overflow-hidden bg-black/10">
                <img
                  src={newPreviewUrl}
                  alt="New banner preview"
                  className="size-full object-cover"
                />
                <div className="absolute right-2 top-2">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setImageFile(null)}
                    className="size-7 p-0 shadow-sm"
                    title="Remove selected image"
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between px-3 py-2 text-xs border-t border-border/60">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    New Selection
                  </span>
                  <span className="truncate text-muted-foreground font-mono">
                    {imageFile?.name}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground shrink-0">
                  {imageFile ? `${(imageFile.size / 1024).toFixed(0)} KB` : ""}
                </span>
              </div>
            </div>
          ) : existingImageUrl ? (
            <div className="flex flex-col overflow-hidden rounded-xl border border-border/80 bg-muted/20">
              <div className="relative aspect-[16/7] w-full overflow-hidden bg-black/10">
                {existingImgError ? (
                  <img
                    src={apiNoImage}
                    alt="No image placeholder"
                    className="size-full object-cover"
                  />
                ) : (
                  <img
                    src={existingImageUrl}
                    alt="Currently uploaded banner"
                    className="size-full object-cover"
                    onError={() => setExistingImgError(true)}
                  />
                )}
              </div>
              <div className="flex items-center justify-between border-t border-border/60 bg-muted/30 px-3 py-2 text-xs">
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                  Currently Live Banner
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Select a new file below to replace
                </span>
              </div>
            </div>
          ) : null}

          <Input
            id="s-image"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setImageFile(file);
            }}
            required={!isEditing && !newPreviewUrl}
            className="cursor-pointer file:cursor-pointer"
          />
        </div>
      </div>

      <DialogFooter className="pt-2 flex-row items-center justify-between sm:justify-between border-t border-border/60">
        <span className="hidden text-xs text-muted-foreground sm:inline">
          <kbd className="rounded border border-border/80 bg-muted px-1.5 py-0.5 font-mono text-[10px]">
            Ctrl+Enter
          </kbd>{" "}
          to {isEditing ? "update" : "upload"}
        </span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin mr-1.5" />
                <span>Saving...</span>
              </>
            ) : (
              "Save"
            )}
          </Button>
        </div>
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
      <DialogContent className="max-h-[92vh] sm:min-h-[580px] w-full max-w-xl md:max-w-2xl overflow-y-auto">
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

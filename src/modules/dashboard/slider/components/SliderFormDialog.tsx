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
import { useCreateSlider, useUpdateSlider } from "../hook/useSlider.ts";
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
  const [categoryId, setCategoryId] = useState(String(slider?.category_id ?? "1"));
  const [sortOrder, setSortOrder] = useState(String(slider?.slider_sort_order ?? "1"));
  const [url, setUrl] = useState(slider?.slider_url || "");
  const [status, setStatus] = useState<SliderStatus>(
    (slider?.slider_status as SliderStatus) || "Active",
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isEditing && !imageFile) {
      setErrorMessage("Please select a banner image file.");
      return;
    }

    try {
      if (isEditing && slider) {
        await updateMutation.mutateAsync({
          id: slider.id,
          payload: {
            slider_type: sliderType,
            category_id: sliderType === "Category" ? categoryId : "0",
            slider_sort_order: sortOrder,
            slider_url: url.trim(),
            slider_status: status,
            slider_image: imageFile ?? undefined,
          },
        });
      } else {
        await createMutation.mutateAsync({
          slider_type: sliderType,
          category_id: sliderType === "Category" ? categoryId : "0",
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
        <div className="grid grid-cols-2 gap-3">
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

        {sliderType === "Category" && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="s-cat">Category ID</Label>
            <Input
              id="s-cat"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              placeholder="e.g. 1"
              required
            />
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
          {slider?.slider_image && !imageFile && (
            <p className="text-xs text-muted-foreground truncate">
              Current: {slider.slider_image}
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
      <DialogContent className="max-w-md">
        {open && (
          <SliderFormContent
            key={slider?.id ?? "new-slider"}
            slider={slider}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

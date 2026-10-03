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
import { useCreateGallery, useUpdateGallery } from "../hook/useGallery.ts";
import type { GalleryItem, GalleryStatus } from "../types/gallery.types.ts";

interface GalleryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  galleryItem?: GalleryItem | null;
}

interface InnerFormProps {
  galleryItem?: GalleryItem | null;
  onClose: () => void;
}

function GalleryFormContent({ galleryItem, onClose }: InnerFormProps) {
  const isEditing = Boolean(galleryItem);
  const createMutation = useCreateGallery();
  const updateMutation = useUpdateGallery();

  const [status, setStatus] = useState<GalleryStatus>(
    (galleryItem?.gallery_status as GalleryStatus) || "Active",
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isEditing && !imageFile) {
      setErrorMessage("Please select an image file to upload.");
      return;
    }

    try {
      if (isEditing && galleryItem) {
        await updateMutation.mutateAsync({
          id: galleryItem.id,
          payload: {
            gallery_status: status,
            gallery_image: imageFile ?? undefined,
          },
        });
      } else {
        await createMutation.mutateAsync({
          gallery_status: status,
          gallery_image: imageFile ?? undefined,
        });
      }
      onClose();
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, "Failed to save gallery image."));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit Gallery Item" : "Upload Gallery Image"}</DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Replace image or change visibility status."
            : "Upload an image asset to your gallery."}
        </DialogDescription>
      </DialogHeader>

      {errorMessage && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="g-status">Status</Label>
          <select
            id="g-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as GalleryStatus)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="g-image">
            Image File {!isEditing && <span className="text-destructive">*</span>}
          </Label>
          <Input
            id="g-image"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setImageFile(file);
            }}
            required={!isEditing}
          />
          {galleryItem?.gallery_image && !imageFile && (
            <p className="text-xs text-muted-foreground truncate">
              Current: {galleryItem.gallery_image}
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
          {isPending ? "Saving..." : isEditing ? "Update Image" : "Upload Image"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function GalleryFormDialog({
  open,
  onOpenChange,
  galleryItem,
}: GalleryFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {open && (
          <GalleryFormContent
            key={galleryItem?.id ?? "new-gallery"}
            galleryItem={galleryItem}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

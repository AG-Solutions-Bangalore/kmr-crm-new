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
import {
  useCreateGallery,
  useGalleryItem,
  useUpdateGallery,
} from "../hook/useGallery.ts";
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
    const url = URL.createObjectURL(imageFile);
    setNewPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const existingImageUrl = galleryItem?.gallery_url
    ? `${galleryItem.gallery_url.replace(/\/?$/, "/")}${(galleryItem.gallery_image || "").replace(/^\/+/, "")}`
    : resolveAssetImageUrl(galleryItem?.gallery_image, "gallerys_images");

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
          gallery_status: "Active",
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
        {isEditing && (
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
        )}

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
          {newPreviewUrl ? (
            <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 p-2">
              <img
                src={newPreviewUrl}
                alt="New gallery preview"
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
                  <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-md border border-destructive/30 bg-destructive/10 p-1 text-center">
                    <span className="text-[10px] font-medium leading-tight text-destructive">
                      Preview not available
                    </span>
                  </div>
                ) : (
                  <img
                    src={existingImageUrl}
                    alt="Currently uploaded gallery"
                    className="size-16 shrink-0 rounded-md border border-border/60 object-cover"
                    onError={() => setExistingImgError(true)}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground">
                    Currently uploaded
                  </p>
                  <a
                    href={existingImageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate text-[11px] text-primary underline"
                  >
                    View full image
                  </a>
                  {existingImgError && (
                    <p className="text-[11px] text-destructive">
                      File not found at this URL — check folder/filename on
                      server.
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
          <GalleryFormContainer
            galleryId={galleryItem?.id}
            initialGalleryItem={galleryItem}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function GalleryFormContainer({
  galleryId,
  initialGalleryItem,
  onClose,
}: {
  galleryId?: number;
  initialGalleryItem?: GalleryItem | null;
  onClose: () => void;
}) {
  // GET /gallery/:id — fetch fresh details for edit, like client/testimonial edit.
  const { data: detailedGalleryItem, isLoading } = useGalleryItem(galleryId);

  if (galleryId && isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-sm text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-primary" />
        <span>Loading gallery details from server...</span>
      </div>
    );
  }

  const effectiveGalleryItem = detailedGalleryItem || initialGalleryItem;
  return (
    <GalleryFormContent
      key={
        effectiveGalleryItem?.id
          ? `${effectiveGalleryItem.id}-${effectiveGalleryItem.updated_at ?? ""}-${effectiveGalleryItem.gallery_image?.length ?? 0}`
          : "new-gallery"
      }
      galleryItem={effectiveGalleryItem}
      onClose={onClose}
    />
  );
}

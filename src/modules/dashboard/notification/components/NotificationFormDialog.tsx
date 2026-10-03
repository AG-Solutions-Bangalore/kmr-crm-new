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
  useCreateNotification,
  useNotificationItem,
  useUpdateNotification,
} from "../hook/useNotification.ts";
import type { NotificationItem, NotificationStatus } from "../types/notification.types.ts";

interface NotificationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notification?: NotificationItem | null;
}

interface InnerFormProps {
  notification?: NotificationItem | null;
  onClose: () => void;
}

const todayStr = new Date().toISOString().split("T")[0];

function NotificationFormContent({ notification, onClose }: InnerFormProps) {
  const isEditing = Boolean(notification);
  const createMutation = useCreateNotification();
  const updateMutation = useUpdateNotification();

  const [heading, setHeading] = useState(notification?.notification_heading || "");
  const [description, setDescription] = useState(
    notification?.notification_description || "",
  );
  const [date, setDate] = useState(
    () => notification?.notification_date || new Date().toISOString().split("T")[0],
  );
  const [status, setStatus] = useState<NotificationStatus>(
    (notification?.notification_status as NotificationStatus) || "Active",
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

  const existingImageUrl = resolveAssetImageUrl(
    notification?.notification_image,
    "notification_images",
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!heading.trim()) {
      setErrorMessage("Notification title is required.");
      return;
    }
    if (!description.trim()) {
      setErrorMessage("Notification description is required.");
      return;
    }
    if (!date) {
      setErrorMessage("Notification schedule date is required.");
      return;
    }

    try {
      if (isEditing && notification) {
        await updateMutation.mutateAsync({
          id: notification.id,
          payload: {
            notification_heading: heading.trim(),
            notification_description: description.trim(),
            notification_date: date,
            notification_status: status,
            notification_image: imageFile ?? undefined,
          },
        });
      } else {
        await createMutation.mutateAsync({
          notification_heading: heading.trim(),
          notification_description: description.trim(),
          notification_date: date,
          notification_status: status,
          notification_image: imageFile ?? undefined,
        });
      }
      onClose();
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, "Failed to send notification."));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Edit Notification" : "Schedule Push Notification"}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Update broadcast message and schedule date."
            : "Compose and broadcast a push notification alert to mobile app users."}
        </DialogDescription>
      </DialogHeader>

      {errorMessage && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="notif-heading">
            Title / Heading <span className="text-destructive">*</span>
          </Label>
          <Input
            id="notif-heading"
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            placeholder="e.g. Flash Rate Alert: Palm Oil Updates"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notif-date">
              Broadcast Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="notif-date"
              type="date"
              value={date}
              min={todayStr}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notif-status">Status</Label>
            <select
              id="notif-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as NotificationStatus)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="Active">Active (Publish)</option>
              <option value="Inactive">Inactive (Draft)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="notif-desc">
            Message Body <span className="text-destructive">*</span>
          </Label>
          <textarea
            id="notif-desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter the push notification message details..."
            required
            className="w-full rounded-md border border-input bg-background p-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="notif-image">Notification Image / Icon</Label>
          <Input
            id="notif-image"
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
                alt="New notification preview"
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
                    alt={heading || "Currently uploaded notification"}
                    className="size-16 shrink-0 rounded-md border border-border/60 object-cover"
                    onError={() => setExistingImgError(true)}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground">
                    Currently uploaded
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {notification?.notification_image}
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
          {isPending
            ? "Scheduling..."
            : isEditing
              ? "Update Alert"
              : "Broadcast Alert"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function NotificationFormDialog({
  open,
  onOpenChange,
  notification,
}: NotificationFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
        {open && (
          <NotificationFormContainer
            notificationId={notification?.id}
            initialNotification={notification}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function NotificationFormContainer({
  notificationId,
  initialNotification,
  onClose,
}: {
  notificationId?: number;
  initialNotification?: NotificationItem | null;
  onClose: () => void;
}) {
  // GET /notification/:id — fetch fresh details for edit.
  const { data: detailedNotification, isLoading } =
    useNotificationItem(notificationId);

  if (notificationId && isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-sm text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-primary" />
        <span>Loading notification details from server...</span>
      </div>
    );
  }

  const effectiveNotification = detailedNotification || initialNotification;
  return (
    <NotificationFormContent
      key={
        effectiveNotification?.id
          ? `${effectiveNotification.id}-${effectiveNotification.updated_at ?? ""}-${effectiveNotification.notification_image?.length ?? 0}`
          : "new-notification"
      }
      notification={effectiveNotification}
      onClose={onClose}
    />
  );
}

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
import { useCreateNotification, useUpdateNotification } from "../hook/useNotification.ts";
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

function NotificationFormContent({ notification, onClose }: InnerFormProps) {
  const isEditing = Boolean(notification);
  const createMutation = useCreateNotification();
  const updateMutation = useUpdateNotification();

  const todayStr = new Date().toISOString().split("T")[0];

  const [heading, setHeading] = useState(notification?.notification_heading || "");
  const [description, setDescription] = useState(
    notification?.notification_description || "",
  );
  const [date, setDate] = useState(notification?.notification_date || todayStr);
  const [status, setStatus] = useState<NotificationStatus>(
    (notification?.notification_status as NotificationStatus) || "Active",
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isPending = createMutation.isPending || updateMutation.isPending;

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
          {notification?.notification_image && !imageFile && (
            <p className="text-xs text-muted-foreground truncate">
              Current: {notification.notification_image}
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
      <DialogContent className="max-w-md">
        {open && (
          <NotificationFormContent
            key={notification?.id ?? "new-notification"}
            notification={notification}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

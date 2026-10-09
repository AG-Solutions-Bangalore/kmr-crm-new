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
import { useClient, useCreateClient, useUpdateClient } from "../hook/useClient.ts";
import type { ClientItem, ClientStatus } from "../types/client.types.ts";

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: ClientItem | null;
}

interface InnerFormProps {
  client?: ClientItem | null;
  onClose: () => void;
}

function ClientFormContent({ client, onClose }: InnerFormProps) {
  const isEditing = Boolean(client);
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();

  const [name, setName] = useState(client?.clients_name || "");
  const [status, setStatus] = useState<ClientStatus>(
    (client?.clients_status as ClientStatus) || "Active",
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [newPreviewUrl, setNewPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isPending = createMutation.isPending || updateMutation.isPending;
  const apiNoImage = useApiNoImageUrl();
  const [existingImgError, setExistingImgError] = useState(false);

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
    client?.clients_image,
    "client_images",
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Please enter the client name.");
      return;
    }

    try {
      if (isEditing && client) {
        await updateMutation.mutateAsync({
          id: client.id,
          payload: {
            clients_name: name.trim(),
            clients_status: status,
            clients_image: imageFile ?? undefined,
          },
        });
      } else {
        await createMutation.mutateAsync({
          clients_name: name.trim(),
          clients_status: "Active",
          clients_image: imageFile ?? undefined,
        });
      }
      onClose();
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, "Failed to save client."));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit Client" : "Add Client"}</DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Update client details and logo."
            : "Add a corporate client or partner to the platform."}
        </DialogDescription>
      </DialogHeader>

      {errorMessage && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="c-name">
            Client Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="c-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Acme Corporation"
            required
          />
        </div>

        {isEditing && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="c-status">Status</Label>
            <select
              id="c-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ClientStatus)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="c-image">Client Logo / Image</Label>
          <Input
            id="c-image"
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
                alt="New logo preview"
                className="size-16 shrink-0 rounded-md border border-border/60 object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground">
                  New logo preview
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
                <img
                  src={existingImgError ? apiNoImage : existingImageUrl}
                  alt={client?.clients_name || "Client logo"}
                  className="size-16 shrink-0 rounded-md border border-border/60 object-cover"
                  onError={() => setExistingImgError(true)}
                />
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
          {isPending ? "Saving..." : "Save"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function ClientFormDialog({
  open,
  onOpenChange,
  client,
}: ClientFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {open && (
          <ClientFormContainer
            clientId={client?.id}
            initialClient={client}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ClientFormContainer({
  clientId,
  initialClient,
  onClose,
}: {
  clientId?: number;
  initialClient?: ClientItem | null;
  onClose: () => void;
}) {
  // GET /client/:id — fetch fresh details for edit, like testimonial/FAQ edit.
  const { data: detailedClient, isLoading } = useClient(clientId);

  if (clientId && isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-sm text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-primary" />
        <span>Loading client details from server...</span>
      </div>
    );
  }

  const effectiveClient = detailedClient || initialClient;
  return (
    <ClientFormContent
      key={
        effectiveClient?.id
          ? `${effectiveClient.id}-${effectiveClient.updated_at ?? ""}-${effectiveClient.clients_name?.length ?? 0}`
          : "new-client"
      }
      client={effectiveClient}
      onClose={onClose}
    />
  );
}

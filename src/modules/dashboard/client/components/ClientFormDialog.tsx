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
import { useCreateClient, useUpdateClient } from "../hook/useClient.ts";
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isPending = createMutation.isPending || updateMutation.isPending;

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
          clients_status: status,
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
          {client?.clients_image && !imageFile && (
            <p className="text-xs text-muted-foreground truncate">
              Current: {client.clients_image}
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
          {isPending ? "Saving..." : isEditing ? "Update Client" : "Add Client"}
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
          <ClientFormContent
            key={client?.id ?? "new-client"}
            client={client}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

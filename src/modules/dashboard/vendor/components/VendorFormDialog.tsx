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
import { useCreateVendor, useUpdateVendor } from "../hook/useVendor.ts";
import type { Vendor, VendorStatus } from "../types/vendor.types.ts";

interface VendorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor?: Vendor | null;
}

interface InnerFormProps {
  vendor?: Vendor | null;
  onClose: () => void;
}

function VendorFormContent({ vendor, onClose }: InnerFormProps) {
  const isEditing = Boolean(vendor);
  const createMutation = useCreateVendor();
  const updateMutation = useUpdateVendor();

  const [name, setName] = useState(vendor?.vendor_name || "");
  const [mobile, setMobile] = useState(vendor?.vendor_mobile || "");
  const [email, setEmail] = useState(vendor?.vendor_email || "");
  const [city, setCity] = useState(vendor?.vendor_city || "");
  const [trade, setTrade] = useState(vendor?.vendor_trade || "");
  const [address, setAddress] = useState(vendor?.vendor_address || "");
  const [status, setStatus] = useState<VendorStatus>(
    (vendor?.vendor_status as VendorStatus) || "Active",
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Vendor name is required.");
      return;
    }
    if (!mobile.trim()) {
      setErrorMessage("Vendor mobile is required.");
      return;
    }

    try {
      if (isEditing && vendor) {
        await updateMutation.mutateAsync({
          id: vendor.id,
          payload: {
            vendor_name: name.trim(),
            vendor_mobile: mobile.trim(),
            vendor_email: email.trim(),
            vendor_city: city.trim(),
            vendor_trade: trade.trim(),
            vendor_address: address.trim(),
            vendor_status: status,
            vendor_image: imageFile ?? undefined,
          },
        });
      } else {
        await createMutation.mutateAsync({
          vendor_name: name.trim(),
          vendor_mobile: mobile.trim(),
          vendor_email: email.trim(),
          vendor_city: city.trim(),
          vendor_trade: trade.trim(),
          vendor_address: address.trim(),
          vendor_status: status,
          vendor_image: imageFile ?? undefined,
        });
      }
      onClose();
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, "Failed to save vendor."));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit Vendor" : "Add New Vendor"}</DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Update vendor contact information and trade categories."
            : "Register a new vendor to your supplier network."}
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
            <Label htmlFor="v-name">
              Vendor Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="v-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Haldiya Port Rate"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="v-mobile">
              Mobile Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="v-mobile"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="e.g. 9876543210"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="v-email">Email Address</Label>
            <Input
              id="v-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vendor@example.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="v-city">City</Label>
            <Input
              id="v-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Kolkata, Mumbai"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="v-trade">Trade Categories / IDs</Label>
            <Input
              id="v-trade"
              value={trade}
              onChange={(e) => setTrade(e.target.value)}
              placeholder="e.g. 1, 2, 3"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="v-status">Status</Label>
            <select
              id="v-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as VendorStatus)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="v-address">Address</Label>
          <Input
            id="v-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Full physical address or warehouse"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="v-image">Vendor Logo / Image</Label>
          <Input
            id="v-image"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setImageFile(file);
            }}
          />
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
          {isPending ? "Saving..." : isEditing ? "Update Vendor" : "Create Vendor"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function VendorFormDialog({
  open,
  onOpenChange,
  vendor,
}: VendorFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        {open && (
          <VendorFormContent
            key={vendor?.id ?? "new-vendor"}
            vendor={vendor}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

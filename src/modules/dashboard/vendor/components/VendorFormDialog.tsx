import { useEffect, useRef, useState } from "react";
import { ChevronDown, Loader2, X } from "lucide-react";
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
import { useCreateVendor, useUpdateVendor, useVendor } from "../hook/useVendor.ts";
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

const TRADE_OPTIONS = [
  { value: "1", label: "Live" },
  { value: "2", label: "Rate" },
  { value: "3", label: "Spot" },
];

/** Multi-select dropdown for trade types. Stores comma-separated ids
 *  (e.g. "1, 3") so the API payload stays unchanged. */
function TradeMultiSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const ids = value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const toggle = (v: string) => {
    const next = ids.includes(v) ? ids.filter((i) => i !== v) : [...ids, v];
    next.sort((a, b) => Number(a) - Number(b));
    onChange(next.join(", "));
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open ]);

  const selectedLabels = TRADE_OPTIONS.filter((o) => ids.includes(o.value)).map(
    (o) => `${o.value} - ${o.label}`,
  );

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        id="v-trade"
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <span className={selectedLabels.length > 0 ? "" : "text-muted-foreground"}>
          {selectedLabels.length > 0 ? selectedLabels.join(", ") : "Select trade types"}
        </span>
        <ChevronDown className="size-4 shrink-0 opacity-50" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md">
          {TRADE_OPTIONS.map((o) => (
            <label
              key={o.value}
              className="flex cursor-pointer items-center gap-2.5 rounded-sm px-2 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <input
                type="checkbox"
                checked={ids.includes(o.value)}
                onChange={() => toggle(o.value)}
                className="size-4 shrink-0 accent-primary"
              />
              <span>
                {o.value} - {o.label}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
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
  const [newPreviewUrl, setNewPreviewUrl] = useState<string | null>(null);
  const [existingImgError, setExistingImgError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isPending = createMutation.isPending || updateMutation.isPending;

  function handleMobileChange(e: React.ChangeEvent<HTMLInputElement>) {
    let digits = e.target.value.replace(/\D/g, "");
    if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
    else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
    setMobile(digits.slice(0, 10));
  }

  useEffect(() => {
    if (!imageFile) {
      setNewPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setNewPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const existingImageUrl = resolveAssetImageUrl(vendor?.vendor_image, "vendor_images");

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
    if (mobile.trim().length !== 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
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
          vendor_status: "Active",
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
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={mobile}
              onChange={handleMobileChange}
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

        <div className={isEditing ? "grid grid-cols-2 gap-3" : "grid gap-3"}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="v-trade">Trade</Label>
            <TradeMultiSelect value={trade} onChange={setTrade} />
          </div>

          {isEditing && (
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
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="v-address">Address</Label>
          <textarea
            id="v-address"
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Full physical address or warehouse"
            className="w-full rounded-md border border-input bg-background p-2.5 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
          {newPreviewUrl ? (
            <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 p-2">
              <img
                src={newPreviewUrl}
                alt="New vendor preview"
                className="size-16 shrink-0 rounded-md border border-border/60 object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground">New image preview</p>
                <p className="truncate text-xs text-muted-foreground">{imageFile?.name}</p>
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
                    alt={name || "Currently uploaded vendor"}
                    className="size-16 shrink-0 rounded-md border border-border/60 object-cover"
                    onError={() => setExistingImgError(true)}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground">Currently uploaded</p>
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
        <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : isEditing ? "Update Vendor" : "Create Vendor"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function VendorFormDialog({ open, onOpenChange, vendor }: VendorFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        {open && (
          <VendorFormContainer
            vendorId={vendor?.id}
            initialVendor={vendor}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function VendorFormContainer({
  vendorId,
  initialVendor,
  onClose,
}: {
  vendorId?: number;
  initialVendor?: Vendor | null;
  onClose: () => void;
}) {
  // GET /vendor/:id — fetch fresh details for edit.
  const { data: detailedVendor, isLoading } = useVendor(vendorId);

  if (vendorId && isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-sm text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-primary" />
        <span>Loading vendor details from server...</span>
      </div>
    );
  }

  const effectiveVendor = detailedVendor || initialVendor;
  return (
    <VendorFormContent
      key={
        effectiveVendor?.id
          ? `${effectiveVendor.id}-${effectiveVendor.updated_at ?? ""}-${effectiveVendor.vendor_image?.length ?? 0}`
          : "new-vendor"
      }
      vendor={effectiveVendor}
      onClose={onClose}
    />
  );
}

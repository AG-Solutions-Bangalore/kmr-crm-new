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
import { useActiveVendors, useCreateVendorSpot } from "../hook/useVendor.ts";

interface VendorSpotFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function VendorSpotFormContent({ onClose }: { onClose: () => void }) {
  const createMutation = useCreateVendorSpot();
  const { data: activeVendors = [] } = useActiveVendors();

  const [vendorId, setVendorId] = useState(
    activeVendors[0]?.id ? String(activeVendors[0].id) : "1",
  );
  const [categoryId, setCategoryId] = useState("1");
  const [subCategoryId, setSubCategoryId] = useState("15");
  const [heading, setHeading] = useState("");
  const [details, setDetails] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isPending = createMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!heading.trim()) {
      setErrorMessage("Please enter a spot quote heading.");
      return;
    }
    if (!details.trim()) {
      setErrorMessage("Please enter spot quote details.");
      return;
    }

    try {
      await createMutation.mutateAsync({
        products: [
          {
            vendor_id: Number(vendorId) || 1,
            category_id: categoryId,
            sub_category_id: subCategoryId || undefined,
            vendor_spot_heading: heading.trim(),
            vendor_spot_details: details.trim(),
          },
        ],
      });
      onClose();
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, "Failed to create spot quote."));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>Create Spot Quote</DialogTitle>
        <DialogDescription>
          Publish a spot market quote or prompt seller offer for a vendor.
        </DialogDescription>
      </DialogHeader>

      {errorMessage && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sp-vendor">Select Vendor</Label>
          <select
            id="sp-vendor"
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {activeVendors.length > 0 ? (
              activeVendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vendor_name} ({v.vendor_city || "No City"})
                </option>
              ))
            ) : (
              <option value="1">Vendor #1</option>
            )}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sp-cat">Category ID</Label>
            <Input
              id="sp-cat"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              placeholder="e.g. 1"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sp-subcat">Sub-Category ID</Label>
            <Input
              id="sp-subcat"
              value={subCategoryId}
              onChange={(e) => setSubCategoryId(e.target.value)}
              placeholder="e.g. 15"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sp-heading">
            Spot Heading <span className="text-destructive">*</span>
          </Label>
          <Input
            id="sp-heading"
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            placeholder="e.g. EDIBLE OIL or SUNFLOWER OIL"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sp-details">
            Spot Details / Offer <span className="text-destructive">*</span>
          </Label>
          <textarea
            id="sp-details"
            rows={3}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="e.g. Khopoli Seller Option / Prompt Dispatch"
            className="w-full rounded-md border border-input bg-background p-2.5 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            required
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
          {isPending ? "Creating..." : "Create Spot Quote"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function VendorSpotFormDialog({
  open,
  onOpenChange,
}: VendorSpotFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {open && (
          <VendorSpotFormContent onClose={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

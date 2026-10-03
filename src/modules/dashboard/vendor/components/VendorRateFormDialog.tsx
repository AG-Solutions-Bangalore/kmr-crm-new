import { useState } from "react";
import { AlertCircle, IndianRupee, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { getApiErrorMessage } from "@/lib/axios.ts";
import { useActiveVendors, useCreateVendorLive, useCreateVendorRate } from "../hook/useVendor.ts";

interface VendorRateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "live" | "standard";
}

export function VendorRateFormDialog({
  open,
  onOpenChange,
  type,
}: VendorRateFormDialogProps) {
  const { data: vendors = [] } = useActiveVendors();
  const createLiveMutation = useCreateVendorLive();
  const createRateMutation = useCreateVendorRate();

  const [vendorId, setVendorId] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("1");
  const [subCategoryId, setSubCategoryId] = useState<string>("1");
  const [productName, setProductName] = useState("");
  const [productSize, setProductSize] = useState("");
  const [productRate, setProductRate] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isSubmitting = createLiveMutation.isPending || createRateMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const vId = vendorId || (vendors[0]?.id ? String(vendors[0].id) : "1");

    if (!productName.trim()) {
      setErrorMessage("Product name is required.");
      return;
    }
    if (!productRate.trim()) {
      setErrorMessage("Product rate is required.");
      return;
    }

    const payload = {
      products: [
        {
          vendor_id: Number(vId),
          category_id: Number(categoryId) || 1,
          sub_category_id: Number(subCategoryId) || 1,
          vendor_product: productName.trim(),
          vendor_product_size: productSize.trim() || "Unit",
          vendor_product_rate: productRate.trim(),
        },
      ],
    };

    try {
      if (type === "live") {
        await createLiveMutation.mutateAsync(payload);
      } else {
        await createRateMutation.mutateAsync(payload);
      }
      onOpenChange(false);
      // Reset form
      setProductName("");
      setProductSize("");
      setProductRate("");
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, `Failed to create ${type === "live" ? "live" : "standard"} rate.`));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IndianRupee className="size-5 text-primary" />
            <span>Add {type === "live" ? "Live Rate" : "Standard Rate"}</span>
          </DialogTitle>
          <DialogDescription>
            Publish commodity pricing for vendors matching the Postman payload structure.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="vendor_select">Vendor</Label>
            <select
              id="vendor_select"
              value={vendorId || (vendors[0]?.id ? String(vendors[0].id) : "1")}
              onChange={(e) => setVendorId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {vendors.length > 0 ? (
                vendors.map((v) => (
                  <option key={v.id} value={v.id} className="bg-popover text-popover-foreground">
                    {v.vendor_name} (#{v.id})
                  </option>
                ))
              ) : (
                <option value="1" className="bg-popover text-popover-foreground">
                  Default Vendor (#1)
                </option>
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category_id">Category ID</Label>
              <Input
                id="category_id"
                type="number"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sub_category_id">Sub-Category ID</Label>
              <Input
                id="sub_category_id"
                type="number"
                value={subCategoryId}
                onChange={(e) => setSubCategoryId(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="vendor_product">Product Name</Label>
            <Input
              id="vendor_product"
              placeholder="e.g. Sunflower Oil, Mustard Refined..."
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="vendor_product_size">Size / Unit</Label>
              <Input
                id="vendor_product_size"
                placeholder="e.g. 15 kg Tin, 1 Ltr Pouch"
                value={productSize}
                onChange={(e) => setProductSize(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="vendor_product_rate">Rate (₹)</Label>
              <Input
                id="vendor_product_rate"
                type="number"
                placeholder="e.g. 1450"
                value={productRate}
                onChange={(e) => setProductRate(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              <span>Save Rate</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

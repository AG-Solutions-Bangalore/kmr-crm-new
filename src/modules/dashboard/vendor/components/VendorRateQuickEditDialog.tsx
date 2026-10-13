import { useEffect, useState } from "react";
import { AlertCircle, IndianRupee, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Dialog, DialogContent } from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { getApiErrorMessage } from "@/lib/axios.ts";
import {
  useUpdateVendorLive,
  useUpdateVendorRate,
} from "../hook/useVendor.ts";
import type { VendorRateProduct } from "../types/vendor.types.ts";

interface VendorRateQuickEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: VendorRateProduct | null;
  type: "live" | "standard";
}

/**
 * Quick price-only edit — for ~200 daily updates.
 * Shows current rate (read-only) + numeric input for the new rate.
 * On save, reuses the existing PUT /vendor-live/:id or PUT /vendor-rate/:id
 * with all other fields preserved from the row (no refetch needed).
 */
export function VendorRateQuickEditDialog({
  open,
  onOpenChange,
  item,
  type,
}: VendorRateQuickEditDialogProps) {
  const updateLiveMutation = useUpdateVendorLive();
  const updateRateMutation = useUpdateVendorRate();
  const mutation =
    type === "live" ? updateLiveMutation : updateRateMutation;

  const [newRate, setNewRate] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset input every time a new item is opened; prefill with current rate
  // so increment/decrement edits are one keystroke.
  useEffect(() => {
    if (open && item) {
      setNewRate(String(item.vendor_product_rate ?? ""));
      setErrorMessage(null);
    }
  }, [open, item]);

  if (!item) return null;

  const isSaving = mutation.isPending;
  const currentRate = String(item.vendor_product_rate ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = newRate.trim();
    if (!trimmed) {
      setErrorMessage("Please enter the new rate.");
      return;
    }
    const numeric = Number(trimmed);
    if (!Number.isFinite(numeric) || numeric < 0) {
      setErrorMessage("Please enter a valid non-negative rate.");
      return;
    }
    if (trimmed === currentRate.trim()) {
      onOpenChange(false);
      return;
    }

    try {
      await mutation.mutateAsync({
        id: item.id,
        payload: {
          category_id: item.category_id,
          ...(item.sub_category_id !== undefined &&
          item.sub_category_id !== null &&
          String(item.sub_category_id) !== ""
            ? { sub_category_id: item.sub_category_id }
            : {}),
          vendor_product: item.vendor_product,
          vendor_product_size: item.vendor_product_size || "Unit",
          vendor_product_rate: trimmed,
          vendor_product_status: item.vendor_product_status || "Active",
        },
      });
      onOpenChange(false);
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, "Failed to update rate."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col space-y-1.5">
            <h2 className="flex items-center gap-2 text-base font-semibold leading-none tracking-tight">
              <Zap className="size-4 text-amber-500" />
              <span>
                Quick Edit {type === "live" ? "Live Rate" : "Rate"}
              </span>
            </h2>
            <p className="text-xs text-muted-foreground">
              {item.vendor_name || `Vendor #${item.vendor_id}`}
              {item.vendor_product ? ` • ${item.vendor_product}` : ""}
              {item.vendor_product_size ? ` (${item.vendor_product_size})` : ""}
            </p>
          </div>

          {errorMessage && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs">
            <span className="font-semibold uppercase tracking-wider text-muted-foreground">
              Current rate
            </span>
            <p className="mt-0.5 flex items-center gap-1 text-base font-bold text-foreground">
              <IndianRupee className="size-4" />
              {currentRate}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="quick-edit-rate">
              Enter New Rate (₹) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="quick-edit-rate"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              placeholder="e.g. 1520"
              value={newRate}
              onChange={(e) => setNewRate(e.target.value)}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              onFocus={(e) => e.target.select()}
              required
              disabled={isSaving}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="gap-2">
              {isSaving && <Loader2 className="size-4 animate-spin" />}
              <span>{isSaving ? "Saving..." : "Save"}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

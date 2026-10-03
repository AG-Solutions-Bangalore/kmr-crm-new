import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
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
import {
  useActiveVendors,
  useCreateVendorSpot,
  useUpdateVendorSpot,
  useVendorSpot,
} from "../hook/useVendor.ts";
import {
  useActiveCategories,
  useCategories,
} from "../../category/hook/useCategory.ts";
import type { VendorSpotItem } from "../types/vendor.types.ts";

interface VendorSpotFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spot?: VendorSpotItem | null;
}

interface InnerFormProps {
  spot?: VendorSpotItem | null;
  onClose: () => void;
}

function VendorSpotFormContent({ spot, onClose }: InnerFormProps) {
  const isEditing = Boolean(spot);
  const createMutation = useCreateVendorSpot();
  const updateMutation = useUpdateVendorSpot();
  const { data: activeVendors = [] } = useActiveVendors();
  const { data: activeCategories = [] } = useActiveCategories();
  const { data: allCategories = [] } = useCategories();
  const categories =
    activeCategories.length > 0 ? activeCategories : allCategories;

  const [vendorId, setVendorId] = useState(
    spot ? String(spot.vendor_id) : activeVendors[0]?.id ? String(activeVendors[0].id) : "1",
  );
  const [categoryId, setCategoryId] = useState(
    spot ? String(spot.category_id) : "",
  );
  const [subCategoryId, setSubCategoryId] = useState(
    spot?.sub_category_id ? String(spot.sub_category_id) : "",
  );
  const [heading, setHeading] = useState(spot?.vendor_spot_heading || "");
  const [details, setDetails] = useState(spot?.vendor_spot_details || "");
  const [status, setStatus] = useState(spot?.vendor_spot_status || "Active");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Default category to first real one instead of hardcoded "1".
  useEffect(() => {
    if (!categoryId && categories.length > 0) {
      setCategoryId(String(categories[0].id));
    }
  }, [categories, categoryId]);

  // Sub-categories = children of the selected category.
  const subCategories = categories.filter(
    (c) => String(c.parent_id ?? "") === String(categoryId) && String(c.id) !== String(categoryId),
  );

  // Reset sub-category when it doesn't belong to the chosen category.
  useEffect(() => {
    if (
      subCategoryId &&
      subCategories.length > 0 &&
      !subCategories.some((c) => String(c.id) === String(subCategoryId))
    ) {
      setSubCategoryId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  const isPending = createMutation.isPending || updateMutation.isPending;

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
    if (!categoryId) {
      setErrorMessage("Please select a category.");
      return;
    }

    try {
      if (isEditing && spot) {
        await updateMutation.mutateAsync({
          id: spot.id,
          payload: {
            category_id: categoryId,
            sub_category_id: subCategoryId || undefined,
            vendor_spot_heading: heading.trim(),
            vendor_spot_details: details.trim(),
            vendor_spot_status: status,
          },
        });
      } else {
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
      }
      onClose();
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, "Failed to save spot quote."));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit Spot Quote" : "Create Spot Quote"}</DialogTitle>
        <DialogDescription>
          {isEditing
            ? `Update spot quote #${spot?.id} (${spot?.vendor_name || `Vendor #${spot?.vendor_id}`}).`
            : "Publish a spot market quote or prompt seller offer for a vendor."}
        </DialogDescription>
      </DialogHeader>

      {errorMessage && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-3">
        {isEditing ? (
          <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs">
            <span className="font-semibold uppercase tracking-wider text-muted-foreground">
              Vendor
            </span>
            <p className="mt-0.5 font-medium text-foreground">
              {spot?.vendor_name || `Vendor #${spot?.vendor_id}`}
              {spot?.vendor_mobile ? ` • ${spot.vendor_mobile}` : ""}
            </p>
          </div>
        ) : (
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
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sp-cat">Category</Label>
            <select
              id="sp-cat"
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setSubCategoryId("");
              }}
              className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
            >
              <option value="" disabled>
                Select category
              </option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.categories_name} (ID: {c.id})
                </option>
              ))}
            </select>
            {spot?.categories_name && (
              <p className="text-xs text-muted-foreground">
                Current: {spot.categories_name} (ID: {spot.category_id})
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sp-subcat">Sub-Category</Label>
            <select
              id="sp-subcat"
              value={subCategoryId}
              onChange={(e) => setSubCategoryId(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">None</option>
              {subCategoryId &&
                !subCategories.some((c) => String(c.id) === String(subCategoryId)) && (
                  <option value={subCategoryId}>
                    Current: {spot?.sub_categories_name || `#${subCategoryId}`} (ID: {subCategoryId})
                  </option>
                )}
              {subCategories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.categories_name} (ID: {c.id})
                </option>
              ))}
            </select>
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

        {isEditing && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sp-status">Status</Label>
            <select
              id="sp-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        )}
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
            ? "Saving..."
            : isEditing
              ? "Update Spot Quote"
              : "Create Spot Quote"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function VendorSpotFormDialog({
  open,
  onOpenChange,
  spot,
}: VendorSpotFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
        {open && (
          <VendorSpotFormContainer
            spotId={spot?.id}
            initialSpot={spot}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function VendorSpotFormContainer({
  spotId,
  initialSpot,
  onClose,
}: {
  spotId?: number;
  initialSpot?: VendorSpotItem | null;
  onClose: () => void;
}) {
  // GET /vendor-spot/:id — fetch fresh details for edit.
  const { data: detailedSpot, isLoading } = useVendorSpot(spotId);

  if (spotId && isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-sm text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-primary" />
        <span>Loading spot details from server...</span>
      </div>
    );
  }

  const effectiveSpot = detailedSpot || initialSpot;
  return (
    <VendorSpotFormContent
      key={
        effectiveSpot?.id
          ? `${effectiveSpot.id}-${effectiveSpot.vendor_spot_status ?? ""}-${effectiveSpot.vendor_spot_heading?.length ?? 0}`
          : "new-spot"
      }
      spot={effectiveSpot}
      onClose={onClose}
    />
  );
}

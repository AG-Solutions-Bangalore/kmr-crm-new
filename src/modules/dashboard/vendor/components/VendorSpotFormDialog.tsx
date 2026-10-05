import { useEffect, useRef, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
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
import { SearchableSelect } from "@/components/common/SearchableSelect.tsx";
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

/* ------------------------------------------------------------------ */
/* Edit — always a single product.                                     */
/* ------------------------------------------------------------------ */

function VendorSpotEditContent({
  spot,
  onClose,
}: {
  spot: VendorSpotItem;
  onClose: () => void;
}) {
  const updateMutation = useUpdateVendorSpot();
  const { data: activeCategories = [] } = useActiveCategories();
  const { data: allCategories = [] } = useCategories();
  const categories =
    activeCategories.length > 0 ? activeCategories : allCategories;

  const [categoryId, setCategoryId] = useState(String(spot.category_id));
  const [subCategoryId, setSubCategoryId] = useState(
    spot?.sub_category_id ? String(spot.sub_category_id) : "",
  );
  const [heading, setHeading] = useState(spot?.vendor_spot_heading || "");
  const [details, setDetails] = useState(spot?.vendor_spot_details || "");
  const [status, setStatus] = useState(spot?.vendor_spot_status || "Active");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      onClose();
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, "Failed to save spot quote."));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>Edit Spot Quote</DialogTitle>
        <DialogDescription>
          {`Update spot quote #${spot?.id} (${spot?.vendor_name || `Vendor #${spot?.vendor_id}`}).`}
        </DialogDescription>
      </DialogHeader>

      {errorMessage && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-3">
        <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs">
          <span className="font-semibold uppercase tracking-wider text-muted-foreground">
            Vendor
          </span>
          <p className="mt-0.5 font-medium text-foreground">
            {spot?.vendor_name || `Vendor #${spot?.vendor_id}`}
            {spot?.vendor_mobile ? ` • ${spot.vendor_mobile}` : ""}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sp-cat">Category</Label>
            <SearchableSelect
              id="sp-cat"
              value={categoryId}
              onChange={(val) => {
                setCategoryId(val);
                setSubCategoryId("");
              }}
              options={categories.map((c) => ({
                value: String(c.id),
                label: `${c.categories_name} (ID: ${c.id})`,
              }))}
              placeholder="Select category"
              required
            />
            {spot?.categories_name && (
              <p className="text-xs text-muted-foreground">
                Current: {spot.categories_name} (ID: {spot.category_id})
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sp-subcat">Sub-Category</Label>
            <SearchableSelect
              id="sp-subcat"
              value={subCategoryId}
              onChange={setSubCategoryId}
              options={[
                { value: "", label: "None" },
                ...(subCategoryId &&
                !subCategories.some((c) => String(c.id) === String(subCategoryId))
                  ? [
                      {
                        value: subCategoryId,
                        label: `Current: ${spot?.sub_categories_name || `#${subCategoryId}`} (ID: ${subCategoryId})`,
                      },
                    ]
                  : []),
                ...subCategories.map((c) => ({
                  value: String(c.id),
                  label: `${c.categories_name} (ID: ${c.id})`,
                })),
              ]}
              placeholder="Select sub-category"
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
      </div>

      <DialogFooter className="pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={updateMutation.isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? "Saving..." : "Update Spot Quote"}
        </Button>
      </DialogFooter>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Create — multiple products in one API call.                         */
/* ------------------------------------------------------------------ */

interface SpotRow {
  key: number;
  categoryId: string;
  subCategoryId: string;
  heading: string;
  details: string;
}

function VendorSpotCreateContent({ onClose }: { onClose: () => void }) {
  const createMutation = useCreateVendorSpot();
  const { data: activeVendors = [] } = useActiveVendors();
  const { data: activeCategories = [] } = useActiveCategories();
  const { data: allCategories = [] } = useCategories();
  const categories =
    activeCategories.length > 0 ? activeCategories : allCategories;

  const keyRef = useRef(1);
  const [vendorId, setVendorId] = useState(
    activeVendors[0]?.id ? String(activeVendors[0].id) : "1",
  );
  const [rows, setRows] = useState<SpotRow[]>([
    { key: 0, categoryId: "", subCategoryId: "", heading: "", details: "" },
  ]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Default to first vendor once loaded (initial state mounts before fetch).
  useEffect(() => {
    if (activeVendors.length === 0) return;
    setVendorId((prev) => {
      if (prev && activeVendors.some((v) => String(v.id) === String(prev))) return prev;
      return String(activeVendors[0].id);
    });
  }, [activeVendors]);

  // Default empty rows to the first real category once loaded.
  useEffect(() => {
    if (categories.length === 0) return;
    setRows((prev) => {
      if (!prev.some((r) => !r.categoryId)) return prev;
      const fallback = String(categories[0].id);
      return prev.map((r) => (r.categoryId ? r : { ...r, categoryId: fallback }));
    });
  }, [categories]);

  const subsFor = (catId: string) =>
    categories.filter(
      (c) => String(c.parent_id ?? "") === String(catId) && String(c.id) !== String(catId),
    );

  const updateRow = (key: number, field: keyof Omit<SpotRow, "key">, val: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.key === key
          ? { ...r, [field]: val, ...(field === "categoryId" ? { subCategoryId: "" } : {}) }
          : r,
      ),
    );
  };

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      {
        key: keyRef.current++,
        categoryId: categories[0]?.id ? String(categories[0].id) : "",
        subCategoryId: "",
        heading: "",
        details: "",
      },
    ]);
  };

  const handleRemoveRow = (key: number) => {
    if (rows.length <= 1) {
      setErrorMessage("At least one spot quote is required.");
      return;
    }
    setRows((prev) => prev.filter((r) => r.key !== key));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    for (let i = 0; i < rows.length; i++) {
      if (!rows[i].heading.trim()) {
        setErrorMessage(`Please enter a spot quote heading in row #${i + 1}.`);
        return;
      }
      if (!rows[i].details.trim()) {
        setErrorMessage(`Please enter spot quote details in row #${i + 1}.`);
        return;
      }
      if (!rows[i].categoryId) {
        setErrorMessage(`Please select a category in row #${i + 1}.`);
        return;
      }
    }

    try {
      await createMutation.mutateAsync({
        products: rows.map((r) => ({
          vendor_id: Number(vendorId) || 1,
          category_id: r.categoryId,
          sub_category_id: r.subCategoryId || undefined,
          vendor_spot_heading: r.heading.trim(),
          vendor_spot_details: r.details.trim(),
        })),
      });
      onClose();
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, "Failed to save spot quote."));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>Create Spot Quote</DialogTitle>
        <DialogDescription>
          Publish one or more spot market quotes for a vendor in a single save.
        </DialogDescription>
      </DialogHeader>

      {errorMessage && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sp-vendor">Select Vendor (applies to all rows)</Label>
          <SearchableSelect
            id="sp-vendor"
            value={vendorId}
            onChange={setVendorId}
            options={
              activeVendors.length > 0
                ? activeVendors.map((v) => ({
                    value: String(v.id),
                    label: `${v.vendor_name} (${v.vendor_city || "No City"})`,
                  }))
                : [{ value: "1", label: "Vendor #1" }]
            }
            placeholder="Select vendor — type to search..."
            required
          />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Spot Quotes ({rows.length})
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddRow}
              className="h-7 gap-1.5 text-xs"
            >
              <Plus className="size-3" />
              <span>Add Quote</span>
            </Button>
          </div>

          <div className="flex max-h-[320px] flex-col gap-3 overflow-y-auto pr-1">
            {rows.map((row, idx) => (
              <div
                key={row.key}
                className="flex flex-col gap-2 rounded-lg border border-border/70 bg-muted/20 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-foreground">
                    #{idx + 1}
                  </span>
                  {rows.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveRow(row.key)}
                      className="size-7 p-0 text-destructive hover:bg-destructive/10"
                      title="Remove quote"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`sp-cat-${row.key}`}>Category</Label>
                    <SearchableSelect
                      id={`sp-cat-${row.key}`}
                      value={row.categoryId}
                      onChange={(val) => updateRow(row.key, "categoryId", val)}
                      options={categories.map((c) => ({
                        value: String(c.id),
                        label: `${c.categories_name} (ID: ${c.id})`,
                      }))}
                      placeholder="Select category"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`sp-subcat-${row.key}`}>Sub-Category</Label>
                    <SearchableSelect
                      id={`sp-subcat-${row.key}`}
                      value={row.subCategoryId}
                      onChange={(val) => updateRow(row.key, "subCategoryId", val)}
                      options={[
                        { value: "", label: "None" },
                        ...subsFor(row.categoryId).map((c) => ({
                          value: String(c.id),
                          label: `${c.categories_name} (ID: ${c.id})`,
                        })),
                      ]}
                      placeholder="Select sub-category"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`sp-heading-${row.key}`}>
                    Spot Heading <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`sp-heading-${row.key}`}
                    value={row.heading}
                    onChange={(e) => updateRow(row.key, "heading", e.target.value)}
                    placeholder="e.g. EDIBLE OIL or SUNFLOWER OIL"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`sp-details-${row.key}`}>
                    Spot Details / Offer <span className="text-destructive">*</span>
                  </Label>
                  <textarea
                    id={`sp-details-${row.key}`}
                    rows={2}
                    value={row.details}
                    onChange={(e) => updateRow(row.key, "details", e.target.value)}
                    placeholder="e.g. Khopoli Seller Option / Prompt Dispatch"
                    className="w-full rounded-md border border-input bg-background p-2.5 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    required
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DialogFooter className="pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={createMutation.isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending
            ? "Saving..."
            : rows.length > 1
              ? `Create ${rows.length} Spot Quotes`
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
      <DialogContent
        className={`max-h-[90vh] overflow-y-auto ${spot ? "max-w-md" : "max-w-lg"}`}
      >
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
  if (!effectiveSpot) {
    return <VendorSpotCreateContent key="new-spot" onClose={onClose} />;
  }
  return (
    <VendorSpotEditContent
      key={`${effectiveSpot.id}-${effectiveSpot.vendor_spot_status ?? ""}-${effectiveSpot.vendor_spot_heading?.length ?? 0}`}
      spot={effectiveSpot}
      onClose={onClose}
    />
  );
}

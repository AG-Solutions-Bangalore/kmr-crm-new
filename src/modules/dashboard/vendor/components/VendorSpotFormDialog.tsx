import { useEffect, useRef, useState } from "react";
import { Copy, Loader2, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { getApiErrorMessage } from "@/lib/axios.ts";
import { SearchableSelect } from "@/components/common/SearchableSelect.tsx";
import {
  CategorySelectWithCreate,
  VendorSelectWithCreate,
} from "@/components/common/EntitySelectWithCreate.tsx";
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
import {
  getParentCategories,
  getSubCategories,
  mergeCategories,
} from "@/lib/category-tree.ts";
import type { VendorSpotItem } from "../types/vendor.types.ts";

interface VendorSpotFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spot?: VendorSpotItem | null;
}

/* ------------------------------------------------------------------ */

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
  const { data: activeCategories = [], isLoading: activeCatsLoading } = useActiveCategories();
  const { data: allCategories = [], isLoading: allCatsLoading } = useCategories();
  const categories = mergeCategories(activeCategories, allCategories);
  const parentCategories = getParentCategories(categories);
  const catsLoading = activeCatsLoading || allCatsLoading;

  const [categoryId, setCategoryId] = useState(String(spot.category_id));
  const [subCategoryId, setSubCategoryId] = useState(
    spot?.sub_category_id ? String(spot.sub_category_id) : "",
  );
  const [heading, setHeading] = useState(spot?.vendor_spot_heading || "");
  const [details, setDetails] = useState(spot?.vendor_spot_details || "");
  const [status, setStatus] = useState(spot?.vendor_spot_status || "Active");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Strict linking: sub-category is always the direct children of the
  // selected category. Nothing is shown until a category is picked.
  const directChildren = getSubCategories(categories, categoryId);
  const hasDirectChildren = directChildren.length > 0;
  const subOptionsBase = directChildren;

  // Reset sub-category when the category changes and the current value is
  // not one of its direct children.
  useEffect(() => {
    if (
      subCategoryId &&
      categoryId &&
      hasDirectChildren &&
      !directChildren.some((c) => String(c.id) === String(subCategoryId))
    ) {
      setSubCategoryId("");
    }
    if (!categoryId && subCategoryId) {
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
    <form
      onSubmit={handleSubmit}
      onKeyDown={(e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
          e.preventDefault();
          void handleSubmit(e);
        }
      }}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col space-y-1.5 text-center sm:text-left">
        <h2 className="text-lg font-semibold leading-none tracking-tight">Edit Spot Quote</h2>
        <p className="text-sm text-muted-foreground">
          {`Update spot quote #${spot?.id} (${spot?.vendor_name || `Vendor #${spot?.vendor_id}`}).`}
        </p>
      </div>

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
            <CategorySelectWithCreate
              id="sp-cat"
              value={categoryId}
              onChange={(val) => {
                setCategoryId(val);
              }}
              options={parentCategories.map((c) => ({
                value: String(c.id),
                label: c.categories_name,
              }))}
              placeholder="Search category — or + to create one"
              required
            />
            {spot?.categories_name && (
              <p className="text-xs text-muted-foreground">
                Current: {spot.categories_name}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sp-subcat">
              Sub-Category {hasDirectChildren ? `(${directChildren.length})` : ""}
            </Label>
            <SearchableSelect
              id="sp-subcat"
              value={subCategoryId}
              onChange={setSubCategoryId}
              options={[
                { value: "", label: hasDirectChildren ? "None" : "(No sub-categories)" },
                ...(subCategoryId &&
                !subOptionsBase.some((c) => String(c.id) === String(subCategoryId))
                  ? [
                      {
                        value: subCategoryId,
                        label: `Current: ${spot?.sub_categories_name || `#${subCategoryId}`}`,
                      },
                    ]
                  : []),
                ...subOptionsBase.map((c) => ({
                  value: String(c.id),
                  label: c.categories_name,
                })),
              ]}
              placeholder={
                !categoryId
                  ? "Select category first"
                  : catsLoading
                    ? "Loading sub-categories..."
                    : hasDirectChildren
                      ? `Select sub-category (${directChildren.length}) — type to search`
                      : "No sub-categories for this category"
              }
              disabled={!categoryId || catsLoading}
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

      <div className="flex flex-row items-center justify-between pt-2">
        <span className="hidden text-xs text-muted-foreground sm:inline">
          <kbd className="rounded border border-border/80 bg-muted px-1.5 py-0.5 font-mono text-[10px]">
            Ctrl+Enter
          </kbd>{" "}
          to save
        </span>
        <div className="flex gap-2">
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
        </div>
      </div>
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
  const { data: activeCategories = [], isLoading: activeCatsLoading } = useActiveCategories();
  const { data: allCategories = [], isLoading: allCatsLoading } = useCategories();
  const categories = mergeCategories(activeCategories, allCategories);
  const parentCategories = getParentCategories(categories);
  const catsLoading = activeCatsLoading || allCatsLoading;

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

  // Strict linking: no category -> no sub-categories.
  const subsFor = (catId: string) => getSubCategories(categories, catId);

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
        categoryId: "",
        subCategoryId: "",
        heading: "",
        details: "",
      },
    ]);
  };

  const handleDuplicateRow = (key: number) => {
    const rowToClone = rows.find((r) => r.key === key);
    if (!rowToClone) return;
    const newRow: SpotRow = {
      ...rowToClone,
      key: keyRef.current++,
    };
    setRows((prev) => {
      const idx = prev.findIndex((r) => r.key === key);
      if (idx === -1) return [...prev, newRow];
      const copy = [...prev];
      copy.splice(idx + 1, 0, newRow);
      return copy;
    });
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
    <form
      onSubmit={handleSubmit}
      onKeyDown={(e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
          e.preventDefault();
          void handleSubmit(e);
        }
      }}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col space-y-1.5 text-center sm:text-left">
        <h2 className="text-lg font-semibold leading-none tracking-tight">Create Spot Quote</h2>
        <p className="text-sm text-muted-foreground">
          Publish one or more spot market quotes for a vendor in a single save.
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sp-vendor">Select Vendor (applies to all rows)</Label>
          <VendorSelectWithCreate
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
            placeholder="Select vendor — or + to create one"
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

          <div className="flex max-h-[560px] flex-col gap-3 overflow-y-auto pr-1">
            {rows.map((row, idx) => (
              <div
                key={row.key}
                className="flex flex-col gap-2 rounded-lg border border-border/70 bg-muted/20 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-foreground">
                    #{idx + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicateRow(row.key)}
                      className="size-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                      title="Duplicate this quote"
                    >
                      <Copy className="size-3.5" />
                    </Button>
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
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`sp-cat-${row.key}`}>Category</Label>
                    <CategorySelectWithCreate
                      id={`sp-cat-${row.key}`}
                      value={row.categoryId}
                      onChange={(val) => updateRow(row.key, "categoryId", val)}
                      options={parentCategories.map((c) => ({
                        value: String(c.id),
                        label: c.categories_name,
                      }))}
                      placeholder="Search category — or +"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`sp-subcat-${row.key}`}>Sub-Category</Label>
                    <SearchableSelect
                      id={`sp-subcat-${row.key}`}
                      value={row.subCategoryId}
                      onChange={(val) => updateRow(row.key, "subCategoryId", val)}
                      options={(() => {
                        const list = subsFor(row.categoryId);
                        return [
                          { value: "", label: list.length > 0 ? "None" : "(No sub-categories)" },
                          ...list.map((c) => ({
                            value: String(c.id),
                            label: c.categories_name,
                          })),
                        ];
                      })()}
                      placeholder={
                        !row.categoryId
                          ? "Select category first"
                          : catsLoading
                            ? "Loading sub-categories..."
                            : (() => {
                                const list = subsFor(row.categoryId);
                                return list.length > 0
                                  ? `Select sub-category (${list.length}) — type to search`
                                  : "No sub-categories for this category";
                              })()
                      }
                      disabled={!row.categoryId || catsLoading}
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

      <div className="flex flex-row items-center justify-between pt-2">
        <span className="hidden text-xs text-muted-foreground sm:inline">
          <kbd className="rounded border border-border/80 bg-muted px-1.5 py-0.5 font-mono text-[10px]">
            Ctrl+Enter
          </kbd>{" "}
          to save all quotes
        </span>
        <div className="flex gap-2">
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
        </div>
      </div>
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

export function VendorSpotFormContainer({
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

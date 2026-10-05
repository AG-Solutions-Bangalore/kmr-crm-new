import { useRef, useState } from "react";
import { AlertCircle, IndianRupee, Loader2, Plus, Trash2 } from "lucide-react";
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
import { SearchableSelect } from "@/components/common/SearchableSelect.tsx";
import {
  CategorySelectWithCreate,
  VendorSelectWithCreate,
} from "@/components/common/EntitySelectWithCreate.tsx";
import { useActiveVendors, useCreateVendorLive, useCreateVendorRate } from "../hook/useVendor.ts";
import {
  useActiveCategories,
  useCategories,
} from "../../category/hook/useCategory.ts";

interface VendorRateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "live" | "standard";
}

interface RateRow {
  key: number;
  categoryId: string;
  subCategoryId: string;
  productName: string;
  productSize: string;
  productRate: string;
}

const blankRow = (key: number): RateRow => ({
  key,
  categoryId: "1",
  subCategoryId: "1",
  productName: "",
  productSize: "",
  productRate: "",
});

export function VendorRateFormDialog({
  open,
  onOpenChange,
  type,
}: VendorRateFormDialogProps) {
  const { data: vendors = [] } = useActiveVendors();
  const { data: activeCategories = [] } = useActiveCategories();
  const { data: allCategories = [] } = useCategories();
  const categories = activeCategories.length > 0 ? activeCategories : allCategories;
  const createLiveMutation = useCreateVendorLive();
  const createRateMutation = useCreateVendorRate();

  const subsFor = (catId: string) =>
    categories.filter(
      (c) => String(c.parent_id ?? "") === String(catId) && String(c.id) !== String(catId),
    );

  const [vendorId, setVendorId] = useState<string>("");
  const [rows, setRows] = useState<RateRow[]>([blankRow(0)]);
  const keyRef = useRef(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isSubmitting = createLiveMutation.isPending || createRateMutation.isPending;

  const updateRow = (key: number, field: keyof Omit<RateRow, "key">, val: string) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: val } : r)));
  };

  const handleAddRow = () => {
    setRows((prev) => [...prev, blankRow(keyRef.current++)]);
  };

  const handleRemoveRow = (key: number) => {
    if (rows.length <= 1) {
      setErrorMessage("At least one product is required.");
      return;
    }
    setRows((prev) => prev.filter((r) => r.key !== key));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const vId = vendorId || (vendors[0]?.id ? String(vendors[0].id) : "1");

    for (let i = 0; i < rows.length; i++) {
      if (!rows[i].productName.trim()) {
        setErrorMessage(`Product name is required in row #${i + 1}.`);
        return;
      }
      if (!rows[i].productRate.trim()) {
        setErrorMessage(`Product rate is required in row #${i + 1}.`);
        return;
      }
    }

    const payload = {
      products: rows.map((r) => ({
        vendor_id: Number(vId),
        category_id: Number(r.categoryId) || 1,
        sub_category_id: Number(r.subCategoryId) || 1,
        vendor_product: r.productName.trim(),
        vendor_product_size: r.productSize.trim() || "Unit",
        vendor_product_rate: r.productRate.trim(),
      })),
    };

    try {
      if (type === "live") {
        await createLiveMutation.mutateAsync(payload);
      } else {
        await createRateMutation.mutateAsync(payload);
      }
      onOpenChange(false);
      // Reset form
      setRows([blankRow(keyRef.current++)]);
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, `Failed to create ${type === "live" ? "live" : "standard"} rate.`));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IndianRupee className="size-5 text-primary" />
            <span>Add {type === "live" ? "Live Rate" : "Standard Rate"}</span>
          </DialogTitle>
          <DialogDescription>
            Add one or more products — all rows are submitted together in a single API call.
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
            <Label htmlFor="vendor_select">Vendor (applies to all rows)</Label>
            <VendorSelectWithCreate
              id="vendor_select"
              value={vendorId || (vendors[0]?.id ? String(vendors[0].id) : "1")}
              onChange={setVendorId}
              options={
                vendors.length > 0
                  ? vendors.map((v) => ({
                      value: String(v.id),
                      label: `${v.vendor_name} (${v.vendor_city || "No City"})`,
                    }))
                  : [{ value: "1", label: "Default Vendor (#1)" }]
              }
              placeholder="Select vendor — or + to create one"
              required
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Products ({rows.length})
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddRow}
                className="h-7 gap-1.5 text-xs"
              >
                <Plus className="size-3" />
                <span>Add Product</span>
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
                        title="Remove product"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`rate-product-${row.key}`}>
                      Product Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`rate-product-${row.key}`}
                      placeholder="e.g. Sunflower Oil, Mustard Refined..."
                      value={row.productName}
                      onChange={(e) => updateRow(row.key, "productName", e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`rate-size-${row.key}`}>Size / Unit</Label>
                      <Input
                        id={`rate-size-${row.key}`}
                        placeholder="e.g. 15 kg Tin, 1 Ltr Pouch"
                        value={row.productSize}
                        onChange={(e) => updateRow(row.key, "productSize", e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`rate-price-${row.key}`}>
                        Rate (₹) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id={`rate-price-${row.key}`}
                        type="number"
                        placeholder="e.g. 1450"
                        value={row.productRate}
                        onChange={(e) => updateRow(row.key, "productRate", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`rate-cat-${row.key}`}>Category</Label>
                      <CategorySelectWithCreate
                        id={`rate-cat-${row.key}`}
                        value={row.categoryId}
                        onChange={(val) => {
                          updateRow(row.key, "categoryId", val);
                          updateRow(row.key, "subCategoryId", "");
                        }}
                        options={categories.map((c) => ({
                          value: String(c.id),
                          label: `${c.categories_name} (ID: ${c.id})`,
                        }))}
                        placeholder="Select category — or +"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`rate-subcat-${row.key}`}>Sub-Category</Label>
                      <SearchableSelect
                        id={`rate-subcat-${row.key}`}
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
                </div>
              ))}
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
              <span>
                Save {rows.length > 1 ? `${rows.length} Rates` : "Rate"}
              </span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

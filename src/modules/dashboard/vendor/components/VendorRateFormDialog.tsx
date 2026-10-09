import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Copy,
  IndianRupee,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Dialog, DialogContent } from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { PATHS } from "@/constants/paths.ts";
import { getApiErrorMessage } from "@/lib/axios.ts";
import {
  CategorySelectWithCreate,
  SubCategorySelectWithCreate,
  VendorSelectWithCreate,
} from "@/components/common/EntitySelectWithCreate.tsx";
import { filterVendorsByTrade, type VendorTradeType } from "../lib/vendor-trade.ts";
import {
  useActiveVendors,
  useCreateVendorLive,
  useCreateVendorRate,
  useUpdateVendorLive,
  useUpdateVendorRate,
  useVendorLive,
  useVendorLives,
  useVendorRate,
  useVendorRates,
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
import type { VendorRateProduct } from "../types/vendor.types.ts";

interface VendorRateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "live" | "standard";
  rate?: VendorRateProduct | null;
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
  categoryId: "",
  subCategoryId: "",
  productName: "",
  productSize: "",
  productRate: "",
});

/* ------------------------------------------------------------------ */
/* Edit — single rate (PUT /vendor-live/:id or PUT /vendor-rate/:id).   */
/* Body: { category_id, sub_category_id, vendor_product,                */
/*         vendor_product_size, vendor_product_rate,                     */
/*         vendor_product_status }.                                       */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Siblings — other products from the same vendor. Edit is per-record  */
/* (PUT /vendor-rate/:id), so products added via "+ Add Product" become */
/* separate rows. This section lists them inline so nothing looks lost. */
/* ------------------------------------------------------------------ */

function SiblingRateList({
  vendorId,
  currentId,
}: {
  vendorId: number | string;
  currentId: number | string;
}) {
  const navigate = useNavigate();
  const { data, isLoading } = useVendorRates(1, 50, "");
  const siblings = (data?.items ?? []).filter(
    (s) => String(s.vendor_id) === String(vendorId) && String(s.id) !== String(currentId),
  );

  return (
    <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Other products from this vendor ({siblings.length})
        </span>
        {isLoading && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
      </div>
      {siblings.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">
          {isLoading ? "Loading..." : "No other products yet — use Add Product below."}
        </p>
      ) : (
        <div className="mt-2 flex flex-col gap-1.5">
          {siblings.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-card px-2.5 py-1.5 text-xs"
            >
              <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                {s.vendor_product}
                <span className="ml-1.5 font-normal text-muted-foreground">
                  {s.vendor_product_size || "Unit"} • ₹{s.vendor_product_rate}
                </span>
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => navigate(PATHS.vendorRateEdit.replace(":id", String(s.id)))}
                className="h-7 gap-1 px-2 text-xs"
                title="Edit"
              >
                <Pencil className="size-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SiblingLiveList({
  vendorId,
  currentId,
}: {
  vendorId: number | string;
  currentId: number | string;
}) {
  const navigate = useNavigate();
  const { data, isLoading } = useVendorLives(1, 50, "");
  const siblings = (data?.items ?? []).filter(
    (s) => String(s.vendor_id) === String(vendorId) && String(s.id) !== String(currentId),
  );

  return (
    <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Other products from this vendor ({siblings.length})
        </span>
        {isLoading && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
      </div>
      {siblings.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">
          {isLoading ? "Loading..." : "No other products yet — use Add Product below."}
        </p>
      ) : (
        <div className="mt-2 flex flex-col gap-1.5">
          {siblings.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-card px-2.5 py-1.5 text-xs"
            >
              <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                {s.vendor_product}
                <span className="ml-1.5 font-normal text-muted-foreground">
                  {s.vendor_product_size || "Unit"} • ₹{s.vendor_product_rate}
                </span>
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => navigate(PATHS.vendorLiveEdit.replace(":id", String(s.id)))}
                className="h-7 gap-1 px-2 text-xs"
                title="Edit"
              >
                <Pencil className="size-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VendorRateEditContent({
  rate,
  type,
  onClose,
}: {
  rate: VendorRateProduct;
  type: "live" | "standard";
  onClose: () => void;
}) {
  const updateLiveMutation = useUpdateVendorLive();
  const updateRateMutation = useUpdateVendorRate();
  const updateMutation =
    type === "live" ? updateLiveMutation : updateRateMutation;

  const { data: activeCategories = [], isLoading: activeCatsLoading } =
    useActiveCategories();
  const { data: allCategories = [], isLoading: allCatsLoading } =
    useCategories();
  const categories = mergeCategories(activeCategories, allCategories);
  const parentCategories = getParentCategories(categories);
  const catsLoading = activeCatsLoading || allCatsLoading;

  const [categoryId, setCategoryId] = useState(String(rate.category_id ?? "1"));
  const [subCategoryId, setSubCategoryId] = useState(
    rate.sub_category_id ? String(rate.sub_category_id) : "",
  );
  const [productName, setProductName] = useState(rate.vendor_product || "");
  const [productSize, setProductSize] = useState(
    rate.vendor_product_size || "",
  );
  const [productRate, setProductRate] = useState(
    String(rate.vendor_product_rate ?? ""),
  );
  const [status, setStatus] = useState(rate.vendor_product_status || "Active");
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

  const isSaving = updateMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!categoryId) {
      setErrorMessage("Please select a category.");
      return;
    }
    if (!productName.trim()) {
      setErrorMessage("Product name is required.");
      return;
    }
    if (!productRate.trim()) {
      setErrorMessage("Product rate is required.");
      return;
    }

    console.log(`[VendorRate:${type}:edit] submit id=${rate.id}`, {
      type,
      rateId: rate.id,
      primary: { categoryId, subCategoryId, productName, productSize, productRate, status },
    });

    try {
      await updateMutation.mutateAsync({
        id: rate.id,
        payload: {
          category_id: categoryId,
          sub_category_id: subCategoryId || undefined,
          vendor_product: productName.trim(),
          vendor_product_size: productSize.trim() || "Unit",
          vendor_product_rate: productRate.trim(),
          vendor_product_status: status,
        },
      });
      console.log(`[VendorRate:${type}:edit] primary PUT ok id=${rate.id}`);

      onClose();
    } catch (err) {
      console.error(`[VendorRate:${type}:edit] failed id=${rate.id}`, err);
      setErrorMessage(getApiErrorMessage(err, "Failed to update rates."));
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
        <h2 className="flex items-center gap-2 text-lg font-semibold leading-none tracking-tight">
          <IndianRupee className="size-5 text-primary" />
          <span>Edit {type === "live" ? "Live Rate" : "Standard Rate"}</span>
        </h2>
        <p className="text-sm text-muted-foreground">
          Update product, size, rate, category and status. Sends{" "}
          <code className="font-mono">
            PUT /{type === "live" ? "vendor-live" : "vendor-rate"}/{rate.id}
          </code>
          .
        </p>
      </div>

      {errorMessage && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs">
        <span className="font-semibold uppercase tracking-wider text-muted-foreground">
          Vendor (read-only)
        </span>
        <p className="mt-0.5 font-medium text-foreground">
          {rate.vendor_name || `Vendor #${rate.vendor_id}`}
          {rate.vendor_mobile ? ` • ${rate.vendor_mobile}` : ""}
        </p>
      </div>

      {/* Primary Product */}
      <div className="rounded-lg border border-border/70 bg-card p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">#1 (Editing)</span>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-rate-product">
            Product Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="edit-rate-product"
            placeholder="e.g. EDIBLE OIL"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-rate-size">Size / Unit</Label>
            <Input
              id="edit-rate-size"
              placeholder="e.g. 10 kg"
              value={productSize}
              onChange={(e) => setProductSize(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-rate-price">
              Rate (₹) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-rate-price"
              type="number"
              placeholder="e.g. 1370"
              value={productRate}
              onChange={(e) => setProductRate(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-rate-cat">Category</Label>
            <CategorySelectWithCreate
              id="edit-rate-cat"
              direction="up"
              value={categoryId}
              onChange={(val) => {
                setCategoryId(val);
              }}
              options={parentCategories.map((c) => ({
                value: String(c.id),
                label: c.categories_name,
              }))}
              placeholder="Search category — or +"
            />
            {rate.categories_name && (
              <p className="text-xs text-muted-foreground">
                Current: {rate.categories_name}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-rate-subcat">Sub-Category</Label>
            <SubCategorySelectWithCreate
              id="edit-rate-subcat"
              parentId={categoryId}
              direction="up"
              value={subCategoryId}
              onChange={setSubCategoryId}
              clearable
              options={[
                ...(subCategoryId &&
                !subOptionsBase.some(
                  (c) => String(c.id) === String(subCategoryId),
                )
                  ? [
                      {
                        value: subCategoryId,
                        label: `Current: ${rate.sub_categories_name || `#${subCategoryId}`}`,
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
                      ? "Select sub-category — type to search"
                      : "No sub-categories for this category"
              }
              disabled={!categoryId || catsLoading}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-rate-status">Status</Label>
          <select
            id="edit-rate-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Siblings — same vendor, separate records (see log [VendorRate:*:edit]). */}
      {type === "live" ? (
        <SiblingLiveList vendorId={rate.vendor_id} currentId={rate.id} />
      ) : (
        <SiblingRateList vendorId={rate.vendor_id} currentId={rate.id} />
      )}

      <div className="mt-2 flex flex-row items-center justify-between">
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
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="gap-2"
          >
            {isSaving && (
              <Loader2 className="size-4 animate-spin" />
            )}
            <span>Update Rate</span>
          </Button>
        </div>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Create — multiple products in one API call.                         */
/* ------------------------------------------------------------------ */

function VendorRateCreateContent({
  type,
  onClose,
}: {
  type: "live" | "standard";
  onClose: () => void;
}) {
  const { data: vendors = [] } = useActiveVendors();
  const { data: activeCategories = [], isLoading: activeCatsLoading } =
    useActiveCategories();
  const { data: allCategories = [], isLoading: allCatsLoading } =
    useCategories();
  const categories = mergeCategories(activeCategories, allCategories);
  const parentCategories = getParentCategories(categories);
  const catsLoading = activeCatsLoading || allCatsLoading;
  const createLiveMutation = useCreateVendorLive();
  const createRateMutation = useCreateVendorRate();

  // Strict linking: no category -> no sub-categories.
  const subsFor = (catId: string) => getSubCategories(categories, catId);

  const tradeKey: VendorTradeType = type === "live" ? "live" : "rate";
  const defaultTradeId = type === "live" ? "1" : "2";
  const filteredVendors = useMemo(
    () => filterVendorsByTrade(vendors, tradeKey),
    [vendors, tradeKey],
  );

  const [vendorId, setVendorId] = useState<string>("");
  const [rows, setRows] = useState<RateRow[]>([blankRow(0)]);
  const keyRef = useRef(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [focusedKey, setFocusedKey] = useState<number | null>(null);

  useEffect(() => {
    if (filteredVendors.length === 0) return;
    setVendorId((prev) => {
      if (prev && filteredVendors.some((v) => String(v.id) === String(prev))) {
        return prev;
      }
      return String(filteredVendors[0].id);
    });
  }, [filteredVendors]);

  const isSubmitting =
    createLiveMutation.isPending || createRateMutation.isPending;

  const updateRow = (
    key: number,
    field: keyof Omit<RateRow, "key">,
    val: string,
  ) => {
    setRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, [field]: val } : r)),
    );
  };

  const handleAddRow = () => {
    setRows((prev) => [...prev, blankRow(keyRef.current++)]);
  };

  const handleAddSize = () => {
    const prevRow = rows[rows.length - 1];
    const newRow: RateRow = {
      key: keyRef.current++,
      categoryId: prevRow ? prevRow.categoryId : "",
      subCategoryId: prevRow ? prevRow.subCategoryId : "",
      productName: prevRow ? prevRow.productName : "",
      productSize: "",
      productRate: "",
    };
    setRows((prev) => [...prev, newRow]);
  };

  const handleDuplicateRow = (key: number) => {
    const rowToClone = rows.find((r) => r.key === key);
    if (!rowToClone) return;
    const newRow: RateRow = {
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
      setErrorMessage("At least one product is required.");
      return;
    }
    setRows((prev) => prev.filter((r) => r.key !== key));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const vId =
      vendorId ||
      (filteredVendors[0]?.id ? String(filteredVendors[0].id) : "1");

    console.log(`[VendorRate:${type}:create] submit rows=${rows.length}`, {
      type,
      vendorId: vId,
      rows,
    });

    for (let i = 0; i < rows.length; i++) {
      if (!rows[i].categoryId) {
        setErrorMessage(`Please select a category in row #${i + 1}.`);
        return;
      }
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
        category_id: Number(r.categoryId),
        ...(r.subCategoryId
          ? { sub_category_id: Number(r.subCategoryId) }
          : {}),
        vendor_product: r.productName.trim(),
        vendor_product_size: r.productSize.trim() || "Unit",
        vendor_product_rate: r.productRate.trim(),
      })),
    };

    console.log(`[VendorRate:${type}:create] payload products=${payload.products.length}`, payload);

    try {
      let result: unknown = null;
      if (type === "live") {
        result = await createLiveMutation.mutateAsync(payload);
      } else {
        result = await createRateMutation.mutateAsync(payload);
      }
      console.log(`[VendorRate:${type}:create] success response`, result);
      onClose();
      // Reset form
      setRows([blankRow(keyRef.current++)]);
    } catch (err) {
      console.error(`[VendorRate:${type}:create] failed`, err);
      setErrorMessage(
        getApiErrorMessage(
          err,
          `Failed to create ${type === "live" ? "live" : "standard"} rate.`,
        ),
      );
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
        <h2 className="flex items-center gap-2 text-lg font-semibold leading-none tracking-tight">
          <IndianRupee className="size-5 text-primary" />
          <span>Add {type === "live" ? "Live Rate" : "Standard Rate"}</span>
        </h2>
        <p className="text-sm text-muted-foreground">
          Add one or more products — all rows are submitted together in a single
          API call.
        </p>
      </div>

      {errorMessage && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="vendor_select">Vendor (applies to all rows)</Label>
        <VendorSelectWithCreate
          id="vendor_select"
          value={vendorId || (filteredVendors[0]?.id ? String(filteredVendors[0].id) : "")}
          onChange={setVendorId}
          defaultTrade={defaultTradeId}
          options={
            filteredVendors.length > 0
              ? filteredVendors.map((v) => ({
                  value: String(v.id),
                  label: `${v.vendor_name} (${v.vendor_city || "No City"})`,
                }))
              : []
          }
          placeholder={
            filteredVendors.length > 0
              ? `Select ${type === "live" ? "live" : "rate"} vendor — or + to create`
              : `No ${type === "live" ? "live" : "rate"} vendors available — click + to create`
          }
          required
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Products ({rows.length})
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddSize}
              className="h-7 gap-1.5 text-xs"
              title="Add size row keeping category, sub-category & product name"
            >
              <Plus className="size-3" />
              <span>Add Size</span>
            </Button>
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
        </div>

        <div className="flex flex-col gap-3">
          {rows.map((row, idx) => {
            const subCats = subsFor(row.categoryId);
            return (
              <div
                key={row.key}
                style={{ zIndex: focusedKey === row.key ? 50 : rows.length - idx }}
                onFocusCapture={() => setFocusedKey(row.key)}
                onBlurCapture={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setFocusedKey((k) => (k === row.key ? null : k));
                  }
                }}
                className="relative flex flex-col gap-2 rounded-lg border border-border/70 bg-card p-3 transition-colors hover:border-border"
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
                      title="Duplicate this row (copies name & categories)"
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
                        title="Remove product"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 items-start gap-2.5 sm:grid-cols-6">
                  {/* 1. Category */}
                  <div className="min-w-0 flex flex-col gap-1.5 sm:col-span-3 lg:col-span-2">
                    <Label htmlFor={`rate-cat-${row.key}`}>
                      Category <span className="text-destructive">*</span>
                    </Label>
                    <CategorySelectWithCreate
                      id={`rate-cat-${row.key}`}
                      direction="down"
                      value={row.categoryId}
                      onChange={(val) => {
                        updateRow(row.key, "categoryId", val);
                        updateRow(row.key, "subCategoryId", "");
                      }}
                      options={parentCategories.map((c) => ({
                        value: String(c.id),
                        label: c.categories_name,
                      }))}
                      placeholder="Search category — or +"
                    />
                  </div>

                  {/* 2. Sub-Category */}
                  <div className="min-w-0 flex flex-col gap-1.5 sm:col-span-3 lg:col-span-2">
                    <Label htmlFor={`rate-subcat-${row.key}`}>
                      Sub-Category
                    </Label>
                    <SubCategorySelectWithCreate
                      id={`rate-subcat-${row.key}`}
                      parentId={row.categoryId}
                      direction="down"
                      value={row.subCategoryId}
                      onChange={(val) =>
                        updateRow(row.key, "subCategoryId", val)
                      }
                      clearable
                      options={subCats.map((c) => ({
                        value: String(c.id),
                        label: c.categories_name,
                      }))}
                      placeholder={
                        !row.categoryId
                          ? "Select category first"
                          : catsLoading
                            ? "Loading..."
                            : subCats.length > 0
                              ? "Search sub-category"
                              : "No sub-categories"
                      }
                      disabled={!row.categoryId || catsLoading}
                    />
                  </div>

                  {/* 3. Product Name */}
                  <div className="min-w-0 flex flex-col gap-1.5 sm:col-span-6 lg:col-span-2">
                    <Label htmlFor={`rate-product-${row.key}`}>
                      Product Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`rate-product-${row.key}`}
                      placeholder="e.g. Sunflower Oil, Mustard..."
                      value={row.productName}
                      onChange={(e) =>
                        updateRow(row.key, "productName", e.target.value)
                      }
                      required
                    />
                  </div>

                  {/* 4. Size / Unit */}
                  <div className="min-w-0 flex flex-col gap-1.5 sm:col-span-3 lg:col-span-2">
                    <Label htmlFor={`rate-size-${row.key}`}>Size / Unit</Label>
                    <Input
                      id={`rate-size-${row.key}`}
                      placeholder="e.g. 15 kg Tin, 1 Ltr"
                      value={row.productSize}
                      onChange={(e) =>
                        updateRow(row.key, "productSize", e.target.value)
                      }
                    />
                  </div>

                  {/* 5. Rate (₹) */}
                  <div className="min-w-0 flex flex-col gap-1.5 sm:col-span-3 lg:col-span-2">
                    <Label htmlFor={`rate-price-${row.key}`}>
                      Rate (₹) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`rate-price-${row.key}`}
                      type="number"
                      placeholder="e.g. 1450"
                      value={row.productRate}
                      onChange={(e) =>
                        updateRow(row.key, "productRate", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-2 flex flex-row items-center justify-between">
        <span className="hidden text-xs text-muted-foreground sm:inline">
          <kbd className="rounded border border-border/80 bg-muted px-1.5 py-0.5 font-mono text-[10px]">
            Ctrl+Enter
          </kbd>{" "}
          to save all rows
        </span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
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
        </div>
      </div>
    </form>
  );
}

export function VendorRateFormDialog({
  open,
  onOpenChange,
  type,
  rate,
}: VendorRateFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-4xl lg:max-w-5xl"
      >
        {open && (
          <VendorRateFormContainer
            rateId={rate?.id}
            initialRate={rate}
            type={type}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export function VendorRateFormContainer({
  rateId,
  initialRate,
  type,
  onClose,
}: {
  rateId?: number;
  initialRate?: VendorRateProduct | null;
  type: "live" | "standard";
  onClose: () => void;
}) {
  // GET /vendor-live/:id or GET /vendor-rate/:id — fresh details for edit.
  const { data: detailedLive, isLoading: loadingLive } = useVendorLive(
    type === "live" ? (rateId ?? null) : null,
  );
  const { data: detailedRate, isLoading: loadingRate } = useVendorRate(
    type === "standard" ? (rateId ?? null) : null,
  );
  const isLoading = loadingLive || loadingRate;

  if (rateId && isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-sm text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-primary" />
        <span>Loading rate details from server...</span>
      </div>
    );
  }

  const effectiveRate =
    (type === "live" ? detailedLive : detailedRate) || initialRate;
  if (!effectiveRate) {
    return (
      <VendorRateCreateContent
        key={`new-${type}`}
        type={type}
        onClose={onClose}
      />
    );
  }
  return (
    <VendorRateEditContent
      key={`${type}-${effectiveRate.id}-${effectiveRate.vendor_product_status ?? ""}-${effectiveRate.vendor_product?.length ?? 0}`}
      rate={effectiveRate}
      type={type}
      onClose={onClose}
    />
  );
}

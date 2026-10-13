import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Save, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { getApiErrorMessage } from "@/lib/axios.ts";
import { resolveDynamicImageUrl, useApiNoImageUrl } from "@/lib/image.ts";
import { updateVendorLive, updateVendorRate } from "../api/vendor.api.ts";
import { vendorKeys } from "../hook/useVendor.ts";
import type { VendorRateProduct } from "../types/vendor.types.ts";

function VendorThumb({
  filename,
  name,
}: {
  filename?: string | null;
  name?: string;
}) {
  const [error, setError] = useState(false);
  const fallback = useApiNoImageUrl();
  const url = resolveDynamicImageUrl(filename, "vendor_images");
  const src = error ? fallback : url;
  return (
    <img
      src={src}
      alt={name || "Product"}
      loading="lazy"
      className="size-8 shrink-0 rounded-lg border border-border/60 object-cover bg-muted/20"
      onError={() => setError(true)}
    />
  );
}

interface VendorRateBulkEditViewProps {
  items: VendorRateProduct[];
  type: "live" | "standard";
  vendorName: string;
  isLoading: boolean;
  onCancel?: () => void;
}

interface RowState {
  id: number;
  price: string;
  error?: string | null;
  saved?: boolean;
}

/**
 * Vendor bulk-edit list view — rendered when a vendor filter is active.
 * 3 columns: Product | Size | Price (editable). One "Submit All" saves
 * every changed row via sequential PUT /vendor-live/:id or
 * PUT /vendor-rate/:id (backend has no batch endpoint — verified against
 * live API + Postman collection).
 */
export function VendorRateBulkEditView({
  items,
  type,
  vendorName,
  isLoading,
  onCancel,
}: VendorRateBulkEditViewProps) {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<Record<number, RowState>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [failedIds, setFailedIds] = useState<number[]>([]);

  // Initialise / re-sync editable prices whenever the vendor items change.
  useEffect(() => {
    setRows(() => {
      const next: Record<number, RowState> = {};
      for (const it of items) {
        next[it.id] = { id: it.id, price: String(it.vendor_product_rate ?? "") };
      }
      return next;
    });
    setSavedCount(0);
    setFailedIds([]);
  }, [items]);

  const changedRows = useMemo(
    () =>
      items.filter((it) => {
        const row = rows[it.id];
        if (!row) return false;
        return row.price.trim() !== String(it.vendor_product_rate ?? "").trim();
      }),
    [items, rows],
  );

  const invalidRows = useMemo(
    () =>
      changedRows.filter((it) => {
        const v = (rows[it.id]?.price ?? "").trim();
        if (!v) return true;
        const n = Number(v);
        return !Number.isFinite(n) || n < 0;
      }),
    [changedRows, rows],
  );

  const setPrice = (id: number, price: string) => {
    setRows((prev) => ({
      ...prev,
      [id]: { ...prev[id], id, price, error: null, saved: false },
    }));
  };

  const handleSubmitAll = async () => {
    if (changedRows.length === 0 || invalidRows.length > 0 || isSaving) return;
    setIsSaving(true);
    setFailedIds([]);
    let ok = 0;
    const failed: number[] = [];

    // Sequential PUTs — one per changed row, preserving all other fields.
    for (let i = 0; i < changedRows.length; i++) {
      const item = changedRows[i];
      const price = (rows[item.id]?.price ?? "").trim();
      try {
        const payload = {
          category_id: item.category_id,
          ...(item.sub_category_id !== undefined &&
          item.sub_category_id !== null &&
          String(item.sub_category_id) !== ""
            ? { sub_category_id: item.sub_category_id }
            : {}),
          vendor_product: item.vendor_product,
          vendor_product_size: item.vendor_product_size || "Unit",
          vendor_product_rate: price,
          vendor_product_status: item.vendor_product_status || "Active",
        };
        if (type === "live") {
          await updateVendorLive(item.id, payload);
        } else {
          await updateVendorRate(item.id, payload);
        }
        ok += 1;
        setRows((prev) => ({
          ...prev,
          [item.id]: { ...prev[item.id], saved: true, error: null },
        }));
        setSavedCount(ok);
      } catch (err) {
        failed.push(item.id);
        const msg = getApiErrorMessage(err, "Failed to update.");
        setRows((prev) => ({
          ...prev,
          [item.id]: { ...prev[item.id], error: msg, saved: false },
        }));
      }
    }

    setFailedIds(failed);
    setIsSaving(false);
    await queryClient.invalidateQueries({
      queryKey: type === "live" ? vendorKeys.lives() : vendorKeys.rates(),
    });

    if (failed.length === 0) {
      toast.success(`${ok} rate${ok === 1 ? "" : "s"} updated for ${vendorName}`);
    } else {
      toast.error(`${ok} updated, ${failed.length} failed. Retry the highlighted rows.`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-border/80 bg-card py-12 text-sm text-muted-foreground">
        <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span>Loading {vendorName} products...</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border/80 bg-card py-12 text-center text-sm text-muted-foreground">
        <p className="font-medium text-foreground">No products for {vendorName}</p>
        <p className="mt-1 text-xs">Try another vendor or clear the filter.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm">
          <span className="font-semibold text-foreground">{vendorName}</span>
          <span className="text-muted-foreground">
            {" "}
            • {items.length} product{items.length === 1 ? "" : "s"}
            {changedRows.length > 0 ? ` • ${changedRows.length} changed` : ""}
            {isSaving ? ` • Saving ${savedCount}/${changedRows.length}...` : ""}
          </span>
        </p>
        <div className="flex items-center gap-2 shrink-0">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isSaving}
              title="Cancel bulk edit and return to list"
              className="gap-1.5"
            >
              <X className="size-4" />
              <span>Cancel</span>
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => void handleSubmitAll()}
            disabled={changedRows.length === 0 || invalidRows.length > 0 || isSaving}
            className="gap-2 shrink-0"
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            <span>
              {isSaving
                ? `Saving ${savedCount}/${changedRows.length}...`
                : `Submit All (${changedRows.length})`}
            </span>
          </Button>
        </div>
      </div>

      {invalidRows.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>
            {invalidRows.length} row{invalidRows.length === 1 ? " has" : "s have"} an
            invalid price — enter a non-negative number.
          </span>
        </div>
      )}
      {failedIds.length > 0 && !isSaving && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>
            {failedIds.length} update{failedIds.length === 1 ? "" : "s"} failed
            (highlighted below). Fix and press Submit All again — only changed rows
            are retried.
          </span>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border/60 bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Product Name</th>
                <th className="w-36 px-4 py-3">Size</th>
                <th className="w-48 px-4 py-3">Price (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {items.map((item, index) => {
                const row = rows[item.id];
                const original = String(item.vendor_product_rate ?? "").trim();
                const isChanged = row && row.price.trim() !== original;
                const invalid =
                  isChanged &&
                  (() => {
                    const v = row.price.trim();
                    if (!v) return true;
                    const n = Number(v);
                    return !Number.isFinite(n) || n < 0;
                  })();
                const failed = failedIds.includes(item.id) || Boolean(row?.error);

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors hover:bg-muted/30 ${
                      failed
                        ? "bg-destructive/5"
                        : isChanged
                          ? "bg-amber-500/5"
                          : ""
                    }`}
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 shrink-0 text-xs font-mono text-muted-foreground/60">
                          {index + 1}.
                        </span>
                        <VendorThumb
                          filename={item.vendor_image}
                          name={item.vendor_product}
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-foreground">
                            {item.vendor_product}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {item.categories_name || `Cat #${item.category_id}`}
                            {item.sub_categories_name
                              ? ` / ${item.sub_categories_name}`
                              : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {item.vendor_product_size || "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="any"
                          data-price-input="true"
                          value={row?.price ?? ""}
                          onChange={(e) => setPrice(item.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const inputs = Array.from(
                                document.querySelectorAll<HTMLInputElement>(
                                  'input[data-price-input="true"]',
                                ),
                              );
                              const currIndex = inputs.indexOf(e.currentTarget);
                              if (currIndex >= 0 && currIndex < inputs.length - 1) {
                                inputs[currIndex + 1].focus();
                                inputs[currIndex + 1].select();
                              } else {
                                void handleSubmitAll();
                              }
                            }
                          }}
                          disabled={isSaving}
                          aria-label={`Price for ${item.vendor_product}`}
                          className={
                            invalid || failed
                              ? "border-destructive focus-visible:ring-destructive"
                              : isChanged
                                ? "border-amber-500/60 font-semibold"
                                : ""
                          }
                        />
                        {row?.saved && !isChanged && (
                          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                        )}
                      </div>
                      {row?.error && (
                        <p className="mt-1 text-[11px] text-destructive">
                          {row.error}
                        </p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Press <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">Enter</kbd> to move to next price, then submit.
        </p>
        <div className="flex items-center gap-2 shrink-0">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSaving}
              title="Cancel bulk edit and return to list"
              className="gap-1.5"
            >
              <X className="size-4" />
              <span>Cancel</span>
            </Button>
          )}
          <Button
            onClick={() => void handleSubmitAll()}
            disabled={changedRows.length === 0 || invalidRows.length > 0 || isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            <span>
              {isSaving
                ? `Saving ${savedCount}/${changedRows.length}...`
                : changedRows.length > 0
                  ? `Submit All (${changedRows.length})`
                  : "Submit All"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}

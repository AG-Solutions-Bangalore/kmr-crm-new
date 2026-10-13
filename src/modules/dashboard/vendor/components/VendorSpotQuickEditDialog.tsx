import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  ClipboardPaste,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Dialog, DialogContent } from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { getApiErrorMessage } from "@/lib/axios.ts";
import { useUpdateVendorSpot } from "../hook/useVendor.ts";
import type { VendorSpotItem } from "../types/vendor.types.ts";

interface VendorSpotQuickEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: VendorSpotItem | null;
}

/**
 * Operator-first spot update: paste the whole WhatsApp message, one click
 * takes the first line as the title, review, update. Category / vendor /
 * status are preserved from the row via the existing PUT /vendor-spot/:id.
 */
export function VendorSpotQuickEditDialog({
  open,
  onOpenChange,
  item,
}: VendorSpotQuickEditDialogProps) {
  const updateMutation = useUpdateVendorSpot();
  const detailsRef = useRef<HTMLTextAreaElement>(null);

  const [heading, setHeading] = useState("");
  const [details, setDetails] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (open && item) {
      setHeading(item.vendor_spot_heading || "");
      setDetails(item.vendor_spot_details || "");
      setErrorMessage(null);
    }
  }, [open, item]);

  if (!item) return null;

  const isSaving = updateMutation.isPending;
  const vendorName = item.vendor_name || `Vendor #${item.vendor_id}`;
  const vendorInitial = vendorName.trim().charAt(0).toUpperCase() || "V";
  const categoryLabel =
    item.sub_categories_name &&
    item.sub_categories_name !== item.categories_name
      ? `${item.categories_name} / ${item.sub_categories_name}`
      : item.categories_name || "";

  const lineCount = details ? details.split("\n").length : 0;

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text || !text.trim()) {
        setErrorMessage("Clipboard is empty — copy the rates first.");
        return;
      }
      setErrorMessage(null);
      setDetails((prev) =>
        prev && prev.trim() ? `${prev.trimEnd()}\n${text}` : text,
      );
      detailsRef.current?.focus();
    } catch {
      setErrorMessage(
        "Clipboard blocked by browser — click inside the box and press Ctrl+V.",
      );
    }
  };

  const handleUseFirstLineAsTitle = () => {
    const firstLine = details
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l.length > 0);
    if (!firstLine) {
      setErrorMessage("Details are empty — paste the rates first.");
      return;
    }
    setErrorMessage(null);
    setHeading(firstLine);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!heading.trim()) {
      setErrorMessage("Title is missing — type it or take it from line 1 below.");
      return;
    }
    if (!details.trim()) {
      setErrorMessage("Rates text is empty — paste it from WhatsApp.");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: item.id,
        payload: {
          category_id: item.category_id,
          ...(item.sub_category_id !== undefined &&
          item.sub_category_id !== null &&
          String(item.sub_category_id) !== ""
            ? { sub_category_id: item.sub_category_id }
            : {}),
          vendor_spot_heading: heading.trim(),
          vendor_spot_details: details.trim(),
          vendor_spot_status: item.vendor_spot_status || "Active",
        },
      });
      onOpenChange(false);
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, "Failed to update spot quote."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-xl">
        {/* Vendor header */}
        <div className="flex items-center gap-3 border-b border-border/70 bg-muted/50 px-5 py-4 pr-12">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-lg font-bold text-primary">
            {vendorInitial}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Update spot
            </p>
            <p className="truncate text-base font-bold text-foreground">
              {vendorName}
            </p>
          </div>
          {categoryLabel && (
            <Badge
              variant="outline"
              className="hidden shrink-0 border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300 sm:inline-flex"
            >
              {categoryLabel}
            </Badge>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
              e.preventDefault();
              void handleSubmit(e);
            }
          }}
          className="flex max-h-[75vh] flex-col gap-4 overflow-y-auto px-5 py-4"
        >
          {errorMessage && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Step 1 — rates text (the main job) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="spot-quick-details" className="text-sm font-semibold">
                <span className="mr-1.5 inline-flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                  1
                </span>
                Paste rates text
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void handlePasteFromClipboard()}
                disabled={isSaving}
                className="h-8 gap-1.5 text-xs"
              >
                <ClipboardPaste className="size-3.5" />
                <span>Paste</span>
              </Button>
            </div>
            <textarea
              ref={detailsRef}
              id="spot-quick-details"
              rows={9}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={"Paste the full WhatsApp message here…\n\nNCDEX\nCastor Seed\nOCT : 8080 -51.00"}
              className="min-h-[200px] w-full resize-y rounded-lg border border-input bg-muted/30 p-3 font-mono text-[13px] leading-relaxed shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
              disabled={isSaving}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
            />
            <p className="text-[11px] text-muted-foreground">
              {lineCount} line{lineCount === 1 ? "" : "s"} • {details.length}{" "}
              characters • line breaks kept as-is
            </p>
          </div>

          {/* Step 2 — title */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="spot-quick-heading" className="text-sm font-semibold">
                <span className="mr-1.5 inline-flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                  2
                </span>
                Title
              </Label>
              <button
                type="button"
                onClick={handleUseFirstLineAsTitle}
                disabled={isSaving}
                className="cursor-pointer text-xs font-medium text-primary underline-offset-4 hover:underline disabled:pointer-events-none disabled:opacity-50"
              >
                Use first line as title →
              </button>
            </div>
            <Input
              id="spot-quick-heading"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="e.g. WHITE SESAME"
              required
              disabled={isSaving}
              className="h-10 text-sm font-semibold"
            />
          </div>

          {/* Footer */}
          <div className="-mx-5 -mb-4 mt-1 flex items-center justify-end gap-2 border-t border-border/70 bg-muted/50 px-5 py-3.5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="h-10 gap-2 px-5 font-semibold"
            >
              {isSaving && <Loader2 className="size-4 animate-spin" />}
              <span>{isSaving ? "Submitting..." : "Submit Spot"}</span>
              {!isSaving && <ArrowRight className="size-4" />}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

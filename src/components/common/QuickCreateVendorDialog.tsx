import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Plus, Settings2 } from "lucide-react";
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
import { extractCreatedId } from "@/lib/created-id.ts";
import { PATHS } from "@/constants/paths.ts";
import { fetchVendors } from "@/modules/dashboard/vendor/api/vendor.api.ts";
import { useCreateVendor } from "@/modules/dashboard/vendor/hook/useVendor.ts";

interface QuickCreateVendorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-filled vendor name from search. */
  initialName?: string;
  /** Default trade type ID (1 for Live, 2 for Rate, 3 for Spot). */
  defaultTrade?: string;
  /** Called with the new vendor id so the caller can auto-select it. */
  onCreated: (id: string) => void;
}

/**
 * Create the missing vendor WITHOUT leaving the current form
 * (Spot / Rate creation). Only name + mobile are required —
 * everything else can be completed later in the vendor manager.
 */
export function QuickCreateVendorDialog({
  open,
  onOpenChange,
  initialName = "",
  defaultTrade,
  onCreated,
}: QuickCreateVendorDialogProps) {
  const createMutation = useCreateVendor();

  const [name, setName] = useState(initialName);
  const [mobile, setMobile] = useState("");
  const [city, setCity] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const trimmed = initialName.trim();
      setName(trimmed);
      setMobile("");
      setCity("");
      setErrorMessage(null);
      setTimeout(() => {
        if (trimmed && mobileInputRef.current) {
          mobileInputRef.current.focus();
        } else if (nameInputRef.current) {
          nameInputRef.current.focus();
        }
      }, 50);
    }
  }, [open, initialName]);

  const reset = () => {
    setName("");
    setMobile("");
    setCity("");
    setErrorMessage(null);
  };

  const resolveNewId = async (res: unknown, finalMobile: string, finalName: string): Promise<string | null> => {
    const direct = extractCreatedId(res);
    if (direct) return direct;
    // Backend didn't echo the id — find it by unique mobile, then name.
    try {
      const items = await fetchVendors();
      const byMobile = items.find((v) => (v.vendor_mobile || "").trim() === finalMobile);
      if (byMobile) return String(byMobile.id);
      const byName = items.find(
        (v) => (v.vendor_name || "").trim().toLowerCase() === finalName.toLowerCase(),
      );
      if (byName) return String(byName.id);
    } catch {
      // fall through to null
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!name.trim()) {
      setErrorMessage("Vendor name is required.");
      return;
    }
    setSaving(true);
    try {
      const res = await createMutation.mutateAsync({
        vendor_name: name.trim(),
        vendor_mobile: mobile.trim(),
        vendor_email: "",
        vendor_city: city.trim(),
        vendor_trade: defaultTrade || "",
        vendor_address: "",
        vendor_status: "Active",
      });
      const id = await resolveNewId(res, mobile.trim(), name.trim());
      reset();
      onOpenChange(false);
      if (id) onCreated(id);
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, "Failed to create vendor."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
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
          <DialogHeader>
            <div className="flex items-center justify-between pr-6">
              <DialogTitle className="flex items-center gap-2 text-base">
                <Plus className="size-4 text-primary" />
                New Vendor
              </DialogTitle>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                Quick Add
              </span>
            </div>
            <DialogDescription className="text-xs">
              Just name + mobile — it will be selected automatically. Complete full profile later if needed.
            </DialogDescription>
          </DialogHeader>

          {errorMessage && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              {errorMessage}
            </div>
          )}

          <div className="grid gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="qv-name">
                Vendor Name <span className="text-destructive">*</span>
              </Label>
              <Input
                ref={nameInputRef}
                id="qv-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. HALDIYA PORT RATE"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="qv-mobile">Mobile</Label>
                <Input
                  ref={mobileInputRef}
                  id="qv-mobile"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/[^\d+\s-]/g, ""))}
                  placeholder="e.g. 9830000000"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="qv-city">City</Label>
                <Input
                  id="qv-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Kolkata"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 pt-2 sm:flex-col">
            <div className="flex w-full items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Link
                  to={PATHS.vendor}
                  tabIndex={-1}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary hover:underline"
                >
                  <Settings2 className="size-3" />
                  Full manager
                </Link>
                <span className="hidden text-[11px] text-muted-foreground/70 sm:inline">
                  <kbd className="rounded border border-border/80 bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                    Ctrl+Enter
                  </kbd>{" "}
                  to save
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={saving || createMutation.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving || createMutation.isPending}>
                  {saving || createMutation.isPending ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" /> Creating...
                    </>
                  ) : (
                    "Create & Select"
                  )}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
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
  onCreated,
}: QuickCreateVendorDialogProps) {
  const createMutation = useCreateVendor();

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [city, setCity] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
    if (!mobile.trim()) {
      setErrorMessage("Vendor mobile is required.");
      return;
    }
    setSaving(true);
    try {
      const res = await createMutation.mutateAsync({
        vendor_name: name.trim(),
        vendor_mobile: mobile.trim(),
        vendor_email: "",
        vendor_city: city.trim(),
        vendor_trade: "",
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="size-4 text-primary" />
              New Vendor
            </DialogTitle>
            <DialogDescription>
              Just name + mobile — it will be selected automatically. Complete the profile later if needed.
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
                id="qv-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. HALDIYA PORT RATE"
                required
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="qv-mobile">
                  Mobile <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="qv-mobile"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="e.g. 9830000000"
                  required
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
              <Link
                to={PATHS.vendor}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary hover:underline"
              >
                <Settings2 className="size-3" />
                Full vendor manager
              </Link>
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

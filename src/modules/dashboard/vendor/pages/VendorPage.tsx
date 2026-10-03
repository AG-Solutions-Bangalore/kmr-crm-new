import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Plus,
  RefreshCw,
  Sparkles,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { getApiErrorMessage } from "@/lib/axios.ts";
import { VendorFormDialog } from "../components/VendorFormDialog.tsx";
import { VendorTable } from "../components/VendorTable.tsx";
import { useVendors, useVendorSpots } from "../hook/useVendor.ts";
import type { Vendor } from "../types/vendor.types.ts";

export function VendorPage() {
  const {
    data: vendors = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = useVendors();

  const { data: spots = [] } = useVendorSpots();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const handleOpenCreate = () => {
    setSelectedVendor(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setDialogOpen(true);
  };

  const totalCount = vendors.length;
  const activeCount = vendors.filter((v) => v.vendor_status === "Active").length;
  const inactiveCount = totalCount - activeCount;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Vendors
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your network of vendors, trade categories, rates, and spot quotes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw
              className={`size-3.5 ${isFetching ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </Button>

          <Button size="sm" onClick={handleOpenCreate} className="gap-2">
            <Plus className="size-4" />
            <span>Add Vendor</span>
          </Button>
        </div>
      </div>

      {/* Backend API Error Notice */}
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Backend Error</p>
              <p className="mt-1 text-xs opacity-90">
                {getApiErrorMessage(error, "Could not load vendors from server.")}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="shrink-0 border-destructive/40 hover:bg-destructive/20"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Vendors
            </CardTitle>
            <Store className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? "—" : totalCount}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Active Vendors
            </CardTitle>
            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? "—" : activeCount}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Inactive Vendors
            </CardTitle>
            <Store className="size-4 text-muted-foreground opacity-60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? "—" : inactiveCount}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-sky-600 dark:text-sky-400">
              Vendor Spots
            </CardTitle>
            <Sparkles className="size-4 text-sky-600 dark:text-sky-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {spots.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Spots Highlight Card if spots exist */}
      {spots.length > 0 && (
        <Card className="border-sky-500/20 bg-sky-500/5 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-sky-950 dark:text-sky-100">
              <Sparkles className="size-4 text-sky-500" />
              Live Spot Highlights ({spots.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
              {spots.slice(0, 6).map((spot) => (
                <div
                  key={spot.id}
                  className="rounded-lg border border-sky-500/20 bg-card p-2.5 text-xs shadow-xs"
                >
                  <p className="font-semibold text-foreground">
                    {spot.vendor_spot_heading}
                  </p>
                  <p className="mt-0.5 text-muted-foreground line-clamp-2">
                    {spot.vendor_spot_details}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vendors Table */}
      <VendorTable
        vendors={vendors}
        isLoading={isLoading}
        onEdit={handleOpenEdit}
      />

      {/* Add / Edit Dialog */}
      <VendorFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        vendor={selectedVendor}
      />
    </div>
  );
}

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  IndianRupee,
  Plus,
  Radio,
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
import { useDebouncedValue } from "@/hooks/useDebouncedValue.ts";
import { VendorFormDialog } from "../components/VendorFormDialog.tsx";
import { VendorTable } from "../components/VendorTable.tsx";
import { VendorSpotFormDialog } from "../components/VendorSpotFormDialog.tsx";
import { VendorSpotTable } from "../components/VendorSpotTable.tsx";
import { VendorRateTable } from "../components/VendorRateTable.tsx";
import { VendorRateFormDialog } from "../components/VendorRateFormDialog.tsx";
import {
  useVendorsPage,
  useVendorSpots,
  useVendorLives,
  useVendorRates,
  useUpdateVendorLiveStatus,
  useUpdateVendorRateStatus,
} from "../hook/useVendor.ts";
import type { Vendor, VendorRateProduct, VendorSpotItem } from "../types/vendor.types.ts";

const PAGE_SIZE = 10;
type VendorTabKey = "vendors" | "spots" | "live" | "rates";

export function VendorPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get("tab");
  const activeTab: VendorTabKey =
    rawTab === "spots" || rawTab === "live" || rawTab === "rates" ? rawTab : "vendors";

  const setActiveTab = (tab: VendorTabKey) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (tab === "vendors") {
          next.delete("tab");
        } else {
          next.set("tab", tab);
        }
        return next;
      },
      { replace: true },
    );
  };
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim(), 400);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useVendorsPage(page, PAGE_SIZE, search);

  const vendors = data?.items ?? [];
  const totalCount = data?.total ?? 0;
  const totalPages = data?.lastPage ?? 1;

  // Clamp page if total shrinks (e.g. deleted last item on last page).
  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const {
    data: spots = [],
    isLoading: loadingSpots,
    refetch: refetchSpots,
    isFetching: fetchingSpots,
  } = useVendorSpots();

  const {
    data: liveRates = [],
    isLoading: loadingLive,
    error: errorLive,
    refetch: refetchLive,
    isFetching: fetchingLive,
  } = useVendorLives();

  const {
    data: standardRates = [],
    isLoading: loadingRates,
    error: errorRates,
    refetch: refetchRates,
    isFetching: fetchingRates,
  } = useVendorRates();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [spotDialogOpen, setSpotDialogOpen] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<VendorSpotItem | null>(null);
  const [rateDialogOpen, setRateDialogOpen] = useState(false);

  const liveStatusMutation = useUpdateVendorLiveStatus();
  const rateStatusMutation = useUpdateVendorRateStatus();

  const handleOpenCreate = () => {
    if (activeTab === "vendors") {
      setSelectedVendor(null);
      setDialogOpen(true);
    } else if (activeTab === "spots") {
      setSelectedSpot(null);
      setSpotDialogOpen(true);
    } else {
      setRateDialogOpen(true);
    }
  };

  const handleOpenEdit = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setDialogOpen(true);
  };

  const handleOpenSpotEdit = (spot: VendorSpotItem) => {
    setSelectedSpot(spot);
    setSpotDialogOpen(true);
  };

  const nextRateStatus = (item: VendorRateProduct) =>
    item.vendor_product_status === "Active" ? "Inactive" : "Active";

  const handleToggleLiveStatus = async (item: VendorRateProduct) => {
    await liveStatusMutation.mutateAsync({ id: item.id, status: nextRateStatus(item) });
  };

  const handleToggleRateStatus = async (item: VendorRateProduct) => {
    await rateStatusMutation.mutateAsync({ id: item.id, status: nextRateStatus(item) });
  };

  const handleRefresh = () => {
    void refetch();
    void refetchSpots();
    void refetchLive();
    void refetchRates();
  };

  const isRefreshing = isFetching || fetchingSpots || fetchingLive || fetchingRates;

  const activeCount = vendors.filter((v) => v.vendor_status === "Active").length;
  const inactiveCount = vendors.length - activeCount;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Vendors & Spot Quotes
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your network of vendors, trade categories, rates, and live spot quotes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw
              className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </Button>

          <Button size="sm" onClick={handleOpenCreate} className="gap-2">
            <Plus className="size-4" />
            <span>
              {activeTab === "vendors"
                ? "Add Vendor"
                : activeTab === "spots"
                ? "Create Spot Quote"
                : activeTab === "live"
                ? "Add Live Rate"
                : "Add Standard Rate"}
            </span>
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Commodity Rates
            </CardTitle>
            <IndianRupee className="size-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {liveRates.length + standardRates.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Switcher */}
      <div className="flex flex-wrap border-b border-border/80 gap-1 sm:gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("vendors")}
          className={`flex cursor-pointer items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "vendors"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Store className="size-4" />
          <span>Vendors</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {totalCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("spots")}
          className={`flex cursor-pointer items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "spots"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles className="size-4" />
          <span>Spot Rates</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {spots.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("live")}
          className={`flex cursor-pointer items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "live"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-rose-500" />
          </span>
          <Radio className="size-4" />
          <span>Live</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {liveRates.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("rates")}
          className={`flex cursor-pointer items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "rates"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <IndianRupee className="size-4" />
          <span>Rates</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {standardRates.length}
          </span>
        </button>
      </div>

      {/* Tab Content — vendor lists stay tables (no photos to preview). */}
      {activeTab === "vendors" ? (
        <VendorTable
          vendors={vendors}
          isLoading={isLoading}
          isFetching={isFetching}
          page={page}
          totalPages={totalPages}
          total={totalCount}
          perPage={PAGE_SIZE}
          search={searchInput}
          onSearchChange={setSearchInput}
          onPageChange={setPage}
          onEdit={handleOpenEdit}
        />
      ) : activeTab === "spots" ? (
        <VendorSpotTable
          spots={spots}
          isLoading={loadingSpots}
          onEdit={handleOpenSpotEdit}
        />
      ) : activeTab === "live" ? (
        <VendorRateTable
          rates={liveRates}
          isLoading={loadingLive}
          type="live"
          onToggleStatus={handleToggleLiveStatus}
          errorMessage={errorLive ? getApiErrorMessage(errorLive) : null}
          onRetry={() => void refetchLive()}
        />
      ) : (
        <VendorRateTable
          rates={standardRates}
          isLoading={loadingRates}
          type="standard"
          onToggleStatus={handleToggleRateStatus}
          errorMessage={errorRates ? getApiErrorMessage(errorRates) : null}
          onRetry={() => void refetchRates()}
        />
      )}

      {/* Add / Edit Vendor Dialog */}
      <VendorFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        vendor={selectedVendor}
      />

      {/* Create / Edit Spot Quote Dialog */}
      <VendorSpotFormDialog
        open={spotDialogOpen}
        onOpenChange={setSpotDialogOpen}
        spot={selectedSpot}
      />

      {/* Create Rate Product Dialog (Live or Standard) */}
      <VendorRateFormDialog
        open={rateDialogOpen}
        onOpenChange={setRateDialogOpen}
        type={activeTab === "live" ? "live" : "standard"}
      />
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { PATHS } from "@/constants/paths.ts";
import { VendorFormDialog } from "../components/VendorFormDialog.tsx";
import { VendorTable } from "../components/VendorTable.tsx";
import { VendorSpotTable } from "../components/VendorSpotTable.tsx";
import { VendorRateTable } from "../components/VendorRateTable.tsx";
import {
  useVendorsPage,
  useVendorSpots,
  useVendorLives,
  useVendorRates,
  useUpdateVendorLiveStatus,
  useUpdateVendorRateStatus,
} from "../hook/useVendor.ts";
import type {
  Vendor,
  VendorRateProduct,
  VendorSpotItem,
} from "../types/vendor.types.ts";

const PAGE_SIZE = 10;
type VendorTabKey = "vendors" | "spots" | "live" | "rates";

export function VendorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawTab = searchParams.get("tab");
  const activeTab: VendorTabKey =
    rawTab === "spots" || rawTab === "live" || rawTab === "rates"
      ? rawTab
      : "vendors";
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim(), 400);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const { data, isLoading, error, refetch, isFetching } = useVendorsPage(
    page,
    PAGE_SIZE,
    search,
  );

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

  const liveStatusMutation = useUpdateVendorLiveStatus();
  const rateStatusMutation = useUpdateVendorRateStatus();

  const handleOpenCreate = () => {
    if (activeTab === "vendors") {
      setSelectedVendor(null);
      setDialogOpen(true);
    } else if (activeTab === "spots") {
      navigate(PATHS.vendorSpotNew);
    } else if (activeTab === "live") {
      navigate(PATHS.vendorLiveNew);
    } else {
      navigate(PATHS.vendorRateNew);
    }
  };

  const handleOpenEdit = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setDialogOpen(true);
  };

  const handleOpenSpotEdit = (spot: VendorSpotItem) => {
    navigate(PATHS.vendorSpotEdit.replace(":id", String(spot.id)));
  };

  const handleOpenRateEdit = (
    item: VendorRateProduct,
    type: "live" | "standard",
  ) => {
    if (type === "live") {
      navigate(PATHS.vendorLiveEdit.replace(":id", String(item.id)));
    } else {
      navigate(PATHS.vendorRateEdit.replace(":id", String(item.id)));
    }
  };

  const nextRateStatus = (item: VendorRateProduct) =>
    item.vendor_product_status === "Active" ? "Inactive" : "Active";

  const handleToggleLiveStatus = async (item: VendorRateProduct) => {
    await liveStatusMutation.mutateAsync({
      id: item.id,
      status: nextRateStatus(item),
    });
  };

  const handleToggleRateStatus = async (item: VendorRateProduct) => {
    await rateStatusMutation.mutateAsync({
      id: item.id,
      status: nextRateStatus(item),
    });
  };

  const handleRefresh = () => {
    void refetch();
    void refetchSpots();
    void refetchLive();
    void refetchRates();
  };

  const isRefreshing =
    isFetching || fetchingSpots || fetchingLive || fetchingRates;

  const activeCount = vendors.filter(
    (v) => v.vendor_status === "Active",
  ).length;
  const inactiveCount = vendors.length - activeCount;

  const getHeaderInfo = () => {
    switch (activeTab) {
      case "spots":
        return {
          title: "Spot Quotes",
          description:
            "Real-time vendor spot market quotes and delivery terms.",
          buttonLabel: "Spot Rate",
        };
      case "live":
        return {
          title: "Live Commodity Rates",
          description: "Real-time live prices with one-click broadcast toggle.",
          buttonLabel: "Add Live Rate",
        };
      case "rates":
        return {
          title: "Standard Commodity Rates",
          description: "Master commodity price book and rate cards.",
          buttonLabel: "Add Standard Rate",
        };
      default:
        return {
          title: "Vendors",
          description:
            "Manage your network of vendors, trade categories, and locations.",
          buttonLabel: "Add Vendor",
        };
    }
  };
  const headerInfo = getHeaderInfo();

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {headerInfo.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {headerInfo.description}
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
            <span>{headerInfo.buttonLabel}</span>
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
                {getApiErrorMessage(
                  error,
                  "Could not load vendors from server.",
                )}
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

      {/* Metric Cards - Contextual to active view */}
      {activeTab === "vendors" ? (
        <div className="grid gap-4 sm:grid-cols-3">
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
        </div>
      ) : activeTab === "spots" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-sky-600 dark:text-sky-400">
                Vendor Spot Quotes
              </CardTitle>
              <Sparkles className="size-4 text-sky-600 dark:text-sky-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {loadingSpots ? "—" : spots.length}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : activeTab === "live" ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Total Live Rates
              </CardTitle>
              <Radio className="size-4 text-rose-600 dark:text-rose-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {loadingLive ? "—" : liveRates.length}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Active Broadcast
              </CardTitle>
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {loadingLive
                  ? "—"
                  : liveRates.filter(
                      (r) => r.vendor_product_status === "Active",
                    ).length}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Inactive Broadcast
              </CardTitle>
              <Radio className="size-4 text-muted-foreground opacity-60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {loadingLive
                  ? "—"
                  : liveRates.filter(
                      (r) => r.vendor_product_status !== "Active",
                    ).length}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Standard Rates
              </CardTitle>
              <IndianRupee className="size-4 text-amber-600 dark:text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {loadingRates ? "—" : standardRates.length}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Active Rates
              </CardTitle>
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {loadingRates
                  ? "—"
                  : standardRates.filter(
                      (r) => r.vendor_product_status === "Active",
                    ).length}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Inactive Rates
              </CardTitle>
              <IndianRupee className="size-4 text-muted-foreground opacity-60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {loadingRates
                  ? "—"
                  : standardRates.filter(
                      (r) => r.vendor_product_status !== "Active",
                    ).length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
          onEdit={(item) => handleOpenRateEdit(item, "live")}
          errorMessage={errorLive ? getApiErrorMessage(errorLive) : null}
          onRetry={() => void refetchLive()}
        />
      ) : (
        <VendorRateTable
          rates={standardRates}
          isLoading={loadingRates}
          type="standard"
          onToggleStatus={handleToggleRateStatus}
          onEdit={(item) => handleOpenRateEdit(item, "standard")}
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
    </div>
  );
}

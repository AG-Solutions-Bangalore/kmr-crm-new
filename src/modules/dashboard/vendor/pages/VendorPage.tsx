import { useState } from "react";
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
import { VendorFormDialog } from "../components/VendorFormDialog.tsx";
import { VendorTable } from "../components/VendorTable.tsx";
import { VendorSpotFormDialog } from "../components/VendorSpotFormDialog.tsx";
import { VendorSpotTable } from "../components/VendorSpotTable.tsx";
import { VendorRateTable } from "../components/VendorRateTable.tsx";
import { VendorRateFormDialog } from "../components/VendorRateFormDialog.tsx";
import {
  useVendors,
  useVendorSpots,
  useVendorLives,
  useVendorRates,
} from "../hook/useVendor.ts";
import type { Vendor } from "../types/vendor.types.ts";

export function VendorPage() {
  const [activeTab, setActiveTab] = useState<"vendors" | "spots" | "live" | "rates">("vendors");

  const {
    data: vendors = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = useVendors();

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
  const [rateDialogOpen, setRateDialogOpen] = useState(false);

  const handleOpenCreate = () => {
    if (activeTab === "vendors") {
      setSelectedVendor(null);
      setDialogOpen(true);
    } else if (activeTab === "spots") {
      setSpotDialogOpen(true);
    } else {
      setRateDialogOpen(true);
    }
  };

  const handleOpenEdit = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setDialogOpen(true);
  };

  const handleRefresh = () => {
    void refetch();
    void refetchSpots();
    void refetchLive();
    void refetchRates();
  };

  const isRefreshing = isFetching || fetchingSpots || fetchingLive || fetchingRates;

  const totalCount = vendors.length;
  const activeCount = vendors.filter((v) => v.vendor_status === "Active").length;
  const inactiveCount = totalCount - activeCount;

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
      <div className="flex flex-wrap border-b border-border/80">
        <button
          type="button"
          onClick={() => setActiveTab("vendors")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "vendors"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Store className="size-4" />
          <span>Vendors Directory ({vendors.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("spots")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "spots"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles className="size-4" />
          <span>Spot Quotes ({spots.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("live")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "live"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Radio className="size-4" />
          <span>Live Rates ({liveRates.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("rates")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "rates"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <IndianRupee className="size-4" />
          <span>Standard Rates ({standardRates.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "vendors" ? (
        <VendorTable
          vendors={vendors}
          isLoading={isLoading}
          onEdit={handleOpenEdit}
        />
      ) : activeTab === "spots" ? (
        <VendorSpotTable spots={spots} isLoading={loadingSpots} />
      ) : activeTab === "live" ? (
        <VendorRateTable
          rates={liveRates}
          isLoading={loadingLive}
          type="live"
          errorMessage={errorLive ? getApiErrorMessage(errorLive) : null}
          onRetry={() => void refetchLive()}
        />
      ) : (
        <VendorRateTable
          rates={standardRates}
          isLoading={loadingRates}
          type="standard"
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

      {/* Create Spot Quote Dialog */}
      <VendorSpotFormDialog
        open={spotDialogOpen}
        onOpenChange={setSpotDialogOpen}
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

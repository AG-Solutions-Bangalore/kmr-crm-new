import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  IndianRupee,
  Radio,
  RefreshCw,
  Search,
  Sparkles,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
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
import { VendorMarketCardGrid } from "../components/VendorMarketCardGrid.tsx";
import { VendorRateQuickEditDialog } from "../components/VendorRateQuickEditDialog.tsx";
import { VendorSpotQuickEditDialog } from "../components/VendorSpotQuickEditDialog.tsx";
import { VendorRateBulkEditView } from "../components/VendorRateBulkEditView.tsx";
import { VendorNameFilter } from "../components/VendorNameFilter.tsx";
import { ListViewToggle } from "@/components/common/ListViewToggle.tsx";
import { readViewMode, writeViewMode, type ListViewMode } from "@/lib/view-mode.ts";
import {
  LIVE_VENDOR_FILTER_KEY,
  RATE_VENDOR_FILTER_KEY,
  SPOT_VENDOR_FILTER_KEY,
  readVendorFilter,
  writeVendorFilter,
} from "@/lib/vendor-filter.ts";
import {
  useActiveVendors,
  useVendorsPage,
  useVendorSpots,
  useVendorLives,
  useVendorRates,
  useUpdateVendorLiveStatus,
  useUpdateVendorRateStatus,
  useUpdateVendorSpotStatus,
} from "../hook/useVendor.ts";
import type {
  Vendor,
  VendorRateProduct,
  VendorSpotItem,
} from "../types/vendor.types.ts";

const PAGE_SIZE = 12;
// Backend has no vendor_id filter param (verified against live API), so when
// a vendor filter is active we fetch the whole list once and filter by
// vendor_id client-side. 3000 covers the largest list (spots ~2370).
const FILTER_FETCH_SIZE = 3000;
const MARKET_VIEW_STORAGE_KEY = "kmr-vendor-market-view";
type VendorTabKey = "vendors" | "spots" | "live" | "rates";

export function VendorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawTab = searchParams.get("tab");
  const activeTab: VendorTabKey =
    rawTab === "spots" || rawTab === "live" || rawTab === "rates"
      ? rawTab
      : "vendors";

  const [marketView, setMarketView] = useState<ListViewMode>(() =>
    readViewMode(MARKET_VIEW_STORAGE_KEY, "card"),
  );

  const handleMarketViewChange = (mode: ListViewMode) => {
    setMarketView(mode);
    writeViewMode(MARKET_VIEW_STORAGE_KEY, mode);
  };

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim(), 400);

  const [spotPage, setSpotPage] = useState(1);
  const [spotSearchInput, setSpotSearchInput] = useState("");
  const spotSearch = useDebouncedValue(spotSearchInput.trim(), 400);

  const [livePage, setLivePage] = useState(1);
  const [liveSearchInput, setLiveSearchInput] = useState("");
  const liveSearch = useDebouncedValue(liveSearchInput.trim(), 400);

  const [ratePage, setRatePage] = useState(1);
  const [rateSearchInput, setRateSearchInput] = useState("");
  const rateSearch = useDebouncedValue(rateSearchInput.trim(), 400);

  // Vendor-name filters — one per market list. State lives here (not in the
  // list components) and is persisted to localStorage, so refetches, status
  // toggles, view switches and tab changes never reset it. Only the Clear
  // button clears it.
  const [spotVendor, setSpotVendor] = useState(() =>
    readVendorFilter(SPOT_VENDOR_FILTER_KEY),
  );
  const [liveVendor, setLiveVendor] = useState(() =>
    readVendorFilter(LIVE_VENDOR_FILTER_KEY),
  );
  const [rateVendor, setRateVendor] = useState(() =>
    readVendorFilter(RATE_VENDOR_FILTER_KEY),
  );

  useEffect(() => {
    writeVendorFilter(SPOT_VENDOR_FILTER_KEY, spotVendor);
    setSpotPage(1);
  }, [spotVendor]);

  useEffect(() => {
    writeVendorFilter(LIVE_VENDOR_FILTER_KEY, liveVendor);
    setLivePage(1);
  }, [liveVendor]);

  useEffect(() => {
    writeVendorFilter(RATE_VENDOR_FILTER_KEY, rateVendor);
    setRatePage(1);
  }, [rateVendor]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    setSpotPage(1);
  }, [spotSearch]);

  useEffect(() => {
    setLivePage(1);
  }, [liveSearch]);

  useEffect(() => {
    setRatePage(1);
  }, [rateSearch]);

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
    data: spotsData,
    isLoading: loadingSpots,
    refetch: refetchSpots,
    isFetching: fetchingSpots,
  } = useVendorSpots(
    spotVendor ? 1 : spotPage,
    spotVendor ? FILTER_FETCH_SIZE : PAGE_SIZE,
    spotSearch,
  );

  const spots = useMemo(() => spotsData?.items ?? [], [spotsData]);
  const spotsTotal = spotsData?.total ?? 0;
  const spotsTotalPages = spotsData?.lastPage ?? 1;

  const {
    data: livesData,
    isLoading: loadingLive,
    error: errorLive,
    refetch: refetchLive,
    isFetching: fetchingLive,
  } = useVendorLives(
    liveVendor ? 1 : livePage,
    liveVendor ? FILTER_FETCH_SIZE : PAGE_SIZE,
    liveSearch,
  );

  const liveRates = useMemo(() => livesData?.items ?? [], [livesData]);
  const liveTotal = livesData?.total ?? 0;
  const liveTotalPages = livesData?.lastPage ?? 1;

  const {
    data: ratesData,
    isLoading: loadingRates,
    error: errorRates,
    refetch: refetchRates,
    isFetching: fetchingRates,
  } = useVendorRates(
    rateVendor ? 1 : ratePage,
    rateVendor ? FILTER_FETCH_SIZE : PAGE_SIZE,
    rateSearch,
  );

  const standardRates = useMemo(() => ratesData?.items ?? [], [ratesData]);
  const ratesTotal = ratesData?.total ?? 0;
  const ratesTotalPages = ratesData?.lastPage ?? 1;

  // Vendor dropdown options — full active-vendor list, plus any vendor seen
  // in the loaded market items (so the list never misses a vendor present
  // in live/spot/standard rates).
  const { data: activeVendors = [], isLoading: loadingVendorOptions } =
    useActiveVendors();

  const vendorOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const v of activeVendors) {
      map.set(String(v.id), v.vendor_name);
    }
    for (const it of [...spots, ...liveRates, ...standardRates]) {
      const id = String(it.vendor_id);
      if (!map.has(id)) {
        const name = (it.vendor_name || "").trim();
        map.set(id, name || `Vendor #${id}`);
      }
    }
    return [...map.entries()]
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [activeVendors, spots, liveRates, standardRates]);

  const vendorNameOf = (id: string) =>
    vendorOptions.find((o) => o.value === id)?.label ?? `#${id}`;

  // Exact client-side vendor filter (String(vendor_id) match) + client-side
  // pagination while a filter is active. Without a filter, server paging is
  // used untouched.
  const paginateFiltered = <T,>(items: T[], page: number) => {
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const safePage = Math.min(Math.max(1, page), totalPages);
    return {
      pageItems: items.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
      total,
      totalPages,
      safePage,
    };
  };

  const spotsFiltered = useMemo(
    () =>
      spotVendor
        ? spots.filter((s) => String(s.vendor_id) === spotVendor)
        : spots,
    [spots, spotVendor],
  );
  const liveFiltered = useMemo(
    () =>
      liveVendor
        ? liveRates.filter((r) => String(r.vendor_id) === liveVendor)
        : liveRates,
    [liveRates, liveVendor],
  );
  const ratesFiltered = useMemo(
    () =>
      rateVendor
        ? standardRates.filter((r) => String(r.vendor_id) === rateVendor)
        : standardRates,
    [standardRates, rateVendor],
  );

  // While a filter is active the query holds the FULL list (up to
  // FILTER_FETCH_SIZE items, kept via keepPreviousData during transitions).
  // The unfiltered branch must never render that whole array — cap it to one
  // page so clearing the filter is instant (at most 12 stale rows, which is
  // page 1 anyway since clearing resets to page 1), then the fresh
  // per_page=12 fetch swaps in.
  const spotsView = spotVendor
    ? paginateFiltered(spotsFiltered, spotPage)
    : {
        pageItems: spots.slice(0, PAGE_SIZE),
        total: spotsTotal,
        totalPages: spotsTotalPages,
        safePage: spotPage,
      };
  const liveView = liveVendor
    ? paginateFiltered(liveFiltered, livePage)
    : {
        pageItems: liveRates.slice(0, PAGE_SIZE),
        total: liveTotal,
        totalPages: liveTotalPages,
        safePage: livePage,
      };
  const ratesView = rateVendor
    ? paginateFiltered(ratesFiltered, ratePage)
    : {
        pageItems: standardRates.slice(0, PAGE_SIZE),
        total: ratesTotal,
        totalPages: ratesTotalPages,
        safePage: ratePage,
      };

  // Full-list fetch still in flight right after selecting a vendor (stale
  // 12-item page held via keepPreviousData): show the loading skeleton
  // instead of a flash of "no items found". Plain background refetches
  // (status toggles, Refresh) keep showing the list — the filter is
  // never touched by them.
  const spotsReady = !spotVendor || spots.length >= spotsTotal;
  const liveReady = !liveVendor || liveRates.length >= liveTotal;
  const ratesReady = !rateVendor || standardRates.length >= ratesTotal;

  // Clamp pages if totals shrink (e.g. deleted last item on last page).
  // NOTE: clamp against the *view* totals, not the raw server totals — while
  // a vendor filter is active the server page holds the whole list
  // (last_page = 1), so clamping against it would snap every page change
  // back to page 1 and break pagination.
  useEffect(() => {
    if (spotsView.totalPages > 0 && spotPage > spotsView.totalPages) {
      setSpotPage(spotsView.totalPages);
    }
  }, [spotPage, spotsView.totalPages]);

  useEffect(() => {
    if (liveView.totalPages > 0 && livePage > liveView.totalPages) {
      setLivePage(liveView.totalPages);
    }
  }, [livePage, liveView.totalPages]);

  useEffect(() => {
    if (ratesView.totalPages > 0 && ratePage > ratesView.totalPages) {
      setRatePage(ratesView.totalPages);
    }
  }, [ratePage, ratesView.totalPages]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  // Quick-edit states — inline modals for ~200 daily price updates.
  // Rate dialog is shared between Live and Standard tabs via quickRateType.
  const [quickRateItem, setQuickRateItem] =
    useState<VendorRateProduct | null>(null);
  const [quickRateType, setQuickRateType] = useState<"live" | "standard">(
    "live",
  );
  const [quickSpotItem, setQuickSpotItem] = useState<VendorSpotItem | null>(
    null,
  );

  const handleQuickRateEdit = (
    item: VendorRateProduct,
    type: "live" | "standard",
  ) => {
    setQuickRateItem(item);
    setQuickRateType(type);
  };

  const handleQuickSpotEdit = (spot: VendorSpotItem) => {
    setQuickSpotItem(spot);
  };

  // Bulk-edit mode: when a vendor is selected on Live / Standard tabs,
  // replace the card/table grid with the 3-column bulk list view.
  const liveBulkActive = activeTab === "live" && Boolean(liveVendor);
  const ratesBulkActive = activeTab === "rates" && Boolean(rateVendor);

  const liveStatusMutation = useUpdateVendorLiveStatus();
  const rateStatusMutation = useUpdateVendorRateStatus();
  const spotStatusMutation = useUpdateVendorSpotStatus();

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

  const handleToggleSpotStatus = async (item: VendorSpotItem) => {
    await spotStatusMutation.mutateAsync({
      id: item.id,
      status: item.vendor_spot_status === "Active" ? "Inactive" : "Active",
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
          buttonLabel: "Add Spot",
        };
      case "live":
        return {
          title: "Live Commodity Rates",
          description: "Real-time live prices with one-click broadcast toggle.",
          buttonLabel: "Add Live",
        };
      case "rates":
        return {
          title: "Standard Commodity Rates",
          description: "Master commodity price book and rate cards.",
          buttonLabel: "Add Rate",
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
                {loadingSpots ? "—" : spotsTotal}
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
                {loadingLive ? "—" : liveTotal}
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
                {loadingRates ? "—" : ratesTotal}
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

      {/* View Switcher for Market Tabs (Spots, Live, Rates) */}
      {activeTab !== "vendors" && !(liveBulkActive || ratesBulkActive) && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {activeTab === "spots"
              ? `${spotsView.total} spot quotes${spotVendor ? ` • filtered by ${vendorNameOf(spotVendor)}` : ""} • ${marketView === "card" ? "4-per-row card view" : "Table view"}`
              : activeTab === "live"
                ? `${liveView.total} live rates${liveVendor ? ` • filtered by ${vendorNameOf(liveVendor)}` : ""} • ${marketView === "card" ? "4-per-row card view" : "Table view"}`
                : `${ratesView.total} standard rates${rateVendor ? ` • filtered by ${vendorNameOf(rateVendor)}` : ""} • ${marketView === "card" ? "4-per-row card view" : "Table view"}`}
          </p>
          <ListViewToggle mode={marketView} onChange={handleMarketViewChange} />
        </div>
      )}

      {/* Tab Content */}
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
          onAdd={handleOpenCreate}
          addLabel="Add Vendor"
        />
      ) : activeTab === "spots" ? (
        marketView === "card" ? (
          <VendorMarketCardGrid
            type="spots"
            items={spotsView.pageItems}
            isLoading={loadingSpots || !spotsReady}
            isFetching={fetchingSpots}
            page={spotsView.safePage}
            totalPages={spotsView.totalPages}
            total={spotsView.total}
            perPage={PAGE_SIZE}
            search={spotSearchInput}
            onSearchChange={setSpotSearchInput}
            onPageChange={setSpotPage}
            onToggleStatus={handleToggleSpotStatus}
            onEdit={handleOpenSpotEdit}
            onQuickEdit={handleQuickSpotEdit}
            vendorFilter={spotVendor}
            onVendorFilterChange={setSpotVendor}
            onClearVendorFilter={() => setSpotVendor("")}
            vendorOptions={vendorOptions}
            vendorsLoading={loadingVendorOptions}
            onAdd={handleOpenCreate}
            addLabel="Add Spot"
          />
        ) : (
          <VendorSpotTable
            spots={spotsView.pageItems}
            isLoading={loadingSpots || !spotsReady}
            isFetching={fetchingSpots}
            page={spotsView.safePage}
            totalPages={spotsView.totalPages}
            total={spotsView.total}
            perPage={PAGE_SIZE}
            search={spotSearchInput}
            onSearchChange={setSpotSearchInput}
            onPageChange={setSpotPage}
            onEdit={handleOpenSpotEdit}
            onQuickEdit={handleQuickSpotEdit}
            vendorFilter={spotVendor}
            onVendorFilterChange={setSpotVendor}
            onClearVendorFilter={() => setSpotVendor("")}
            vendorOptions={vendorOptions}
            vendorsLoading={loadingVendorOptions}
            onAdd={handleOpenCreate}
            addLabel="Add Spot"
        />
        )
      ) : activeTab === "live" ? (
        liveBulkActive ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  value={liveSearchInput}
                  onChange={(e) => setLiveSearchInput(e.target.value)}
                  placeholder="Search products..."
                  className="pl-8"
                />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:shrink-0">
                <VendorNameFilter
                  id="live-bulk-vendor-filter"
                  value={liveVendor}
                  onChange={setLiveVendor}
                  onClear={() => setLiveVendor("")}
                  options={vendorOptions}
                  isLoading={loadingVendorOptions}
                />
                <Button size="sm" onClick={handleOpenCreate} className="gap-2 shrink-0">
                  <span>Add Live</span>
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Bulk edit mode for {vendorNameOf(liveVendor)} — update all prices
              below and press Submit All. Clear the vendor filter to return to
              cards/table.
            </p>
            <VendorRateBulkEditView
              items={liveFiltered}
              type="live"
              vendorName={vendorNameOf(liveVendor)}
              isLoading={loadingLive || !liveReady}
            />
          </div>
        ) : marketView === "card" ? (
          <VendorMarketCardGrid
            type="live"
            items={liveView.pageItems}
            isLoading={loadingLive || !liveReady}
            isFetching={fetchingLive}
            page={liveView.safePage}
            totalPages={liveView.totalPages}
            total={liveView.total}
            perPage={PAGE_SIZE}
            search={liveSearchInput}
            onSearchChange={setLiveSearchInput}
            onPageChange={setLivePage}
            onToggleStatus={handleToggleLiveStatus}
            onEdit={(item) => handleOpenRateEdit(item, "live")}
            onQuickEdit={(item) => handleQuickRateEdit(item, "live")}
            vendorFilter={liveVendor}
            onVendorFilterChange={setLiveVendor}
            onClearVendorFilter={() => setLiveVendor("")}
            vendorOptions={vendorOptions}
            vendorsLoading={loadingVendorOptions}
            onAdd={handleOpenCreate}
            addLabel="Add Live"
          />
        ) : (
          <VendorRateTable
            rates={liveView.pageItems}
            isLoading={loadingLive || !liveReady}
            isFetching={fetchingLive}
            type="live"
            page={liveView.safePage}
            totalPages={liveView.totalPages}
            total={liveView.total}
            perPage={PAGE_SIZE}
            search={liveSearchInput}
            onSearchChange={setLiveSearchInput}
            onPageChange={setLivePage}
            onToggleStatus={handleToggleLiveStatus}
            onEdit={(item) => handleOpenRateEdit(item, "live")}
            onQuickEdit={(item) => handleQuickRateEdit(item, "live")}
            errorMessage={errorLive ? getApiErrorMessage(errorLive) : null}
            onRetry={() => void refetchLive()}
            vendorFilter={liveVendor}
            onVendorFilterChange={setLiveVendor}
            onClearVendorFilter={() => setLiveVendor("")}
            vendorOptions={vendorOptions}
            vendorsLoading={loadingVendorOptions}
            onAdd={handleOpenCreate}
            addLabel="Add Live"
          />
        )
      ) : ratesBulkActive ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                value={rateSearchInput}
                onChange={(e) => setRateSearchInput(e.target.value)}
                placeholder="Search products..."
                className="pl-8"
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:shrink-0">
              <VendorNameFilter
                id="rates-bulk-vendor-filter"
                value={rateVendor}
                onChange={setRateVendor}
                onClear={() => setRateVendor("")}
                options={vendorOptions}
                isLoading={loadingVendorOptions}
              />
              <Button size="sm" onClick={handleOpenCreate} className="gap-2 shrink-0">
                <span>Add Rate</span>
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Bulk edit mode for {vendorNameOf(rateVendor)} — update all prices
            below and press Submit All. Clear the vendor filter to return to
            cards/table.
          </p>
          <VendorRateBulkEditView
            items={ratesFiltered}
            type="standard"
            vendorName={vendorNameOf(rateVendor)}
            isLoading={loadingRates || !ratesReady}
          />
        </div>
      ) : marketView === "card" ? (
        <VendorMarketCardGrid
          type="rates"
          items={ratesView.pageItems}
          isLoading={loadingRates || !ratesReady}
          isFetching={fetchingRates}
          page={ratesView.safePage}
          totalPages={ratesView.totalPages}
          total={ratesView.total}
          perPage={PAGE_SIZE}
          search={rateSearchInput}
          onSearchChange={setRateSearchInput}
          onPageChange={setRatePage}
          onToggleStatus={handleToggleRateStatus}
          onEdit={(item) => handleOpenRateEdit(item, "standard")}
          onQuickEdit={(item) => handleQuickRateEdit(item, "standard")}
            vendorFilter={rateVendor}
            onVendorFilterChange={setRateVendor}
            onClearVendorFilter={() => setRateVendor("")}
            vendorOptions={vendorOptions}
            vendorsLoading={loadingVendorOptions}
            onAdd={handleOpenCreate}
            addLabel="Add Rate"
        />
      ) : (
        <VendorRateTable
          rates={ratesView.pageItems}
          isLoading={loadingRates || !ratesReady}
          isFetching={fetchingRates}
          type="standard"
          page={ratesView.safePage}
          totalPages={ratesView.totalPages}
          total={ratesView.total}
          perPage={PAGE_SIZE}
          search={rateSearchInput}
          onSearchChange={setRateSearchInput}
          onPageChange={setRatePage}
          onToggleStatus={handleToggleRateStatus}
          onEdit={(item) => handleOpenRateEdit(item, "standard")}
          onQuickEdit={(item) => handleQuickRateEdit(item, "standard")}
          errorMessage={errorRates ? getApiErrorMessage(errorRates) : null}
          onRetry={() => void refetchRates()}
          vendorFilter={rateVendor}
          onVendorFilterChange={setRateVendor}
          onClearVendorFilter={() => setRateVendor("")}
          vendorOptions={vendorOptions}
          vendorsLoading={loadingVendorOptions}
          onAdd={handleOpenCreate}
          addLabel="Add Rate"
        />
      )}

      {/* Add / Edit Vendor Dialog */}
      <VendorFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        vendor={selectedVendor}
      />

      {/* Quick-edit price modal (Live + Standard rates) */}
      <VendorRateQuickEditDialog
        open={quickRateItem !== null}
        onOpenChange={(open) => {
          if (!open) setQuickRateItem(null);
        }}
        item={quickRateItem}
        type={quickRateType}
      />

      {/* Quick-update spot modal */}
      <VendorSpotQuickEditDialog
        open={quickSpotItem !== null}
        onOpenChange={(open) => {
          if (!open) setQuickSpotItem(null);
        }}
        item={quickSpotItem}
      />
    </div>
  );
}

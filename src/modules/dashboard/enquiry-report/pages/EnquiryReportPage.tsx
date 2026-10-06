import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Clock, Download, RefreshCw, MessageSquare, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { getApiErrorMessage } from "@/lib/axios.ts";
import { useDebouncedValue } from "@/hooks/useDebouncedValue.ts";
import { EnquiryReportTable } from "../components/EnquiryReportTable.tsx";
import { useEnquiryReport } from "../hook/useEnquiryReport.ts";

const PAGE_SIZE = 10;

export function EnquiryReportPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim(), 400);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const { data: allItems = [], isLoading, error, refetch, isFetching } = useEnquiryReport();

  // Report API returns the full list — filter + paginate client-side as a
  // fallback in case the backend ignores search params.
  const q = search.toLowerCase();
  const filtered = allItems.filter((item) => {
    const matchesSearch = !q
      ? true
      : [
          item.enquiryFullName,
          item.enquiryMobile,
          item.enquiryEmail,
          item.enquiryService,
          item.enquiryMessage,
          item.enquiryStatus,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q);
    return matchesSearch;
  });

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const start = (page - 1) * PAGE_SIZE;
  const paged = filtered.slice(start, start + PAGE_SIZE);

  const pendingCount = allItems.filter((i) => (i.enquiryStatus || "Pending") === "Pending").length;
  const completeCount = allItems.filter((i) => i.enquiryStatus === "Complete").length;
  const cancelledCount = allItems.filter((i) => i.enquiryStatus === "Cancel").length;

  const handleDownload = () => {
    if (filtered.length === 0) return;
    const headers = [
      "ID",
      "Name",
      "Mobile",
      "Email",
      "Service",
      "From",
      "Message",
      "UTM Medium",
      "UTM Source",
      "UTM Campaign",
      "Status",
    ];
    const escapeCell = (value: unknown) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;
    const lines = [
      headers.join(","),
      ...filtered.map((item) =>
        [
          item.id,
          item.enquiryFullName,
          item.enquiryMobile,
          item.enquiryEmail,
          item.enquiryService,
          item.enquiryFrom,
          item.enquiryMessage,
          item.utm_medium,
          item.utm_source,
          item.utm_campaign,
          item.enquiryStatus || "Pending",
        ]
          .map(escapeCell)
          .join(","),
      ),
    ];
    const blob = new Blob([lines.join("\r\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `enquiry-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Enquiry Report
          </h1>
          <p className="text-sm text-muted-foreground">
            Full enquiry register from the report API, with search and status overview.
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

          <Button
            size="sm"
            onClick={handleDownload}
            disabled={isLoading || filtered.length === 0}
            className="gap-2"
          >
            <Download className="size-4" />
            <span>Download</span>
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
                {getApiErrorMessage(error, "Could not load enquiry report from server.")}
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
              Total Enquiries
            </CardTitle>
            <MessageSquare className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? "—" : allItems.length}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Pending
            </CardTitle>
            <Clock className="size-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? "—" : pendingCount}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Complete
            </CardTitle>
            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? "—" : completeCount}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-destructive">
              Cancelled
            </CardTitle>
            <XCircle className="size-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? "—" : cancelledCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Table */}
      <EnquiryReportTable
        items={paged}
        start={start}
        isLoading={isLoading}
        isFetching={isFetching}
        page={page}
        totalPages={totalPages}
        total={totalCount}
        perPage={PAGE_SIZE}
        search={searchInput}
        onSearchChange={setSearchInput}
        onPageChange={setPage}
      />
    </div>
  );
}

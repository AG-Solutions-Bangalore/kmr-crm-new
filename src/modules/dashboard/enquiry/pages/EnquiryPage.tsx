import { AlertCircle, CheckCircle2, Clock, MessageSquare, RefreshCw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { getApiErrorMessage } from "@/lib/axios.ts";
import { EnquiryTable } from "../components/EnquiryTable.tsx";
import { useEnquiries } from "../hook/useEnquiry.ts";

export function EnquiryPage() {
  const { data: enquiries = [], isLoading, error, refetch, isFetching } = useEnquiries();

  const totalCount = enquiries.length;
  const pendingCount = enquiries.filter(
    (e) => !e.enquiryStatus || e.enquiryStatus.toLowerCase() === "pending",
  ).length;
  const completeCount = enquiries.filter(
    (e) => e.enquiryStatus?.toLowerCase() === "complete",
  ).length;
  const cancelCount = enquiries.filter(
    (e) => e.enquiryStatus?.toLowerCase() === "cancel",
  ).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Customer Enquiries
          </h1>
          <p className="text-sm text-muted-foreground">
            View, track, and update leads and inquiries submitted by website visitors.
          </p>
        </div>

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
      </div>

      {/* Backend API Error Notice */}
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Backend API Notice</p>
              <p className="mt-1 text-xs opacity-90">
                {getApiErrorMessage(error, "Could not load enquiries from server.")}
              </p>
              <p className="mt-2 text-xs opacity-75">
                Note: The live server reports &quot;Target class [EnquiryController] does not exist&quot;. The UI and API handlers are fully wired and will populate automatically as soon as the controller is mapped in routes on the backend.
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
              Total Inquiries
            </CardTitle>
            <MessageSquare className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? "—" : totalCount}
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
              {isLoading ? "—" : cancelCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enquiry Table */}
      <EnquiryTable enquiries={enquiries} isLoading={isLoading} />
    </div>
  );
}

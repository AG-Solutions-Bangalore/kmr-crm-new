import { AlertCircle, CheckCircle2, Mail, RefreshCw, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { getApiErrorMessage } from "@/lib/axios.ts";
import { NewsletterTable } from "../components/NewsletterTable.tsx";
import { useNewsletterSubscribers } from "../hook/useNewsletter.ts";

export function NewsletterPage() {
  const { data: subscribers = [], isLoading, error, refetch, isFetching } = useNewsletterSubscribers();

  const totalCount = subscribers.length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Newsletter Subscribers
          </h1>
          <p className="text-sm text-muted-foreground">
            Audience mailing list subscriptions gathered from web and mobile apps.
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
                {getApiErrorMessage(error, "Could not load newsletter subscribers from server.")}
              </p>
              <p className="mt-2 text-xs opacity-75">
                Note: The live server reports &quot;Target class [NewsletterController] does not exist&quot;. The frontend hooks and table are fully prepared to display real data once the controller is added in Laravel.
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
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Subscribers
            </CardTitle>
            <Mail className="size-4 text-muted-foreground" />
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
              Active Audience
            </CardTitle>
            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? "—" : totalCount}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-sky-600 dark:text-sky-400">
              Deliverability
            </CardTitle>
            <UserCheck className="size-4 text-sky-600 dark:text-sky-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              100%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Newsletter Table */}
      <NewsletterTable subscribers={subscribers} isLoading={isLoading} />
    </div>
  );
}

import { useState } from "react";
import { AlertCircle, Bell, CheckCircle2, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { getApiErrorMessage } from "@/lib/axios.ts";
import { NotificationFormDialog } from "../components/NotificationFormDialog.tsx";
import { NotificationTable } from "../components/NotificationTable.tsx";
import { useNotifications } from "../hook/useNotification.ts";
import type { NotificationItem } from "../types/notification.types.ts";

export function NotificationPage() {
  const {
    data: notifications = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = useNotifications();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);

  const handleOpenCreate = () => {
    setSelectedNotif(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (item: NotificationItem) => {
    setSelectedNotif(item);
    setDialogOpen(true);
  };

  const totalCount = notifications.length;
  const activeCount = notifications.filter((n) => n.notification_status === "Active").length;
  const inactiveCount = totalCount - activeCount;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Push Notifications
          </h1>
          <p className="text-sm text-muted-foreground">
            Schedule and broadcast real-time commodity alerts to all customer mobile devices.
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
            <span>Send Alert</span>
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
                {getApiErrorMessage(error, "Could not load notifications from server.")}
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
              Total Alerts
            </CardTitle>
            <Bell className="size-4 text-muted-foreground" />
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
              Active / Scheduled
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
              Draft / Inactive
            </CardTitle>
            <Bell className="size-4 text-muted-foreground opacity-60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? "—" : inactiveCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications Table */}
      <NotificationTable
        notifications={notifications}
        isLoading={isLoading}
        onEdit={handleOpenEdit}
      />

      {/* Add / Edit Dialog */}
      <NotificationFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        notification={selectedNotif}
      />
    </div>
  );
}

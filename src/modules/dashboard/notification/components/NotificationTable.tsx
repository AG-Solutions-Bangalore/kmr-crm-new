import { useState } from "react";
import { Bell, Calendar, Edit2, Power, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { useUpdateNotificationStatus } from "../hook/useNotification.ts";
import type { NotificationItem, NotificationStatus } from "../types/notification.types.ts";

interface NotificationTableProps {
  notifications: NotificationItem[];
  isLoading: boolean;
  onEdit: (notification: NotificationItem) => void;
}

export function NotificationTable({
  notifications,
  isLoading,
  onEdit,
}: NotificationTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const updateStatusMutation = useUpdateNotificationStatus();
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const filtered = notifications.filter((n) => {
    const s = search.toLowerCase();
    const matchesSearch =
      n.notification_heading?.toLowerCase().includes(s) ||
      n.notification_description?.toLowerCase().includes(s) ||
      n.notification_date?.toLowerCase().includes(s);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && n.notification_status === "Active") ||
      (statusFilter === "inactive" && n.notification_status !== "Active");

    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = async (item: NotificationItem) => {
    const nextStatus = item.notification_status === "Active" ? "Inactive" : "Active";
    setTogglingId(item.id);
    try {
      await updateStatusMutation.mutateAsync({
        id: item.id,
        status: nextStatus as NotificationStatus,
      });
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by heading or message content..."
            className="pl-8"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">All Alerts</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border/60 bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Notification Alert</th>
                <th className="px-4 py-3">Schedule Date</th>
                <th className="px-4 py-3">Attached Image</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span>Loading notifications...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Bell className="size-8 opacity-40" />
                      <p className="font-medium">No notifications found</p>
                      <p className="text-xs">
                        {search
                          ? "Try adjusting your search query"
                          : "Schedule your first notification using the button above."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isActive = item.notification_status === "Active";
                  const isToggling = togglingId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3.5 max-w-sm">
                        <div className="flex items-start gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-0.5">
                            <Bell className="size-4" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {item.notification_heading}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                              {item.notification_description}
                            </p>
                            <span className="text-[11px] text-muted-foreground">
                              ID: #{item.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1 font-medium text-foreground">
                          <Calendar className="size-3 text-muted-foreground" />
                          {item.notification_date || "—"}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {item.notification_image ? (
                          <span className="font-mono text-[11px] truncate max-w-[120px] block">
                            {item.notification_image}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <Badge
                          variant={isActive ? "default" : "secondary"}
                          className={
                            isActive
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-medium"
                              : "bg-muted text-muted-foreground font-medium"
                          }
                        >
                          {item.notification_status || "Active"}
                        </Badge>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(item)}
                            disabled={isToggling}
                            title={isActive ? "Deactivate Alert" : "Activate Alert"}
                            className="size-8 p-0"
                          >
                            <Power
                              className={`size-3.5 ${
                                isActive ? "text-emerald-600" : "text-muted-foreground"
                              }`}
                            />
                            <span className="sr-only">Toggle</span>
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(item)}
                            className="size-8 p-0"
                            title="Edit Notification"
                          >
                            <Edit2 className="size-3.5" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

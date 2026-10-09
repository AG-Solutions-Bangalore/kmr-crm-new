import { useState } from "react";
import { Bell, Calendar, Edit2, Plus, Power, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { TablePagination } from "@/components/ui/table-pagination.tsx";
import { formatDateDMY } from "@/lib/date.ts";
import { resolveAssetImageUrl, useApiNoImageUrl } from "@/lib/image.ts";
import { useUpdateNotificationStatus } from "../hook/useNotification.ts";
import type { NotificationItem, NotificationStatus } from "../types/notification.types.ts";

function NotificationThumb({
  filename,
  heading,
}: {
  filename?: string | null;
  heading?: string;
}) {
  const [failed, setFailed] = useState(false);
  const fallback = useApiNoImageUrl();
  const directUrl = filename
    ? resolveAssetImageUrl(filename, "notification_images", null)
    : null;
  const url = failed ? fallback : directUrl || fallback;

  return (
    <img
      src={url}
      alt={heading || "Notification"}
      loading="lazy"
      className="size-9 shrink-0 rounded-lg border border-border/60 object-contain p-0.5 bg-muted/20 mt-0.5"
      onError={() => {
        if (!failed && directUrl) {
          setFailed(true);
        }
      }}
    />
  );
}

interface NotificationTableProps {
  notifications: NotificationItem[];
  isLoading: boolean;
  isFetching?: boolean;
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
  search: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onEdit: (notification: NotificationItem) => void;
  onAdd?: () => void;
  addLabel?: string;
}

export function NotificationTable({
  notifications,
  isLoading,
  isFetching = false,
  page,
  totalPages,
  total,
  perPage,
  search,
  onSearchChange,
  onPageChange,
  onEdit,
  onAdd,
  addLabel,
}: NotificationTableProps) {
  const updateStatusMutation = useUpdateNotificationStatus();
  const [togglingId, setTogglingId] = useState<number | null>(null);

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
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search..."
            className="pl-8"
          />
        </div>
        {onAdd && (
          <Button size="sm" onClick={onAdd} className="gap-2 shrink-0">
            <Plus className="size-4" />
            <span>{addLabel || "Send Alert"}</span>
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border/60 bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Sl/No</th>
                <th className="px-4 py-3">Notification Alert</th>
                <th className="px-4 py-3">Schedule Date</th>
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
              ) : notifications.length === 0 ? (
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
                notifications.map((item, index) => {
                  const slNo = (page - 1) * perPage + index + 1;
                  const isActive = item.notification_status === "Active";
                  const isToggling = togglingId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {slNo}
                      </td>
                      <td className="px-4 py-3.5 max-w-sm">
                        <div className="flex items-start gap-3">
                          {item.notification_image ? (
                            <NotificationThumb
                              filename={item.notification_image}
                              heading={item.notification_heading}
                            />
                          ) : (
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-0.5">
                              <Bell className="size-4" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-foreground">
                              {item.notification_heading}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                              {item.notification_description}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1 font-medium text-foreground">
                          <Calendar className="size-3 text-muted-foreground" />
                          {formatDateDMY(item.notification_date)}
                        </div>
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

      <TablePagination
        page={page}
        totalPages={totalPages}
        total={total}
        perPage={perPage}
        isLoading={isLoading}
        isFetching={isFetching}
        onPageChange={onPageChange}
      />
    </div>
  );
}

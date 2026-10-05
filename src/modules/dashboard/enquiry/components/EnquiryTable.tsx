import { useState } from "react";
import {
  Eye,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Search,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { TablePagination } from "@/components/ui/table-pagination.tsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import {
  useDeleteEnquiry,
  useEnquiry,
  useUpdateEnquiryStatus,
} from "../hook/useEnquiry.ts";
import type { EnquiryItem, EnquiryStatus } from "../types/enquiry.types.ts";

interface EnquiryTableProps {
  enquiries: EnquiryItem[];
  isLoading: boolean;
  isFetching?: boolean;
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
  search: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
}

function getName(e: EnquiryItem): string {
  return e.enquiryFullName || e.name || "Anonymous Prospect";
}
function getEmail(e: EnquiryItem): string {
  return e.enquiryEmail || e.email || "";
}
function getMobile(e: EnquiryItem): string {
  return e.enquiryMobile || e.mobile || "";
}
function getService(e: EnquiryItem): string {
  return e.enquiryService || e.subject || "";
}
function getMessage(e: EnquiryItem): string {
  return e.enquiryMessage || e.message || "";
}

export function EnquiryTable({
  enquiries,
  isLoading,
  isFetching = false,
  page,
  totalPages,
  total,
  perPage,
  search,
  onSearchChange,
  onPageChange,
}: EnquiryTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const updateStatusMutation = useUpdateEnquiryStatus();
  const deleteMutation = useDeleteEnquiry();
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EnquiryItem | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [viewId, setViewId] = useState<number | null>(null);

  // Search is server-side (?search=); status filter applies to the loaded page.
  const filtered = enquiries.filter((item) => {
    const matchesStatus =
      statusFilter === "all" ||
      item.enquiryStatus?.toLowerCase() === statusFilter.toLowerCase();

    return matchesStatus;
  });

  const handleStatusChange = async (item: EnquiryItem, newStatus: EnquiryStatus) => {
    setUpdatingId(item.id);
    try {
      await updateStatusMutation.mutateAsync({
        id: item.id,
        status: newStatus,
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeletingId(id);
    try {
      await deleteMutation.mutateAsync(id);
      setDeleteTarget(null);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status?: string | null) => {
    switch (status?.toLowerCase()) {
      case "complete":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-medium">
            Complete
          </Badge>
        );
      case "cancel":
        return (
          <Badge variant="destructive" className="font-medium">
            Cancel
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 font-medium">
            Pending
          </Badge>
        );
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search & Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, email, mobile, service..."
            className="pl-8"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">All Enquiries</option>
            <option value="pending">Pending</option>
            <option value="complete">Complete</option>
            <option value="cancel">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border/60 bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Sl/No</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Service & Message</th>
                <th className="px-4 py-3">Current Status</th>
                <th className="px-4 py-3">Change Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span>Loading customer enquiries...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <MessageSquare className="size-8 opacity-40" />
                      <p className="font-medium">No enquiries found</p>
                      <p className="text-xs">
                        {search
                          ? "Try adjusting your search criteria"
                          : "Customer enquiries submitted from your website will show up here."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item, index) => {
                  const slNo = (page - 1) * perPage + index + 1;
                  const isUpdating = updatingId === item.id;
                  const mobile = getMobile(item);
                  const email = getEmail(item);
                  const service = getService(item);
                  const message = getMessage(item);

                  return (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {slNo}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <MessageSquare className="size-4" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {getName(item)}
                            </p>
                            <span className="text-[11px] text-muted-foreground">
                              ID: #{item.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-xs">
                        <div className="flex flex-col gap-0.5">
                          {mobile && (
                            <span className="flex items-center gap-1 font-medium text-foreground">
                              <Phone className="size-3 text-muted-foreground" />
                              {mobile}
                            </span>
                          )}
                          {email && (
                            <span className="flex items-center gap-1 text-muted-foreground truncate max-w-[180px]">
                              <Mail className="size-3 text-muted-foreground" />
                              {email}
                            </span>
                          )}
                          {!mobile && !email && (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 max-w-xs text-xs">
                        {service && (
                          <p className="font-medium text-foreground line-clamp-1">
                            {service}
                          </p>
                        )}
                        <p className="text-muted-foreground line-clamp-2 mt-0.5">
                          {message || "—"}
                        </p>
                      </td>

                      <td className="px-4 py-3.5">
                        {getStatusBadge(item.enquiryStatus)}
                      </td>

                      <td className="px-4 py-3.5">
                        <select
                          disabled={isUpdating}
                          value={item.enquiryStatus || "Pending"}
                          onChange={(e) =>
                            handleStatusChange(
                              item,
                              e.target.value as EnquiryStatus,
                            )
                          }
                          className="h-8 rounded-md border border-input bg-background px-2 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Complete">Complete</option>
                          <option value="Cancel">Cancel</option>
                        </select>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewId(item.id)}
                            className="size-8 p-0"
                            title="View details"
                          >
                            <Eye className="size-3.5" />
                            <span className="sr-only">View</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(item)}
                            disabled={deletingId === item.id}
                            className="size-8 p-0 text-destructive hover:bg-destructive/10"
                            title="Delete Enquiry"
                          >
                            <Trash2 className="size-3.5" />
                            <span className="sr-only">Delete</span>
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

      {/* View details — GET /enquiry/:id */}
      <Dialog open={viewId !== null} onOpenChange={(o) => !o && setViewId(null)}>
        <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
          {viewId !== null && <EnquiryDetailContent enquiryId={viewId} />}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && deletingId === null) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete enquiry?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete enquiry{" "}
              <span className="font-mono font-semibold text-foreground">
                #{deleteTarget?.id} ({deleteTarget ? getName(deleteTarget) : ""})
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingId !== null}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleDelete();
              }}
              disabled={deletingId !== null}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingId !== null ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EnquiryDetailContent({ enquiryId }: { enquiryId: number }) {
  const { data, isLoading, error } = useEnquiry(enquiryId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-sm text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-primary" />
        <span>Loading enquiry details from server...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
        Could not load enquiry #{enquiryId} details.
      </div>
    );
  }

  const rows: Array<[string, string]> = [
    ["Full Name", getName(data)],
    ["Mobile", getMobile(data) || "—"],
    ["Email", getEmail(data) || "—"],
    ["Service", getService(data) || "—"],
    ["From", data.enquiryFrom || "—"],
    ["Message", getMessage(data) || "—"],
    ["Status", data.enquiryStatus || "Pending"],
    ["UTM Source", data.utm_source || "—"],
    ["UTM Medium", data.utm_medium || "—"],
    ["UTM Campaign", data.utm_campaign || "—"],
  ];

  return (
    <div className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>Enquiry #{data.id}</DialogTitle>
        <DialogDescription>
          Full details fetched via GET /enquiry/{data.id}.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-2">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs"
          >
            <span className="shrink-0 font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </span>
            <span className="break-all text-right text-foreground">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState } from "react";
import { Mail, MessageSquare, Phone, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { useDeleteEnquiry, useUpdateEnquiryStatus } from "../hook/useEnquiry.ts";
import type { EnquiryItem, EnquiryStatus } from "../types/enquiry.types.ts";

interface EnquiryTableProps {
  enquiries: EnquiryItem[];
  isLoading: boolean;
}

export function EnquiryTable({ enquiries, isLoading }: EnquiryTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const updateStatusMutation = useUpdateEnquiryStatus();
  const deleteMutation = useDeleteEnquiry();
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const filtered = enquiries.filter((item) => {
    const s = search.toLowerCase();
    const matchesSearch =
      item.name?.toLowerCase().includes(s) ||
      item.email?.toLowerCase().includes(s) ||
      item.mobile?.toLowerCase().includes(s) ||
      item.message?.toLowerCase().includes(s) ||
      item.subject?.toLowerCase().includes(s);

    const matchesStatus =
      statusFilter === "all" ||
      item.enquiryStatus?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
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

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this enquiry?")) {
      await deleteMutation.mutateAsync(id);
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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search enquiries by name, email, or message..."
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
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Subject & Message</th>
                <th className="px-4 py-3">Current Status</th>
                <th className="px-4 py-3">Change Status</th>
                <th className="px-4 py-3 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span>Loading customer enquiries...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
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
                filtered.map((item) => {
                  const isUpdating = updatingId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <MessageSquare className="size-4" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {item.name || "Anonymous Prospect"}
                            </p>
                            <span className="text-[11px] text-muted-foreground">
                              ID: #{item.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-xs">
                        <div className="flex flex-col gap-0.5">
                          {item.mobile && (
                            <span className="flex items-center gap-1 font-medium text-foreground">
                              <Phone className="size-3 text-muted-foreground" />
                              {item.mobile}
                            </span>
                          )}
                          {item.email && (
                            <span className="flex items-center gap-1 text-muted-foreground truncate max-w-[160px]">
                              <Mail className="size-3 text-muted-foreground" />
                              {item.email}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 max-w-xs text-xs">
                        {item.subject && (
                          <p className="font-medium text-foreground line-clamp-1">
                            {item.subject}
                          </p>
                        )}
                        <p className="text-muted-foreground line-clamp-2 mt-0.5">
                          {item.message || "—"}
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          className="size-8 p-0 text-destructive hover:bg-destructive/10"
                          title="Delete Enquiry"
                        >
                          <Trash2 className="size-3.5" />
                          <span className="sr-only">Delete</span>
                        </Button>
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

import { useState } from "react";
import { Mail, MessageSquare, Phone, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { TablePagination } from "@/components/ui/table-pagination.tsx";
import type { EnquiryReportItem } from "../types/enquiry-report.types.ts";

interface EnquiryReportTableProps {
  items: EnquiryReportItem[];
  start: number;
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

function statusStyle(status?: string | null): string {
  switch (status) {
    case "Complete":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-medium";
    case "Cancel":
      return "bg-destructive/10 text-destructive border-destructive/30 font-medium";
    default:
      return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 font-medium";
  }
}

export function EnquiryReportTable({
  items,
  start,
  isLoading,
  isFetching = false,
  page,
  totalPages,
  total,
  perPage,
  search,
  onSearchChange,
  onPageChange,
}: EnquiryReportTableProps) {
  const [previewItem, setPreviewItem] = useState<EnquiryReportItem | null>(null);

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, mobile, email, or service..."
            className="pl-8"
          />
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
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span>Loading enquiry report...</span>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <MessageSquare className="size-8 opacity-40" />
                      <p className="font-medium">No enquiries found</p>
                      <p className="text-xs">
                        {search
                          ? "Try adjusting your search criteria"
                          : "No enquiry records returned by the report API."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">
                      {start + index + 1}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <MessageSquare className="size-4" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {item.enquiryFullName || "—"}
                          </p>
                          {item.enquiryMobile && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="size-3" />
                              {item.enquiryMobile}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-xs">
                      <div className="flex flex-col gap-0.5">
                        {item.enquiryEmail && (
                          <span className="flex items-center gap-1 font-medium text-foreground">
                            <Mail className="size-3 text-muted-foreground" />
                            {item.enquiryEmail}
                          </span>
                        )}
                        {item.enquiryFrom && (
                          <span className="truncate max-w-[220px] text-muted-foreground">
                            {item.enquiryFrom}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-xs max-w-sm">
                      <p className="font-medium text-foreground">
                        {item.enquiryService || "—"}
                      </p>
                      {item.enquiryMessage && (
                        <p className="text-muted-foreground line-clamp-2 mt-0.5">
                          {item.enquiryMessage}
                        </p>
                      )}
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs"
                        onClick={() => setPreviewItem(item)}
                      >
                        View full message
                      </Button>
                    </td>

                    <td className="px-4 py-3.5">
                      <Badge
                        variant="outline"
                        className={statusStyle(item.enquiryStatus)}
                      >
                        {item.enquiryStatus || "Pending"}
                      </Badge>
                    </td>
                  </tr>
                ))
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

      <Dialog
        open={previewItem !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewItem(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {previewItem?.enquiryFullName || "Enquiry"} —{" "}
              {previewItem?.enquiryService || "General"}
            </DialogTitle>
          </DialogHeader>
          {(previewItem?.enquiryMobile || previewItem?.enquiryEmail) && (
            <p className="text-xs text-muted-foreground">
              {[previewItem?.enquiryMobile, previewItem?.enquiryEmail]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {previewItem?.enquiryMessage || "No message."}
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}

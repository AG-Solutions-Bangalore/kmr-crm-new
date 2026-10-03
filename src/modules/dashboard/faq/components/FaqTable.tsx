import { useState } from "react";
import { Edit2, HelpCircle, Power, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { useDeleteFaq, useUpdateFaqStatus } from "../hook/useFaq.ts";
import type { FaqItem, FaqStatus } from "../types/faq.types.ts";

interface FaqTableProps {
  faqs: FaqItem[];
  isLoading: boolean;
  onEdit: (item: FaqItem) => void;
}

export function FaqTable({ faqs, isLoading, onEdit }: FaqTableProps) {
  const [search, setSearch] = useState("");
  const updateStatusMutation = useUpdateFaqStatus();
  const deleteMutation = useDeleteFaq();
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filtered = faqs.filter((f) => {
    const q = search.toLowerCase();
    return (
      f.faq_for?.toLowerCase().includes(q) ||
      f.faq_status?.toLowerCase().includes(q) ||
      String(f.id).includes(q)
    );
  });

  const handleToggleStatus = async (item: FaqItem) => {
    const nextStatus = item.faq_status === "Active" ? "Inactive" : "Active";
    setTogglingId(item.id);
    try {
      await updateStatusMutation.mutateAsync({
        id: item.id,
        status: nextStatus as FaqStatus,
      });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this FAQ group?")) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteMutation.mutateAsync(id);
    } finally {
      setDeletingId(null);
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
            placeholder="Search FAQs by page or status..."
            className="pl-8"
          />
        </div>
      </div>

      {/* Table - strictly renders what the API returns: id, faq_for, faq_status */}
      <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border/60 bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Page Placement (faq_for)</th>
                <th className="px-4 py-3">Status (faq_status)</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span>Loading FAQs...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <HelpCircle className="size-8 opacity-40" />
                      <p className="font-medium">No FAQs found</p>
                      <p className="text-xs">
                        {search
                          ? "Try adjusting your search criteria"
                          : "Create your first FAQ group using the button above."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isActive = item.faq_status === "Active";
                  const isToggling = togglingId === item.id;
                  const isDeleting = deletingId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3.5 font-mono text-xs font-semibold text-foreground">
                        #{item.id}
                      </td>

                      <td className="px-4 py-3.5">
                        <Badge variant="outline" className="font-mono text-xs font-medium">
                          {item.faq_for}
                        </Badge>
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
                          {item.faq_status || "Active"}
                        </Badge>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(item)}
                            disabled={isToggling}
                            title={isActive ? "Set Inactive" : "Set Active"}
                            className="size-8 p-0"
                          >
                            <Power
                              className={`size-3.5 ${
                                isActive ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                              }`}
                            />
                            <span className="sr-only">Toggle</span>
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(item)}
                            className="size-8 p-0"
                            title="Edit FAQ & Questions"
                          >
                            <Edit2 className="size-3.5" />
                            <span className="sr-only">Edit</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                            disabled={isDeleting}
                            title="Delete FAQ"
                            className="size-8 p-0 text-destructive hover:bg-destructive/10"
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
    </div>
  );
}

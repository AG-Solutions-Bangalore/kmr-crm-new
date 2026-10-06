import { useState } from "react";
import { Edit2, FolderTree, Power, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { useUpdateCategoryStatus } from "../hook/useCategory.ts";
import type { Category } from "../types/category.types.ts";

interface CategoryTableProps {
  categories: Category[];
  isLoading: boolean;
  isFetching?: boolean;
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
  search: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onEdit: (category: Category) => void;
}

function pageWindow(current: number, total: number): number[] {
  const pages: number[] = [];
  const start = Math.max(1, Math.min(current - 2, Math.max(1, total - 4)));
  const end = Math.min(total, start + 4);
  for (let p = start; p <= end; p++) pages.push(p);
  return pages;
}

export function CategoryTable({
  categories,
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
}: CategoryTableProps) {
  const updateStatusMutation = useUpdateCategoryStatus();
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Search is server-side (?search=); render the categories prop directly.

  const handleToggleStatus = async (cat: Category) => {
    const nextStatus = cat.categories_status === "Active" ? "Inactive" : "Active";
    setTogglingId(cat.id);
    try {
      await updateStatusMutation.mutateAsync({
        id: cat.id,
        status: nextStatus,
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
            placeholder="Search categories by name or slug..."
            className="pl-8"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border/60 bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Sl/No</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Parent ID</th>
                <th className="px-4 py-3">Sort Order</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span>Loading categories...</span>
                    </div>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FolderTree className="size-8 opacity-40" />
                      <p className="font-medium">No categories found</p>
                      <p className="text-xs">
                        {search
                          ? "Try adjusting your search criteria"
                          : "Create your first category using the button above."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                categories.map((cat, index) => {
                  const slNo = (page - 1) * perPage + index + 1;
                  const isActive = cat.categories_status === "Active";
                  const isToggling = togglingId === cat.id;

                  return (
                    <tr
                      key={cat.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {slNo}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <FolderTree className="size-4" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {cat.categories_name}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">
                        {cat.categories_slug || "—"}
                      </td>

                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {cat.parent_id === null ||
                        cat.parent_id === undefined ||
                        cat.parent_id === ""
                          ? "—"
                          : String(cat.parent_id)}
                      </td>

                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {cat.categories_sort_order ?? "1"}
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
                          {cat.categories_status || "Active"}
                        </Badge>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(cat)}
                            disabled={isToggling}
                            title={isActive ? "Set Inactive" : "Set Active"}
                            className="size-8 p-0"
                          >
                            <Power
                              className={`size-3.5 ${
                                isActive ? "text-emerald-600" : "text-muted-foreground"
                              }`}
                            />
                            <span className="sr-only">Toggle Status</span>
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(cat)}
                            className="size-8 p-0"
                            title="Edit Category"
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

      {/* Server-side pagination */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {total === 0
            ? "No categories"
            : `Showing ${(page - 1) * perPage + 1}–${Math.min(page * perPage, total)} of ${total}`}
          {isFetching && !isLoading && " • Updating..."}
        </p>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isLoading}
            onClick={() => onPageChange(page - 1)}
            className="h-8 px-3 text-xs"
          >
            Previous
          </Button>
          {pageWindow(page, Math.max(totalPages, 1)).map((p) => (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="sm"
              disabled={isLoading}
              onClick={() => onPageChange(p)}
              className="size-8 p-0 text-xs"
            >
              {p}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || isLoading}
            onClick={() => onPageChange(page + 1)}
            className="h-8 px-3 text-xs"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

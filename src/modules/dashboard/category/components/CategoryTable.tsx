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
  onEdit: (category: Category) => void;
}

export function CategoryTable({
  categories,
  isLoading,
  onEdit,
}: CategoryTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const updateStatusMutation = useUpdateCategoryStatus();
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const filtered = categories.filter((cat) => {
    const matchesSearch =
      cat.categories_name?.toLowerCase().includes(search.toLowerCase()) ||
      cat.categories_slug?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && cat.categories_status === "Active") ||
      (statusFilter === "inactive" && cat.categories_status !== "Active");

    return matchesSearch && matchesStatus;
  });

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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories by name or slug..."
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
            <option value="all">All Categories</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border/60 bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
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
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span>Loading categories...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
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
                filtered.map((cat) => {
                  const isActive = cat.categories_status === "Active";
                  const isToggling = togglingId === cat.id;

                  return (
                    <tr
                      key={cat.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <FolderTree className="size-4" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {cat.categories_name}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              ID: #{cat.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">
                        {cat.categories_slug || "—"}
                      </td>

                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {cat.parent_id === 0 || cat.parent_id === "0"
                          ? "Root (0)"
                          : cat.parent_id ?? "0"}
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
    </div>
  );
}

import { useState } from "react";
import { Edit2, FileText, Power, Search, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { TablePagination } from "@/components/ui/table-pagination.tsx";
import { useUpdateBlogStatus } from "../hook/useBlog.ts";
import type { BlogItem, BlogStatus } from "../types/blog.types.ts";

interface BlogTableProps {
  blogs: BlogItem[];
  isLoading: boolean;
  isFetching?: boolean;
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
  search: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onEdit: (blog: BlogItem) => void;
}

export function BlogTable({
  blogs,
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
}: BlogTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const updateStatusMutation = useUpdateBlogStatus();
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Search is server-side (?search=); status filter applies to the loaded page.
  const filtered = blogs.filter((b) => {
    return (
      statusFilter === "all" ||
      (statusFilter === "active" && b.blog_status === "Active") ||
      (statusFilter === "inactive" && b.blog_status !== "Active")
    );
  });

  const handleToggleStatus = async (item: BlogItem) => {
    const nextStatus = item.blog_status === "Active" ? "Inactive" : "Active";
    setTogglingId(item.id);
    try {
      await updateStatusMutation.mutateAsync({
        id: item.id,
        status: nextStatus as BlogStatus,
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
            placeholder="Search articles by title, category, or summary..."
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
            <option value="all">All Posts</option>
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
                <th className="px-4 py-3">Sl/No</th>
                <th className="px-4 py-3">Article Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Flags</th>
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
                      <span>Loading articles...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="size-8 opacity-40" />
                      <p className="font-medium">No blog posts found</p>
                      <p className="text-xs">
                        {search
                          ? "Try a different search term"
                          : "Write your first blog post using the button above."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item, index) => {
                  const slNo = (page - 1) * perPage + index + 1;
                  const isActive = item.blog_status === "Active";
                  const isFeatured = item.blog_featured === "1" || item.blog_featured === 1;
                  const isFront = item.blog_front === "1" || item.blog_front === 1;
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
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-0.5">
                            <FileText className="size-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-medium text-foreground line-clamp-1">
                                {item.blog_title}
                              </p>
                              {isFeatured && (
                                <Star className="size-3.5 text-amber-500 fill-amber-500 shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {item.blog_short_description || "—"}
                            </p>
                            <span className="text-[11px] text-muted-foreground font-mono">
                              ID: #{item.id}
                              {item.blog_created_date
                                ? ` • ${item.blog_created_date}`
                                : ""}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-xs">
                        {item.categories ? (
                          <Badge variant="secondary" className="text-[11px]">
                            {item.categories}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                        {item.blog_categories_ids && (
                          <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                            Cat #{item.blog_categories_ids}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-xs">
                        <div className="flex flex-wrap items-center gap-1">
                          {item.blog_index && (
                            <Badge variant="outline" className="text-[10px]">
                              Index: {item.blog_index}
                            </Badge>
                          )}
                          {isFeatured && (
                            <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-500/30">
                              Featured
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-[10px]">
                            {isFront ? "Front" : "No Front"}
                          </Badge>
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
                          {item.blog_status || "Active"}
                        </Badge>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(item)}
                            disabled={isToggling}
                            title={isActive ? "Deactivate Post" : "Activate Post"}
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
                            title="Edit Blog"
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

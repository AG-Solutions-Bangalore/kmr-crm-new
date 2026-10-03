import { useState } from "react";
import { Calendar, Edit2, Newspaper, Power, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { useUpdateNewsStatus } from "../hook/useNews.ts";
import type { NewsItem } from "../types/news.types.ts";

interface NewsTableProps {
  articles: NewsItem[];
  isLoading: boolean;
  onEdit: (article: NewsItem) => void;
}

export function NewsTable({ articles, isLoading, onEdit }: NewsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const updateStatusMutation = useUpdateNewsStatus();
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const filtered = articles.filter((a) => {
    const s = search.toLowerCase();
    const matchesSearch =
      a.news_heading?.toLowerCase().includes(s) ||
      a.news_details?.toLowerCase().includes(s) ||
      a.categories_name?.toLowerCase().includes(s);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && a.news_status === "Active") ||
      (statusFilter === "inactive" && a.news_status !== "Active");

    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = async (item: NewsItem) => {
    const nextStatus = item.news_status === "Active" ? "Inactive" : "Active";
    setTogglingId(item.id);
    try {
      await updateStatusMutation.mutateAsync({
        id: item.id,
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
            placeholder="Search news by headline, details, or category..."
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
            <option value="all">All Articles</option>
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
                <th className="px-4 py-3">Headline</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Published Date</th>
                <th className="px-4 py-3">Attachment</th>
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
                      <span>Loading news articles...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Newspaper className="size-8 opacity-40" />
                      <p className="font-medium">No articles found</p>
                      <p className="text-xs">
                        {search
                          ? "Try adjusting your search criteria"
                          : "Publish your first market update using the button above."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isActive = item.news_status === "Active";
                  const isToggling = togglingId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3.5 max-w-sm">
                        <div className="flex items-start gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-0.5">
                            <Newspaper className="size-4" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground line-clamp-1">
                              {item.news_heading}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                              {item.news_details}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-xs">
                        <Badge variant="outline" className="font-normal">
                          {item.categories_name || `Category #${item.category_id}`}
                        </Badge>
                      </td>

                      <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="size-3 text-muted-foreground" />
                          {item.news_created_date || "—"}
                        </div>
                        {item.news_created_time && (
                          <span className="text-[11px] opacity-75">
                            {item.news_created_time}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {item.news_other_image ? (
                          <span className="font-mono text-[11px] truncate max-w-[120px] block">
                            {item.news_other_image}
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
                          {item.news_status || "Active"}
                        </Badge>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(item)}
                            disabled={isToggling}
                            title={isActive ? "Deactivate News" : "Activate News"}
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
                            onClick={() => onEdit(item)}
                            className="size-8 p-0"
                            title="Edit News Article"
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

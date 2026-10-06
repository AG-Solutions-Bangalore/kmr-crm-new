import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, FileText, Plus, RefreshCw, Star } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { getApiErrorMessage } from "@/lib/axios.ts";
import { useDebouncedValue } from "@/hooks/useDebouncedValue.ts";
import { PATHS } from "@/constants/paths.ts";
import { BlogTable } from "../components/BlogTable.tsx";
import { BlogCardGrid } from "../components/BlogCardGrid.tsx";
import { useBlogsPage } from "../hook/useBlog.ts";
import type { BlogItem } from "../types/blog.types.ts";
import { ListViewToggle } from "@/components/common/ListViewToggle.tsx";
import { readViewMode, writeViewMode, type ListViewMode } from "@/lib/view-mode.ts";
import { sortByRecency } from "@/lib/sort.ts";

const PAGE_SIZE = 10;
const VIEW_STORAGE_KEY = "kmr-blog-view";

export function BlogPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim(), 400);
  const [view, setView] = useState<ListViewMode>(() =>
    readViewMode(VIEW_STORAGE_KEY, "card"),
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  const { data, isLoading, error, refetch, isFetching } = useBlogsPage(
    page,
    PAGE_SIZE,
    search,
  );

  // Latest updates first over the loaded page (backend has no ?sort=).
  const blogs = sortByRecency(data?.items ?? [], "latest", ["blog_updated_date", "blog_created_date"]);
  const totalCount = data?.total ?? 0;
  const totalPages = data?.lastPage ?? 1;

  const handleViewChange = (mode: ListViewMode) => {
    setView(mode);
    writeViewMode(VIEW_STORAGE_KEY, mode);
  };

  const handleOpenCreate = () => {
    navigate(PATHS.blogNew);
  };

  const handleOpenEdit = (blog: BlogItem) => {
    navigate(`${PATHS.blog}/${blog.id}/edit`);
  };

  const activeCount = blogs.filter((b) => b.blog_status === "Active").length;
  const featuredCount = blogs.filter((b) => b.blog_featured === "1" || b.blog_featured === 1).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Blog & Content
          </h1>
          <p className="text-sm text-muted-foreground">
            Write, optimize, and publish SEO content, thought leadership, and guides.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw
              className={`size-3.5 ${isFetching ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </Button>

          <Button size="sm" onClick={handleOpenCreate} className="gap-2">
            <Plus className="size-4" />
            <span>Create Article</span>
          </Button>
        </div>
      </div>

      {/* Backend API Error Notice */}
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Backend Error</p>
              <p className="mt-1 text-xs opacity-90">
                {getApiErrorMessage(error, "Could not load blog posts from server.")}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="shrink-0 border-destructive/40 hover:bg-destructive/20"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Articles
            </CardTitle>
            <FileText className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? "—" : totalCount}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Published Active
            </CardTitle>
            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? "—" : activeCount}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Featured Highlights
            </CardTitle>
            <Star className="size-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? "—" : featuredCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View switcher — Card View shares the common feed design. */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {isLoading
            ? "Loading articles..."
            : totalCount === 0
              ? "No articles yet"
              : `${totalCount} article${totalCount === 1 ? "" : "s"} • Latest updated first`}
        </p>
        <ListViewToggle mode={view} onChange={handleViewChange} />
      </div>

      {view === "card" ? (
        <BlogCardGrid
          blogs={blogs}
          isLoading={isLoading}
          isFetching={isFetching}
          errorMessage={error ? getApiErrorMessage(error, "Could not load blog posts from server.") : null}
          onRetry={() => refetch()}
          page={page}
          totalPages={totalPages}
          total={totalCount}
          perPage={PAGE_SIZE}
          search={searchInput}
          onSearchChange={setSearchInput}
          onPageChange={setPage}
          onEdit={handleOpenEdit}
        />
      ) : (
        <BlogTable
          blogs={blogs}
          isLoading={isLoading}
          isFetching={isFetching}
          page={page}
          totalPages={totalPages}
          total={totalCount}
          perPage={PAGE_SIZE}
          search={searchInput}
          onSearchChange={setSearchInput}
          onPageChange={setPage}
          onEdit={handleOpenEdit}
        />
      )}
    </div>
  );
}

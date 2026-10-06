import { useEffect, useMemo, useState } from "react";
import { AlertCircle, FolderTree, GitBranch, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { getApiErrorMessage } from "@/lib/axios.ts";
import { useDebouncedValue } from "@/hooks/useDebouncedValue.ts";
import { CategoryFormDialog } from "../components/CategoryFormDialog.tsx";
import { CategoryTable } from "../components/CategoryTable.tsx";
import { CategoryCardGrid } from "../components/CategoryCardGrid.tsx";
import { useCategories } from "../hook/useCategory.ts";
import type { Category } from "../types/category.types.ts";
import { ListViewToggle } from "@/components/common/ListViewToggle.tsx";
import { readViewMode, writeViewMode, type ListViewMode } from "@/lib/view-mode.ts";
import { sortByRecency } from "@/lib/sort.ts";

const PAGE_SIZE = 10;
const VIEW_STORAGE_KEY = "kmr-category-view";

type CategoryTab = "parent" | "sub";

function isRootCategory(c: Category): boolean {
  return c.parent_id === null || c.parent_id === undefined || c.parent_id === "" || c.parent_id === "0" || c.parent_id === 0;
}

export function CategoryPage() {
  const [tab, setTab] = useState<CategoryTab>("parent");
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim(), 400);

  const { data: allItems = [], isLoading, error, refetch, isFetching } = useCategories(search);

  const parents = useMemo(() => allItems.filter(isRootCategory), [allItems]);
  const subs = useMemo(() => allItems.filter((c) => !isRootCategory(c)), [allItems]);

  const tabItems = tab === "parent" ? parents : subs;

  const filtered = tabItems;

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [search, tab]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const [view, setView] = useState<ListViewMode>(() =>
    readViewMode(VIEW_STORAGE_KEY, "card"),
  );

  const handleViewChange = (mode: ListViewMode) => {
    setView(mode);
    writeViewMode(VIEW_STORAGE_KEY, mode);
  };

  // Latest updates first over the loaded tab page (backend has no ?sort=).
  const sorted = sortByRecency(filtered, "latest");
  const start = (page - 1) * PAGE_SIZE;
  const paged = sorted.slice(start, start + PAGE_SIZE);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const handleOpenCreate = () => {
    setSelectedCategory(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setSelectedCategory(category);
    setDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Categories
          </h1>
          <p className="text-sm text-muted-foreground">
            Organize and manage your product categories, sort orders, and hierarchy.
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
            <span>Add Category</span>
          </Button>
        </div>
      </div>

      {/* Backend API Notice if error occurs */}
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Backend API Error</p>
              <p className="mt-1 text-xs opacity-90">
                {getApiErrorMessage(
                  error,
                  "Could not retrieve categories from server.",
                )}
              </p>
              <p className="mt-2 text-xs opacity-75">
                Note: If the live server returns &quot;Class App\Models\Categories not found&quot;, the PHP controller model reference needs to be fixed on the backend.
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
              Total Categories
            </CardTitle>
            <FolderTree className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? "—" : allItems.length}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Parent Categories
            </CardTitle>
            <FolderTree className="size-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? "—" : parents.length}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-primary">
              Sub Categories
            </CardTitle>
            <GitBranch className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? "—" : subs.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <Button
          variant={tab === "parent" ? "default" : "outline"}
          size="sm"
          onClick={() => setTab("parent")}
          className="cursor-pointer"
        >
          Categories{isLoading ? "" : ` (${parents.length})`}
        </Button>
        <Button
          variant={tab === "sub" ? "default" : "outline"}
          size="sm"
          onClick={() => setTab("sub")}
          className="cursor-pointer"
        >
          Sub Categories{isLoading ? "" : ` (${subs.length})`}
        </Button>
      </div>

      {/* View switcher — Card View shares the common feed design. */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {isLoading
            ? "Loading categories..."
            : totalCount === 0
              ? "No categories yet"
              : `${totalCount} ${tab === "parent" ? "categories" : "sub-categories"} • Latest updated first`}
        </p>
        <ListViewToggle mode={view} onChange={handleViewChange} />
      </div>

      {view === "card" ? (
        <CategoryCardGrid
          categories={paged}
          isLoading={isLoading}
          isFetching={isFetching}
          errorMessage={error ? getApiErrorMessage(error, "Could not retrieve categories from server.") : null}
          onRetry={() => refetch()}
          page={page}
          totalPages={totalPages}
          total={totalCount}
          perPage={PAGE_SIZE}
          search={searchInput}
          onSearchChange={setSearchInput}
          onPageChange={setPage}
          onEdit={handleOpenEdit}
          tabLabel={tab === "parent" ? "category" : "sub-category"}
        />
      ) : (
        <CategoryTable
          categories={paged}
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

      {/* Add / Edit Dialog */}
      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={selectedCategory}
      />
    </div>
  );
}

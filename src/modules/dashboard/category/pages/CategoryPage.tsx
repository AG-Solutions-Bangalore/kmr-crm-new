import { useState } from "react";
import { AlertCircle, CheckCircle2, FolderTree, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { getApiErrorMessage } from "@/lib/axios.ts";
import { CategoryFormDialog } from "../components/CategoryFormDialog.tsx";
import { CategoryTable } from "../components/CategoryTable.tsx";
import { useCategories } from "../hook/useCategory.ts";
import type { Category } from "../types/category.types.ts";

export function CategoryPage() {
  const { data: categories = [], isLoading, error, refetch, isFetching } = useCategories();

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

  const totalCount = categories.length;
  const activeCount = categories.filter((c) => c.categories_status === "Active").length;
  const inactiveCount = totalCount - activeCount;

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
              {isLoading ? "—" : totalCount}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Active Categories
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
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Inactive Categories
            </CardTitle>
            <FolderTree className="size-4 text-muted-foreground opacity-60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? "—" : inactiveCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Table */}
      <CategoryTable
        categories={categories}
        isLoading={isLoading}
        onEdit={handleOpenEdit}
      />

      {/* Add / Edit Dialog */}
      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={selectedCategory}
      />
    </div>
  );
}

import { useState } from "react";
import { AlertCircle, CheckCircle2, FileText, Plus, RefreshCw, Star } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { getApiErrorMessage } from "@/lib/axios.ts";
import { BlogFormDialog } from "../components/BlogFormDialog.tsx";
import { BlogTable } from "../components/BlogTable.tsx";
import { useBlogs } from "../hook/useBlog.ts";
import type { BlogItem } from "../types/blog.types.ts";

export function BlogPage() {
  const { data: blogs = [], isLoading, error, refetch, isFetching } = useBlogs();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<BlogItem | null>(null);

  const handleOpenCreate = () => {
    setSelectedBlog(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (blog: BlogItem) => {
    setSelectedBlog(blog);
    setDialogOpen(true);
  };

  const totalCount = blogs.length;
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

      {/* Blog Table */}
      <BlogTable blogs={blogs} isLoading={isLoading} onEdit={handleOpenEdit} />

      {/* Add / Edit Dialog */}
      <BlogFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        blog={selectedBlog}
      />
    </div>
  );
}

import { useState } from "react";
import { AlertCircle, CheckCircle2, Plus, Quote, RefreshCw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { getApiErrorMessage } from "@/lib/axios.ts";
import { TestimonialFormDialog } from "../components/TestimonialFormDialog.tsx";
import { TestimonialTable } from "../components/TestimonialTable.tsx";
import { useTestimonials } from "../hook/useTestimonial.ts";
import type { TestimonialItem } from "../types/testimonial.types.ts";

export function TestimonialPage() {
  const { data: testimonials = [], isLoading, error, refetch, isFetching } = useTestimonials();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TestimonialItem | null>(null);

  const handleOpenCreate = () => {
    setSelectedItem(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (item: TestimonialItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const totalCount = testimonials.length;
  const activeCount = testimonials.filter((t) => t.testimonial_status === "Active").length;
  const inactiveCount = testimonials.filter((t) => t.testimonial_status === "Inactive").length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Testimonials & Reviews
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage customer feedback, testimonials, ratings, and page placements.
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
            <span>Add Testimonial</span>
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
                {getApiErrorMessage(error, "Could not load testimonials from server.")}
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
              Total Testimonials
            </CardTitle>
            <Quote className="size-4 text-muted-foreground" />
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
              Active Testimonials
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
              Inactive Testimonials
            </CardTitle>
            <XCircle className="size-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? "—" : inactiveCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Testimonials Table */}
      <TestimonialTable
        testimonials={testimonials}
        isLoading={isLoading}
        onEdit={handleOpenEdit}
      />

      {/* Add / Edit Dialog */}
      <TestimonialFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        testimonial={selectedItem}
      />
    </div>
  );
}

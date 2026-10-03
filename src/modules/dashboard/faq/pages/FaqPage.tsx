import { useState } from "react";
import { AlertCircle, CheckCircle2, HelpCircle, Plus, RefreshCw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { getApiErrorMessage } from "@/lib/axios.ts";
import { FaqFormDialog } from "../components/FaqFormDialog.tsx";
import { FaqTable } from "../components/FaqTable.tsx";
import { useFaqs } from "../hook/useFaq.ts";
import type { FaqItem } from "../types/faq.types.ts";

export function FaqPage() {
  const { data: faqs = [], isLoading, error, refetch, isFetching } = useFaqs();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<FaqItem | null>(null);

  const handleOpenCreate = () => {
    setSelectedFaq(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (faq: FaqItem) => {
    setSelectedFaq(faq);
    setDialogOpen(true);
  };

  const totalGroups = faqs.length;
  const totalQuestions = faqs.reduce(
    (acc, f) => acc + (f.subs ? f.subs.length : 0),
    0,
  );
  const activeGroups = faqs.filter((f) => f.faq_status === "Active").length;
  const inactiveGroups = faqs.filter((f) => f.faq_status === "Inactive").length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Frequently Asked Questions (FAQs)
          </h1>
          <p className="text-sm text-muted-foreground">
            Organize help topics, product FAQs, and answers per website page.
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
            <span>Create FAQ Group</span>
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
                {getApiErrorMessage(error, "Could not load FAQs from server.")}
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              FAQ Groups
            </CardTitle>
            <HelpCircle className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? "—" : totalGroups}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-primary">
              Total Questions
            </CardTitle>
            <HelpCircle className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? "—" : totalQuestions}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Active Groups
            </CardTitle>
            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? "—" : activeGroups}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Inactive Groups
            </CardTitle>
            <XCircle className="size-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? "—" : inactiveGroups}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Table */}
      <FaqTable
        faqs={faqs}
        isLoading={isLoading}
        onEdit={handleOpenEdit}
      />

      {/* Add / Edit Dialog */}
      <FaqFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        faq={selectedFaq}
      />
    </div>
  );
}

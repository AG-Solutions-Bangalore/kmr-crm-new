import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, HelpCircle, RefreshCw, XCircle } from "lucide-react";
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
import { FaqTable } from "../components/FaqTable.tsx";
import { useFaqsPage } from "../hook/useFaq.ts";
import type { FaqItem } from "../types/faq.types.ts";

const PAGE_SIZE = 10;

export function FaqPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim(), 400);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const { data, isLoading, error, refetch, isFetching } = useFaqsPage(
    page,
    PAGE_SIZE,
    search,
  );

  const faqs = data?.items ?? [];
  const totalCount = data?.total ?? 0;
  const totalPages = data?.lastPage ?? 1;

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const handleOpenCreate = () => {
    navigate(PATHS.faqNew);
  };

  const handleOpenEdit = (faq: FaqItem) => {
    navigate(`${PATHS.faq}/${faq.id}/edit`);
  };

  const totalFaqs = totalCount;
  const activeFaqs = faqs.filter((f) => f.faq_status === "Active").length;
  const inactiveFaqs = faqs.filter((f) => f.faq_status === "Inactive").length;
  const uniquePlacements = new Set(faqs.map((f) => f.faq_for).filter(Boolean)).size;

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

      {/* Metric Cards - strictly computed from API response */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total FAQs
            </CardTitle>
            <HelpCircle className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? "—" : totalFaqs}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Active FAQs
            </CardTitle>
            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? "—" : activeFaqs}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Inactive FAQs
            </CardTitle>
            <XCircle className="size-4 text-muted-foreground opacity-60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? "—" : inactiveFaqs}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-primary">
              Page Placements
            </CardTitle>
            <HelpCircle className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? "—" : uniquePlacements}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Table */}
      <FaqTable
        faqs={faqs}
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
        onAdd={handleOpenCreate}
        addLabel="Create FAQ Group"
      />
    </div>
  );
}

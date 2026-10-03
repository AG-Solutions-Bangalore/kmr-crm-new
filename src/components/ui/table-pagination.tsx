import { Button } from "@/components/ui/button.tsx";

interface TablePaginationProps {
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
  isLoading?: boolean;
  isFetching?: boolean;
  onPageChange: (page: number) => void;
}

function pageWindow(current: number, total: number): number[] {
  const pages: number[] = [];
  const start = Math.max(1, Math.min(current - 2, Math.max(1, total - 4)));
  const end = Math.min(total, start + 4);
  for (let p = start; p <= end; p++) pages.push(p);
  return pages;
}

export function TablePagination({
  page,
  totalPages,
  total,
  perPage,
  isLoading = false,
  isFetching = false,
  onPageChange,
}: TablePaginationProps) {
  const safeTotal = Math.max(totalPages, 1);
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground">
        {total === 0
          ? "No records"
          : `Showing ${(page - 1) * perPage + 1}–${Math.min(page * perPage, total)} of ${total}`}
        {isFetching && !isLoading && " • Updating..."}
      </p>
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1 || isLoading}
          onClick={() => onPageChange(page - 1)}
          className="h-8 px-3 text-xs"
        >
          Previous
        </Button>
        {pageWindow(page, safeTotal).map((p) => (
          <Button
            key={p}
            variant={p === page ? "default" : "outline"}
            size="sm"
            disabled={isLoading}
            onClick={() => onPageChange(p)}
            className="size-8 p-0 text-xs"
          >
            {p}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages || isLoading}
          onClick={() => onPageChange(page + 1)}
          className="h-8 px-3 text-xs"
        >
          Next
        </Button>
      </div>
    </div>
  );
}

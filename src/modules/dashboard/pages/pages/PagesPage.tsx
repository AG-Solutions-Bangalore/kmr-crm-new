import { Globe, Layers, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { usePageOne, usePageTwo } from "../hook/usePages.ts";

export function PagesPage() {
  const {
    data: pageOne = [],
    isLoading: isLoadingOne,
    refetch: refetchOne,
    isFetching: isFetchingOne,
  } = usePageOne();

  const {
    data: pageTwo = [],
    isLoading: isLoadingTwo,
    refetch: refetchTwo,
    isFetching: isFetchingTwo,
  } = usePageTwo();

  const handleRefresh = () => {
    void refetchOne();
    void refetchTwo();
  };

  const isFetching = isFetchingOne || isFetchingTwo;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Site Pages Configuration
          </h1>
          <p className="text-sm text-muted-foreground">
            Registered web page routes utilized across Testimonials, FAQs, and SEO modules.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isFetching}
          className="gap-2"
        >
          <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Page One Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="size-5 text-primary" />
                <CardTitle className="text-base">Primary Pages (pageOne)</CardTitle>
              </div>
              <Badge variant="secondary">{pageOne.length} Pages</Badge>
            </div>
            <CardDescription>
              Configured target pages for customer testimonials & reviews.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-y border-border/60 bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5">Page Name</th>
                    <th className="px-4 py-2.5">Route Slug (URL)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {isLoadingOne ? (
                    <tr>
                      <td colSpan={2} className="px-4 py-8 text-center text-muted-foreground">
                        Loading page routes...
                      </td>
                    </tr>
                  ) : pageOne.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-4 py-8 text-center text-muted-foreground">
                        No pages configured.
                      </td>
                    </tr>
                  ) : (
                    pageOne.map((p) => (
                      <tr key={p.page_url} className="hover:bg-muted/20">
                        <td className="px-4 py-3 font-medium text-foreground">
                          {p.page_name}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-primary">
                          /{p.page_url}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Page Two Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="size-5 text-purple-600 dark:text-purple-400" />
                <CardTitle className="text-base">Secondary Pages (pageTwo)</CardTitle>
              </div>
              <Badge variant="secondary">{pageTwo.length} Pages</Badge>
            </div>
            <CardDescription>
              Configured target pages for FAQs and specialized knowledge sections.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-y border-border/60 bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5">Page Name</th>
                    <th className="px-4 py-2.5">Route Slug (URL)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {isLoadingTwo ? (
                    <tr>
                      <td colSpan={2} className="px-4 py-8 text-center text-muted-foreground">
                        Loading page routes...
                      </td>
                    </tr>
                  ) : pageTwo.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-4 py-8 text-center text-muted-foreground">
                        No pages configured.
                      </td>
                    </tr>
                  ) : (
                    pageTwo.map((p) => (
                      <tr key={p.page_two_url} className="hover:bg-muted/20">
                        <td className="px-4 py-3 font-medium text-foreground">
                          {p.page_two_name}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-purple-600 dark:text-purple-400">
                          /{p.page_two_url}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

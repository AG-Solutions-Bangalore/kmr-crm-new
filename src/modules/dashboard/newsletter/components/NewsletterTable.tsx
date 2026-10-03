import { useState } from "react";
import { Calendar, Mail, Search, Trash2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { useDeleteNewsletterSubscriber } from "../hook/useNewsletter.ts";
import type { NewsletterSubscriber } from "../types/newsletter.types.ts";

interface NewsletterTableProps {
  subscribers: NewsletterSubscriber[];
  isLoading: boolean;
}

export function NewsletterTable({ subscribers, isLoading }: NewsletterTableProps) {
  const [search, setSearch] = useState("");
  const deleteMutation = useDeleteNewsletterSubscriber();

  const filtered = subscribers.filter((s) =>
    s.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async (id: number) => {
    if (window.confirm("Remove this email from newsletter distribution?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search subscribers by email..."
          className="pl-8"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border/60 bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Subscriber</th>
                <th className="px-4 py-3">Date Subscribed</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span>Loading newsletter subscribers...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="size-8 opacity-40" />
                      <p className="font-medium">No subscribers found</p>
                      <p className="text-xs">
                        {search
                          ? "Try a different search term"
                          : "Subscribers who sign up on your landing page will appear here."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Mail className="size-4" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {item.email}
                          </p>
                          <span className="text-[11px] text-muted-foreground">
                            Subscriber ID: #{item.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5 font-medium text-foreground">
                        <Calendar className="size-3 text-muted-foreground" />
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : "Active"}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <Badge
                        variant="default"
                        className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-medium"
                      >
                        {item.status || "Subscribed"}
                      </Badge>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        className="size-8 p-0 text-destructive hover:bg-destructive/10"
                        title="Unsubscribe"
                      >
                        <Trash2 className="size-3.5" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

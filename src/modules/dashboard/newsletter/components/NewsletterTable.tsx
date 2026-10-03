import { useState } from "react";
import { Calendar, Mail, Search, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import { useDeleteNewsletterSubscriber } from "../hook/useNewsletter.ts";
import type { NewsletterSubscriber } from "../types/newsletter.types.ts";

interface NewsletterTableProps {
  subscribers: NewsletterSubscriber[];
  isLoading: boolean;
}

function getEmail(s: NewsletterSubscriber): string {
  return s.newsletter_email || s.email || "";
}

function getCreated(s: NewsletterSubscriber): string {
  return s.newsletter_created || s.created_at || "";
}

export function NewsletterTable({ subscribers, isLoading }: NewsletterTableProps) {
  const [search, setSearch] = useState("");
  const deleteMutation = useDeleteNewsletterSubscriber();
  const [deleteTarget, setDeleteTarget] =
    useState<NewsletterSubscriber | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filtered = subscribers.filter((s) =>
    getEmail(s).toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeletingId(id);
    try {
      await deleteMutation.mutateAsync(id);
      setDeleteTarget(null);
    } finally {
      setDeletingId(null);
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
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Subscriber Email</th>
                <th className="px-4 py-3">Date Subscribed</th>
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
                    <td className="px-4 py-3.5 font-mono text-xs font-semibold text-foreground">
                      #{item.id}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Mail className="size-4" />
                        </div>
                        <p className="font-medium text-foreground">
                          {getEmail(item) || "—"}
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5 font-medium text-foreground">
                        <Calendar className="size-3 text-muted-foreground" />
                        {getCreated(item) || "—"}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(item)}
                        disabled={deletingId === item.id}
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

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && deletingId === null) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove subscriber?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <span className="font-mono font-semibold text-foreground">
                {deleteTarget ? getEmail(deleteTarget) : ""} (#
                {deleteTarget?.id})
              </span>{" "}
              from newsletter distribution. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingId !== null}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleDelete();
              }}
              disabled={deletingId !== null}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingId !== null ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

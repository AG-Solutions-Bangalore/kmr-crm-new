import { useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { getApiErrorMessage } from "@/lib/axios.ts";
import {
  useCreateFaq,
  useDeleteFaqSub,
  useFaq,
  usePageTwoOptions,
  useUpdateFaq,
} from "../hook/useFaq.ts";
import type { FaqItem, FaqStatus, FaqSubItem } from "../types/faq.types.ts";

interface FaqFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faq?: FaqItem | null;
}

interface InnerFormProps {
  faq?: FaqItem | null;
  onClose: () => void;
}

function FaqFormContent({ faq, onClose }: InnerFormProps) {
  const isEditing = Boolean(faq);
  const createMutation = useCreateFaq();
  const updateMutation = useUpdateFaq();
  const deleteSubMutation = useDeleteFaqSub();
  const { data: pageOptions = [] } = usePageTwoOptions();

  const [faqFor, setFaqFor] = useState(
    faq?.faq_for || pageOptions[0]?.page_two_url || "home",
  );
  const [status, setStatus] = useState<FaqStatus>(
    (faq?.faq_status as FaqStatus) || "Active",
  );
  const [subs, setSubs] = useState<FaqSubItem[]>(
    faq?.subs && faq.subs.length > 0
      ? faq.subs
      : [
          {
            faq_sort: 1,
            faq_heading: "General",
            faq_que: "",
            faq_ans: "",
            faq_status: "Active",
          },
        ],
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // IDs removed in the UI but still persisted on the server.
  // PUT /faq/:id does NOT auto-delete missing subs — they must be
  // explicitly removed via DELETE /faq-sub/:id on save.
  const [removedSubIds, setRemovedSubIds] = useState<(number | string)[]>([]);

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteSubMutation.isPending;

  const handleAddSub = () => {
    setSubs((prev) => [
      ...prev,
      {
        faq_sort: prev.length + 1,
        faq_heading: "General",
        faq_que: "",
        faq_ans: "",
        faq_status: "Active",
      },
    ]);
  };

  const handleRemoveSub = (index: number) => {
    if (subs.length <= 1) {
      setErrorMessage("At least one FAQ question is required.");
      return;
    }
    const target = subs[index];
    // Remember persisted rows so they can be deleted on save.
    // New (unsaved) rows have no id — just drop them locally.
    if (target?.id !== undefined && target?.id !== null && target?.id !== "") {
      setRemovedSubIds((prev) =>
        prev.includes(target.id as number | string)
          ? prev
          : [...prev, target.id as number | string],
      );
    }
    setSubs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateSub = (
    index: number,
    field: keyof FaqSubItem,
    val: string | number,
  ) => {
    setSubs((prev) =>
      prev.map((sub, i) => (i === index ? { ...sub, [field]: val } : sub)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const hasEmpty = subs.some((s) => !s.faq_que.trim() || !s.faq_ans.trim());
    if (hasEmpty) {
      setErrorMessage("Please fill out both the question and answer for all entries.");
      return;
    }

    try {
      if (isEditing && faq) {
        await updateMutation.mutateAsync({
          id: faq.id,
          payload: {
            faq_for: faqFor,
            faq_status: status,
            subs: subs.map((s, idx) => ({
              id: s.id,
              faq_sort: Number(s.faq_sort) || idx + 1,
              faq_heading: s.faq_heading || "General",
              faq_que: s.faq_que.trim(),
              faq_ans: s.faq_ans.trim(),
              faq_status:
                s.faq_status === "Inactive" || s.faq_status === 0 || s.faq_status === "0"
                  ? 0
                  : 1,
            })),
          },
        });
        // Explicitly delete rows removed in the UI.
        // Backend keeps them otherwise (PUT only upserts).
        for (const subId of removedSubIds) {
          await deleteSubMutation.mutateAsync(subId);
        }
      } else {
        await createMutation.mutateAsync({
          faq_for: faqFor,
          subs: subs.map((s, idx) => ({
            faq_sort: s.faq_sort ?? idx + 1,
            faq_heading: s.faq_heading || "General",
            faq_que: s.faq_que.trim(),
            faq_ans: s.faq_ans.trim(),
          })),
        });
      }
      onClose();
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, "Failed to save FAQ."));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit FAQ Group" : "Create FAQ Group"}</DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Modify questions and answers in this group."
            : "Add a set of frequently asked questions for a specific page."}
        </DialogDescription>
      </DialogHeader>

      {errorMessage && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="faq-for">Page Placement</Label>
            <select
              id="faq-for"
              value={faqFor}
              onChange={(e) => setFaqFor(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {pageOptions.length > 0 ? (
                pageOptions.map((p) => (
                  <option key={p.page_two_url} value={p.page_two_url}>
                    {p.page_two_name} ({p.page_two_url})
                  </option>
                ))
              ) : (
                <>
                  <option value="home">Home</option>
                  <option value="about-us">About Us</option>
                  <option value="blogs">Blogs</option>
                  <option value="contacts">Contact</option>
                </>
              )}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="faq-status">Status</Label>
            <select
              id="faq-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as FaqStatus)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Q&A Items List */}
        <div className="flex flex-col gap-3 pt-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Questions & Answers ({subs.length})
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddSub}
              className="h-7 text-xs gap-1.5"
            >
              <Plus className="size-3" />
              <span>Add Question</span>
            </Button>
          </div>

          <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
            {subs.map((sub, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 rounded-lg border border-border/70 bg-muted/20 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-foreground">
                    #{index + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Heading (e.g. General)"
                      value={sub.faq_heading || ""}
                      onChange={(e) =>
                        handleUpdateSub(index, "faq_heading", e.target.value)
                      }
                      className="h-7 text-xs w-36"
                    />
                    {subs.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSub(index)}
                        className="size-7 p-0 text-destructive hover:bg-destructive/10"
                        title="Remove question"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </div>

                <Input
                  placeholder="Question text..."
                  value={sub.faq_que}
                  onChange={(e) =>
                    handleUpdateSub(index, "faq_que", e.target.value)
                  }
                  required
                  className="text-xs"
                />

                <textarea
                  rows={2}
                  placeholder="Answer explanation..."
                  value={sub.faq_ans}
                  onChange={(e) =>
                    handleUpdateSub(index, "faq_ans", e.target.value)
                  }
                  required
                  className="w-full rounded-md border border-input bg-background p-2 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <DialogFooter className="pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : isEditing ? "Update FAQ" : "Create FAQ"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function FaqFormContainer({
  faqId,
  initialFaq,
  onClose,
}: {
  faqId?: number;
  initialFaq?: FaqItem | null;
  onClose: () => void;
}) {
  const { data: detailedFaq, isLoading } = useFaq(faqId);

  if (faqId && isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-sm text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-primary" />
        <span>Loading FAQ questions from server...</span>
      </div>
    );
  }

  const effectiveFaq = detailedFaq || initialFaq;
  return (
    <FaqFormContent
      key={effectiveFaq?.id ? `${effectiveFaq.id}-${effectiveFaq.subs?.length ?? 0}` : "new"}
      faq={effectiveFaq}
      onClose={onClose}
    />
  );
}

export function FaqFormDialog({ open, onOpenChange, faq }: FaqFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        {open && (
          <FaqFormContainer
            faqId={faq?.id}
            initialFaq={faq}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

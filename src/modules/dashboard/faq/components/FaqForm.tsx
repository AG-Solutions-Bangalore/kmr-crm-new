import { useMemo, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { SearchableSelect } from "@/components/common/SearchableSelect.tsx";
import { getApiErrorMessage } from "@/lib/axios.ts";
import { normalizePageSlug } from "@/lib/page-slug.ts";
import {
  useCreateFaq,
  useDeleteFaqSub,
  useFaq,
  usePageTwoOptions,
  useUpdateFaq,
} from "../hook/useFaq.ts";
import type { FaqItem, FaqStatus, FaqSubItem } from "../types/faq.types.ts";

interface InnerFormProps {
  faq?: FaqItem | null;
  onClose: () => void;
}

const FALLBACK_PAGE_OPTIONS = [
  { value: "home", label: "Home (home)" },
  { value: "about-us", label: "About Us (about-us)" },
  { value: "blogs", label: "Blogs (blogs)" },
  { value: "contacts", label: "Contact (contacts)" },
];

function FaqFormContent({ faq, onClose }: InnerFormProps) {
  const isEditing = Boolean(faq);
  const createMutation = useCreateFaq();
  const updateMutation = useUpdateFaq();
  const deleteSubMutation = useDeleteFaqSub();
  const { data: pageOptions = [] } = usePageTwoOptions();

  const [faqFor, setFaqFor] = useState(
    faq?.faq_for ? normalizePageSlug(faq.faq_for) : "",
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
            faq_heading: "",
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

  const pageSlugs = useMemo(
    () =>
      pageOptions.map((p) => ({
        value: normalizePageSlug(p.page_two_url),
        label: `${p.page_two_name} (${normalizePageSlug(p.page_two_url)})`,
      })),
    [pageOptions],
  );

  const placementOptions = useMemo(() => {
    const list =
      pageSlugs.length > 0 ? [...pageSlugs] : [...FALLBACK_PAGE_OPTIONS];
    if (faqFor && !list.some((o) => o.value === faqFor)) {
      list.unshift({ value: faqFor, label: `${faqFor} (${faqFor})` });
    }
    return list;
  }, [pageSlugs, faqFor]);


  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteSubMutation.isPending;

  const handleAddSub = () => {
    setSubs((prev) => [
      ...prev,
      {
        faq_sort: prev.length + 1,
        faq_heading: "",
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

    if (!faqFor.trim()) {
      setErrorMessage("Please select a page placement.");
      return;
    }

    const hasEmpty = subs.some((s) => !s.faq_que.trim() || !s.faq_ans.trim());
    if (hasEmpty) {
      setErrorMessage(
        "Please fill out both the question and answer for all entries.",
      );
      return;
    }

    try {
      if (isEditing && faq) {
        await updateMutation.mutateAsync({
          id: faq.id,
          payload: {
            faq_for: normalizePageSlug(faqFor),
            faq_status: status,
            subs: subs.map((s, idx) => ({
              id: s.id,
              faq_sort: Number(s.faq_sort) || idx + 1,
              faq_heading: s.faq_heading?.trim() || "",
              faq_que: s.faq_que.trim(),
              faq_ans: s.faq_ans.trim(),
              faq_status:
                s.faq_status === "Inactive" ||
                s.faq_status === 0 ||
                s.faq_status === "0"
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
          faq_for: normalizePageSlug(faqFor),
          subs: subs.map((s, idx) => ({
            faq_sort: s.faq_sort ?? idx + 1,
            faq_heading: s.faq_heading?.trim() || "",
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col space-y-1.5 border-b border-border/60 pb-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          {isEditing ? "Edit FAQ Group" : "Create FAQ Group"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isEditing
            ? "Modify questions, answers, and subheadings in this FAQ group."
            : "Add a set of frequently asked questions and answers for a specific website page."}
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      {/* Page placement & status */}
      <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
        <div
          className={
            isEditing
              ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
              : "grid grid-cols-1 gap-4"
          }
        >
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="faq-for"
              className="text-xs font-semibold text-foreground"
            >
              Page Placement
            </Label>
            <SearchableSelect
              id="faq-for"
              value={faqFor}
              onChange={(val) => setFaqFor(val)}
              options={placementOptions}
              placeholder="Search or select page..."
              className="h-10 text-sm"
            />
            <p className="text-[11px] text-muted-foreground">
              Select which website page displays this FAQ group. Type to search
              by page name or URL slug.
            </p>
          </div>

          {isEditing && (
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="faq-status"
                className="text-xs font-semibold text-foreground"
              >
                Status
              </Label>
              <select
                id="faq-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as FaqStatus)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <p className="text-[11px] text-muted-foreground">
                Set active to display on the live website.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Q&A Items List */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div>
            <Label className="text-sm font-semibold text-foreground">
              Questions & Answers ({subs.length})
            </Label>
            <p className="text-xs text-muted-foreground">
              Organize your FAQs with optional subheadings, questions, and
              detailed answers.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddSub}
            className="h-8 gap-1.5 text-xs font-medium"
          >
            <Plus className="size-3.5" />
            <span>Add Question</span>
          </Button>
        </div>

        <div className="flex flex-col gap-4">
          {subs.map((sub, index) => (
            <div
              key={index}
              className="flex flex-col gap-4 rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs transition-colors hover:border-border"
            >
              {/* Question Header */}
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Question #{index + 1}
                  </span>
                </div>

                {subs.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSub(index)}
                    className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive gap-1"
                    title="Remove this question"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Remove</span>
                  </Button>
                )}
              </div>

              {/* heading  (Big, dedicated space!) */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor={`faq-heading-${index}`}
                    className="text-xs font-semibold text-foreground"
                  >
                    Heading
                  </Label>
                  <span className="text-[11px] text-muted-foreground">
                    Optional section heading (e.g. General, Account & Billing,
                    Orders & Shipping)
                  </span>
                </div>
                <Input
                  id={`faq-heading-${index}`}
                  placeholder="e.g. General, Account & Billing, Orders & Shipping..."
                  value={sub.faq_heading || ""}
                  onChange={(e) =>
                    handleUpdateSub(index, "faq_heading", e.target.value)
                  }
                  className="h-10 w-full text-sm"
                />
              </div>

              {/* Question Text */}
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor={`faq-que-${index}`}
                  className="text-xs font-semibold text-foreground"
                >
                  Question <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={`faq-que-${index}`}
                  placeholder="e.g. How do I track my order or request a refund?"
                  value={sub.faq_que}
                  onChange={(e) =>
                    handleUpdateSub(index, "faq_que", e.target.value)
                  }
                  required
                  className="h-10 w-full text-sm"
                />
              </div>

              {/* Answer Explanation */}
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor={`faq-ans-${index}`}
                  className="text-xs font-semibold text-foreground"
                >
                  Answer <span className="text-destructive">*</span>
                </Label>
                <textarea
                  id={`faq-ans-${index}`}
                  rows={3}
                  placeholder="Write the detailed answer here..."
                  value={sub.faq_ans}
                  onChange={(e) =>
                    handleUpdateSub(index, "faq_ans", e.target.value)
                  }
                  required
                  className="w-full rounded-md border border-input bg-background p-3 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y min-h-[88px]"
                />
              </div>
            </div>
          ))}

          {/* Add Another Question button at the bottom */}
          <Button
            type="button"
            variant="outline"
            onClick={handleAddSub}
            className="h-10 w-full border-dashed gap-2 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <Plus className="size-4" />
            <span>Add Another Question</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 pt-3 border-t border-border/60">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending} className="min-w-[120px]">
          {isPending ? (
            <div className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              <span>Saving...</span>
            </div>
          ) : (
            "Save"
          )}
        </Button>
      </div>
    </form>
  );
}

export function FaqFormContainer({
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
      key={
        effectiveFaq?.id
          ? `${effectiveFaq.id}-${effectiveFaq.subs?.length ?? 0}`
          : "new"
      }
      faq={effectiveFaq}
      onClose={onClose}
    />
  );
}

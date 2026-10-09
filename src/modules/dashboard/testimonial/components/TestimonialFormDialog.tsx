import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
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
import { normalizePageSlug } from "@/lib/page-slug.ts";
import {
  useCreateTestimonial,
  usePageOneOptions,
  useTestimonial,
  useUpdateTestimonial,
} from "../hook/useTestimonial.ts";
import type { TestimonialItem, TestimonialStatus } from "../types/testimonial.types.ts";

interface TestimonialFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testimonial?: TestimonialItem | null;
}

interface InnerFormProps {
  testimonial?: TestimonialItem | null;
  onClose: () => void;
}

function TestimonialFormContent({ testimonial, onClose }: InnerFormProps) {
  const isEditing = Boolean(testimonial);
  const createMutation = useCreateTestimonial();
  const updateMutation = useUpdateTestimonial();
  const { data: pageOptions = [] } = usePageOneOptions();

  const [testimonialFor, setTestimonialFor] = useState(
    testimonial?.testimonial_for ? normalizePageSlug(testimonial.testimonial_for) : "",
  );
  const [clientName, setClientName] = useState(
    testimonial?.testimonial_client_name || "",
  );
  const [description, setDescription] = useState(
    testimonial?.testimonial_description || "",
  );
  const [rating, setRating] = useState(
    String(testimonial?.testimonial_rating ?? "5"),
  );
  const [status, setStatus] = useState<TestimonialStatus>(
    (testimonial?.testimonial_status as TestimonialStatus) || "Active",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pageSlugs = useMemo(
    () =>
      pageOptions.map((p) => ({
        value: normalizePageSlug(p.page_url),
        label: `${p.page_name} (${normalizePageSlug(p.page_url)})`,
      })),
    [pageOptions],
  );


  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!testimonialFor) {
      setErrorMessage("Please select a page placement.");
      return;
    }
    if (!clientName.trim()) {
      setErrorMessage("Please enter client / author name.");
      return;
    }
    if (!description.trim()) {
      setErrorMessage("Please enter the testimonial review text.");
      return;
    }

    try {
      if (isEditing && testimonial) {
        await updateMutation.mutateAsync({
          id: testimonial.id,
          payload: {
            testimonial_for: normalizePageSlug(testimonialFor),
            testimonial_client_name: clientName.trim(),
            testimonial_description: description.trim(),
            testimonial_rating: Number(rating) || 5,
            testimonial_status: status,
          },
        });
      } else {
        await createMutation.mutateAsync({
          testimonial_for: normalizePageSlug(testimonialFor),
          testimonial_client_name: clientName.trim(),
          testimonial_description: description.trim(),
          testimonial_rating: Number(rating) || 5,
          testimonial_status: "Active",
        });
      }
      onClose();
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, "Failed to save testimonial."));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Edit Testimonial" : "Add Testimonial"}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Update client review and rating."
            : "Capture customer feedback and praise for display on website pages."}
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
            <Label htmlFor="t-for">Page Placement</Label>
            <select
              id="t-for"
              value={testimonialFor}
              onChange={(e) => setTestimonialFor(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Select page placement...</option>
              {pageSlugs.length > 0 ? (
                pageSlugs.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
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
            <Label htmlFor="t-rating">Rating (1 to 5 Stars)</Label>
            <select
              id="t-rating"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
              <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
              <option value="3">⭐⭐⭐ (3 Stars)</option>
              <option value="2">⭐⭐ (2 Stars)</option>
              <option value="1">⭐ (1 Star)</option>
            </select>
          </div>
        </div>

        <div className={isEditing ? "grid grid-cols-2 gap-3" : "grid gap-3"}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="t-client">
              Client Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="t-client"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. John Doe"
              required
            />
          </div>

          {isEditing && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="t-status">Status</Label>
              <select
                id="t-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TestimonialStatus)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="t-desc">
            Testimonial Review <span className="text-destructive">*</span>
          </Label>
          <textarea
            id="t-desc"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write the client testimonial or feedback quote..."
            className="w-full rounded-md border border-input bg-background p-2.5 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            required
          />
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
          {isPending ? "Saving..." : "Save"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function TestimonialFormDialog({
  open,
  onOpenChange,
  testimonial,
}: TestimonialFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {open && (
          <TestimonialFormContainer
            testimonialId={testimonial?.id}
            initialTestimonial={testimonial}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function TestimonialFormContainer({
  testimonialId,
  initialTestimonial,
  onClose,
}: {
  testimonialId?: number;
  initialTestimonial?: TestimonialItem | null;
  onClose: () => void;
}) {
  // GET /testimonial/:id — fetch fresh details for edit, like FAQ edit does.
  const { data: detailedTestimonial, isLoading } =
    useTestimonial(testimonialId);

  if (testimonialId && isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-sm text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-primary" />
        <span>Loading testimonial details from server...</span>
      </div>
    );
  }

  const effectiveTestimonial = detailedTestimonial || initialTestimonial;
  return (
    <TestimonialFormContent
      key={
        effectiveTestimonial?.id
          ? `${effectiveTestimonial.id}-${effectiveTestimonial.updated_at ?? ""}-${effectiveTestimonial.testimonial_description?.length ?? 0}`
          : "new-testimonial"
      }
      testimonial={effectiveTestimonial}
      onClose={onClose}
    />
  );
}

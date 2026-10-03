import { useState } from "react";
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
import { useCreateNews, useUpdateNews } from "../hook/useNews.ts";
import type { NewsItem, NewsStatus } from "../types/news.types.ts";

interface NewsFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  news?: NewsItem | null;
}

interface InnerFormProps {
  news?: NewsItem | null;
  onClose: () => void;
}

function NewsFormContent({ news, onClose }: InnerFormProps) {
  const isEditing = Boolean(news);
  const createMutation = useCreateNews();
  const updateMutation = useUpdateNews();

  const [heading, setHeading] = useState(news?.news_heading || "");
  const [details, setDetails] = useState(news?.news_details || "");
  const [categoryId, setCategoryId] = useState(String(news?.category_id ?? "1"));
  const [status, setStatus] = useState<NewsStatus>(
    (news?.news_status as NewsStatus) || "Active",
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [otherImageFile, setOtherImageFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!heading.trim()) {
      setErrorMessage("News heading is required.");
      return;
    }
    if (!details.trim()) {
      setErrorMessage("News details are required.");
      return;
    }

    try {
      if (isEditing && news) {
        await updateMutation.mutateAsync({
          id: news.id,
          payload: {
            category_id: categoryId,
            news_heading: heading.trim(),
            news_details: details.trim(),
            news_status: status,
            news_image: imageFile ?? undefined,
            news_other_image: otherImageFile ?? undefined,
          },
        });
      } else {
        await createMutation.mutateAsync({
          category_id: categoryId,
          news_heading: heading.trim(),
          news_details: details.trim(),
          news_status: status,
          news_image: imageFile ?? undefined,
          news_other_image: otherImageFile ?? undefined,
        });
      }
      onClose();
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, "Failed to save news article."));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Edit News Article" : "Publish News Article"}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Update article content, category, or attachments."
            : "Publish market updates, duty alerts, and industry news."}
        </DialogDescription>
      </DialogHeader>

      {errorMessage && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="n-heading">
            Headline / Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="n-heading"
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            placeholder="e.g. Edible Oil Market Update — Midday Prices"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="n-cat">Category ID</Label>
            <Input
              id="n-cat"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              placeholder="1"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="n-status">Status</Label>
            <select
              id="n-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as NewsStatus)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="n-details">
            Article Details / Summary <span className="text-destructive">*</span>
          </Label>
          <textarea
            id="n-details"
            rows={4}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Write the full report or update details..."
            required
            className="w-full rounded-md border border-input bg-background p-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="n-image">Featured Image</Label>
            <Input
              id="n-image"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setImageFile(file);
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="n-other-image">Attachment / PDF / Doc</Label>
            <Input
              id="n-other-image"
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setOtherImageFile(file);
              }}
            />
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
          {isPending
            ? "Saving..."
            : isEditing
              ? "Update Article"
              : "Publish Article"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function NewsFormDialog({
  open,
  onOpenChange,
  news,
}: NewsFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        {open && (
          <NewsFormContent
            key={news?.id ?? "new-news"}
            news={news}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useState } from "react";
import { FileText, Loader2, X } from "lucide-react";
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
import { resolveAssetImageUrl } from "@/lib/image.ts";
import { CategorySelectWithCreate } from "@/components/common/EntitySelectWithCreate.tsx";
import { useCreateNews, useNewsItem, useUpdateNews } from "../hook/useNews.ts";
import {
  useActiveCategories,
  useCategories,
} from "../../category/hook/useCategory.ts";
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
  const { data: activeCategories = [] } = useActiveCategories();
  const { data: allCategories = [] } = useCategories();
  const categories =
    activeCategories.length > 0 ? activeCategories : allCategories;
  const [categoryId, setCategoryId] = useState(String(news?.category_id ?? ""));

  useEffect(() => {
    if (!categoryId && categories.length > 0) {
      setCategoryId(String(categories[0].id));
    }
  }, [categories, categoryId]);

  const [status, setStatus] = useState<NewsStatus>(
    (news?.news_status as NewsStatus) || "Active",
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [otherImageFile, setOtherImageFile] = useState<File | null>(null);
  const [newPreviewUrl, setNewPreviewUrl] = useState<string | null>(null);
  const [existingImgError, setExistingImgError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!imageFile) {
      setNewPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setNewPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const existingImageUrl = resolveAssetImageUrl(news?.news_image, "news_images");

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
    if (!categoryId) {
      setErrorMessage("Please select a category.");
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
          news_status: "Active",
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
    <form
      onSubmit={handleSubmit}
      onKeyDown={(e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
          e.preventDefault();
          void handleSubmit(e);
        }
      }}
      className="flex flex-col gap-4"
    >
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
          <div className="flex items-center justify-between">
            <Label htmlFor="n-heading">
              Headline / Title <span className="text-destructive">*</span>
            </Label>
            <span className="text-[11px] text-muted-foreground">
              {heading.length} chars
            </span>
          </div>
          <Input
            id="n-heading"
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            placeholder="e.g. Edible Oil Market Update — Midday Prices"
            required
          />
        </div>

        <div className={isEditing ? "grid grid-cols-2 gap-3" : "grid gap-3"}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="n-cat">Category</Label>
            <CategorySelectWithCreate
              id="n-cat"
              value={categoryId}
              onChange={setCategoryId}
              options={categories.map((c) => ({
                value: String(c.id),
                label: `${c.categories_name} (ID: ${c.id})`,
              }))}
              placeholder="Select category — or + to create one"
              required
            />
            {news?.categories_name && (
              <p className="text-xs text-muted-foreground">
                Current: {news.categories_name} (ID: {news.category_id})
              </p>
            )}
          </div>

          {isEditing && (
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
          )}
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

        <div className="grid grid-cols-1 gap-3">
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
            {newPreviewUrl ? (
              <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 p-2">
                <img
                  src={newPreviewUrl}
                  alt="New image preview"
                  className="size-16 shrink-0 rounded-md border border-border/60 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground">
                    New image preview
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {imageFile?.name}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setImageFile(null)}
                  className="size-7 shrink-0 p-0"
                  title="Remove selected image"
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            ) : (
              existingImageUrl && (
                <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 p-2">
                  {existingImgError ? (
                    <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-md border border-destructive/30 bg-destructive/10 p-1 text-center">
                      <span className="text-[10px] font-medium leading-tight text-destructive">
                        Preview not available
                      </span>
                    </div>
                  ) : (
                    <img
                      src={existingImageUrl}
                      alt={heading || "Currently uploaded"}
                      className="size-16 shrink-0 rounded-md border border-border/60 object-cover"
                      onError={() => setExistingImgError(true)}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-foreground">
                      Currently uploaded
                    </p>
                    <p className="text-[11px] text-muted-foreground/80">
                      Upload a new file to replace it.
                    </p>
                  </div>
                </div>
              )
            )}
            {!existingImageUrl && !newPreviewUrl && (
              <p className="text-xs text-muted-foreground">
                No image uploaded yet.
              </p>
            )}
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
            {otherImageFile ? (
              <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 p-2">
                <FileText className="size-5 shrink-0 text-muted-foreground" />
                <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                  {otherImageFile.name}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setOtherImageFile(null)}
                  className="size-7 shrink-0 p-0"
                  title="Remove selected file"
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            ) : (
              news?.news_other_image && (
                <p className="truncate text-xs text-muted-foreground">
                  Current: {news.news_other_image}
                </p>
              )
            )}
          </div>
        </div>
      </div>

      <DialogFooter className="pt-2 flex-row items-center justify-between sm:justify-between">
        <span className="hidden text-xs text-muted-foreground sm:inline">
          <kbd className="rounded border border-border/80 bg-muted px-1.5 py-0.5 font-mono text-[10px]">
            Ctrl+Enter
          </kbd>{" "}
          to {isEditing ? "update" : "publish"}
        </span>
        <div className="flex gap-2">
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
        </div>
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
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        {open && (
          <NewsFormContainer
            newsId={news?.id}
            initialNews={news}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function NewsFormContainer({
  newsId,
  initialNews,
  onClose,
}: {
  newsId?: number;
  initialNews?: NewsItem | null;
  onClose: () => void;
}) {
  // GET /news/:id — fetch fresh details for edit.
  const { data: detailedNews, isLoading } = useNewsItem(newsId);

  if (newsId && isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-sm text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-primary" />
        <span>Loading news details from server...</span>
      </div>
    );
  }

  const effectiveNews = detailedNews || initialNews;
  return (
    <NewsFormContent
      key={
        effectiveNews?.id
          ? `${effectiveNews.id}-${effectiveNews.updated_at ?? ""}-${effectiveNews.news_image?.length ?? 0}`
          : "new-news"
      }
      news={effectiveNews}
      onClose={onClose}
    />
  );
}

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
import { useCreateBlog, useUpdateBlog } from "../hook/useBlog.ts";
import type { BlogItem, BlogStatus } from "../types/blog.types.ts";

interface BlogFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blog?: BlogItem | null;
}

interface InnerFormProps {
  blog?: BlogItem | null;
  onClose: () => void;
}

function BlogFormContent({ blog, onClose }: InnerFormProps) {
  const isEditing = Boolean(blog);
  const createMutation = useCreateBlog();
  const updateMutation = useUpdateBlog();

  const [title, setTitle] = useState(blog?.blog_title || "");
  const [slug, setSlug] = useState(blog?.blog_slug || "");
  const [shortDesc, setShortDesc] = useState(blog?.blog_short_description || "");
  const [description, setDescription] = useState(blog?.blog_description || "");
  const [categoriesIds, setCategoriesIds] = useState(
    blog?.blog_categories_ids || "1",
  );
  const [metaKeywords, setMetaKeywords] = useState(
    blog?.blog_meta_keywords || "",
  );
  const [featured, setFeatured] = useState(String(blog?.blog_featured ?? "0"));
  const [front, setFront] = useState(String(blog?.blog_front ?? "1"));
  const [status, setStatus] = useState<BlogStatus>(
    (blog?.blog_status as BlogStatus) || "Active",
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "-")
          .replace(/^-+|-+$/g, ""),
      );
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage("Blog title is required.");
      return;
    }
    if (!shortDesc.trim()) {
      setErrorMessage("Short description is required.");
      return;
    }

    try {
      if (isEditing && blog) {
        await updateMutation.mutateAsync({
          id: blog.id,
          payload: {
            blog_title: title.trim(),
            blog_slug: slug.trim(),
            blog_short_description: shortDesc.trim(),
            blog_description: description.trim(),
            blog_categories_ids: categoriesIds.trim(),
            blog_meta_keywords: metaKeywords.trim(),
            blog_featured: featured,
            blog_front: front,
            blog_status: status,
            blog_banner_image: imageFile ?? undefined,
          },
        });
      } else {
        await createMutation.mutateAsync({
          blog_title: title.trim(),
          blog_slug: slug.trim(),
          blog_short_description: shortDesc.trim(),
          blog_description: description.trim(),
          blog_categories_ids: categoriesIds.trim(),
          blog_meta_keywords: metaKeywords.trim(),
          blog_featured: featured,
          blog_front: front,
          blog_status: status,
          blog_banner_image: imageFile ?? undefined,
        });
      }
      onClose();
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, "Failed to save blog post."));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Edit Blog Post" : "Create Blog Post"}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Modify blog content and SEO metadata."
            : "Compose and publish insightful articles for SEO and audience engagement."}
        </DialogDescription>
      </DialogHeader>

      {errorMessage && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="b-title">
            Article Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="b-title"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="e.g. 5 Trends Shaping Edible Oil Markets in 2026"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="b-slug">URL Slug</Label>
            <Input
              id="b-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. 5-trends-edible-oil-markets"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="b-cat">Category IDs</Label>
            <Input
              id="b-cat"
              value={categoriesIds}
              onChange={(e) => setCategoriesIds(e.target.value)}
              placeholder="e.g. 1"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="b-short">
            Short Summary <span className="text-destructive">*</span>
          </Label>
          <Input
            id="b-short"
            value={shortDesc}
            onChange={(e) => setShortDesc(e.target.value)}
            placeholder="A punchy 1-2 sentence overview for cards and meta descriptions"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="b-meta">Meta Keywords</Label>
          <Input
            id="b-meta"
            value={metaKeywords}
            onChange={(e) => setMetaKeywords(e.target.value)}
            placeholder="e.g. oil, mustard, refined, commodity"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="b-desc">Article Body Content</Label>
          <textarea
            id="b-desc"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write the full blog post text or HTML..."
            className="w-full rounded-md border border-input bg-background p-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="b-status">Status</Label>
            <select
              id="b-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as BlogStatus)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="b-featured">Featured Post</Label>
            <select
              id="b-featured"
              value={featured}
              onChange={(e) => setFeatured(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="0">No</option>
              <option value="1">Yes (Featured)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="b-front">Homepage Front</Label>
            <select
              id="b-front"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="1">Show on Front</option>
              <option value="0">Hide from Front</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="b-image">Banner Image</Label>
          <Input
            id="b-image"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setImageFile(file);
            }}
          />
          {blog?.blog_banner_image && !imageFile && (
            <p className="text-xs text-muted-foreground truncate">
              Current: {blog.blog_banner_image}
            </p>
          )}
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
          {isPending ? "Saving..." : isEditing ? "Update Post" : "Publish Post"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function BlogFormDialog({
  open,
  onOpenChange,
  blog,
}: BlogFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        {open && (
          <BlogFormContent
            key={blog?.id ?? "new-blog"}
            blog={blog}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { getApiErrorMessage } from "@/lib/axios.ts";
import { resolveAssetImageUrl } from "@/lib/image.ts";
import { RichTextEditor } from "@/components/common/RichTextEditor.tsx";
import { useBlog, useCreateBlog, useUpdateBlog } from "../hook/useBlog.ts";
import type { BlogItem, BlogStatus } from "../types/blog.types.ts";

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
  const [bannerAlt, setBannerAlt] = useState(blog?.blog_banner_image_alt || "");
  const [featured, setFeatured] = useState(String(blog?.blog_featured ?? "0"));
  const [front, setFront] = useState(String(blog?.blog_front ?? "1"));
  const [blogIndex, setBlogIndex] = useState(blog?.blog_index || "Yes");
  const [status, setStatus] = useState<BlogStatus>(
    (blog?.blog_status as BlogStatus) || "Active",
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [newPreviewUrl, setNewPreviewUrl] = useState<string | null>(null);
  const [existingImgError, setExistingImgError] = useState(false);
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

  // Preview for newly selected file (revoke on change/unmount).
  useEffect(() => {
    if (!imageFile) {
      setNewPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setNewPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const existingImageUrl = resolveAssetImageUrl(
    blog?.blog_banner_image,
    "blog_images",
  );

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
    // Backend returns 422 "Banner Alt is Required." — validate up front.
    if (!bannerAlt.trim()) {
      setErrorMessage("Banner alt text is required.");
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
            blog_banner_image_alt: bannerAlt.trim(),
            blog_featured: featured,
            blog_front: front,
            blog_index: blogIndex,
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
          blog_banner_image_alt: bannerAlt.trim(),
          blog_featured: featured,
          blog_front: front,
          blog_index: blogIndex,
          blog_status: "Active",
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
      <div className="flex flex-col space-y-1.5 text-center sm:text-left">
        <h2 className="text-lg font-semibold leading-none tracking-tight">
          {isEditing ? "Edit Blog Post" : "Create Blog Post"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isEditing
            ? "Modify blog content and SEO metadata."
            : "Compose and publish insightful articles for SEO and audience engagement."}
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          {errorMessage}
        </div>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
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
          <Label htmlFor="b-desc">Article Body Content</Label>
          <RichTextEditor
            id="b-desc"
            value={description}
            onChange={setDescription}
            placeholder="Write the full blog post text or HTML..."
          />
        </div>
        </div>

        <div className="flex flex-col gap-4">
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

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="b-meta">Meta Keywords</Label>
            <Input
              id="b-meta"
              value={metaKeywords}
              onChange={(e) => setMetaKeywords(e.target.value)}
              placeholder="e.g. oil, mustard, refined, commodity"
            />
          </div>

        <div className="grid grid-cols-2 gap-3">
          {isEditing && (
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
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="b-index">Blog Index (Yes/No)</Label>
            <select
              id="b-index"
              value={blogIndex}
              onChange={(e) => setBlogIndex(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
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
          {newPreviewUrl ? (
            <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 p-2">
              <img
                src={newPreviewUrl}
                alt={bannerAlt || "New banner preview"}
                className="size-16 shrink-0 rounded-md border border-border/60 object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground">
                  New banner preview
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
                    alt={bannerAlt || "Currently uploaded banner"}
                    className="size-16 shrink-0 rounded-md border border-border/60 object-cover"
                    onError={() => setExistingImgError(true)}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground">
                    Currently uploaded
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {blog?.blog_banner_image}
                  </p>
                  {existingImgError && (
                    <p className="text-[11px] text-destructive">
                      File not found at this URL — check folder/filename.
                    </p>
                  )}
                  <p className="text-[11px] text-muted-foreground/80">
                    Upload a new file to replace it.
                  </p>
                </div>
              </div>
            )
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="b-alt">
            Banner Alt <span className="text-destructive">*</span>
          </Label>
          <Input
            id="b-alt"
            value={bannerAlt}
            onChange={(e) => setBannerAlt(e.target.value)}
            placeholder="e.g. Edible oil market trends 2026"
            required
          />
        </div>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-2">
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
      </div>
    </form>
  );
}

export function BlogFormContainer({
  blogId,
  initialBlog,
  onClose,
}: {
  blogId?: number;
  initialBlog?: BlogItem | null;
  onClose: () => void;
}) {
  // GET /blog/:id — fetch fresh details for edit, like client/gallery edit.
  const { data: detailedBlog, isLoading } = useBlog(blogId);

  if (blogId && isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-sm text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-primary" />
        <span>Loading blog details from server...</span>
      </div>
    );
  }

  const effectiveBlog = detailedBlog || initialBlog;
  return (
    <BlogFormContent
      key={
        effectiveBlog?.id
          ? `${effectiveBlog.id}-${effectiveBlog.updated_at ?? ""}-${effectiveBlog.blog_banner_image?.length ?? 0}`
          : "new-blog"
      }
      blog={effectiveBlog}
      onClose={onClose}
    />
  );
}

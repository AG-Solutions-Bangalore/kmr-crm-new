import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { PATHS } from "@/constants/paths.ts";
import { BlogFormContainer } from "../components/BlogFormDialog.tsx";

/** Full-page create/edit for blog posts — replaces the cramped dialog. */
export function BlogFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const parsedId = id ? Number(id) : undefined;
  const blogId = parsedId !== undefined && !Number.isNaN(parsedId) ? parsedId : undefined;
  const isEditing = Boolean(blogId);

  const goBack = () => navigate(PATHS.blog);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={goBack} className="gap-2">
          <ArrowLeft className="size-4" />
          <span>Back to Blog</span>
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <BlogFormContainer
            key={isEditing ? `edit-blog-${blogId}` : "new-blog"}
            blogId={blogId}
            onClose={goBack}
          />
        </CardContent>
      </Card>
    </div>
  );
}

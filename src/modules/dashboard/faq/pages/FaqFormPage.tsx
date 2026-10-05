import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { PATHS } from "@/constants/paths.ts";
import { FaqFormContainer } from "../components/FaqFormDialog.tsx";

/** Full-page create/edit for FAQ groups — replaces the cramped dialog. */
export function FaqFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const parsedId = id ? Number(id) : undefined;
  const faqId = parsedId !== undefined && !Number.isNaN(parsedId) ? parsedId : undefined;
  const isEditing = Boolean(faqId);

  const goBack = () => navigate(PATHS.faq);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={goBack} className="gap-2">
          <ArrowLeft className="size-4" />
          <span>Back to FAQs</span>
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <FaqFormContainer
            key={isEditing ? `edit-faq-${faqId}` : "new-faq"}
            faqId={faqId}
            onClose={goBack}
          />
        </CardContent>
      </Card>
    </div>
  );
}

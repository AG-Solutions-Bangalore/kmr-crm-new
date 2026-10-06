import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { PATHS } from "@/constants/paths.ts";
import { VendorRateFormContainer } from "../components/VendorRateFormDialog.tsx";

/** Full-page create/edit for vendor standard rates — replaces the cramped dialog. */
export function VendorRateFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const parsedId = id ? Number(id) : undefined;
  const rateId = parsedId !== undefined && !Number.isNaN(parsedId) ? parsedId : undefined;
  const isEditing = Boolean(rateId);

  const goBack = () => navigate(`${PATHS.vendor}?tab=rates`);

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={goBack} className="gap-2">
          <ArrowLeft className="size-4" />
          <span>Back to Rates</span>
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <VendorRateFormContainer
            key={isEditing ? `edit-rate-${rateId}` : "new-rate"}
            rateId={rateId}
            type="standard"
            onClose={goBack}
          />
        </CardContent>
      </Card>
    </div>
  );
}

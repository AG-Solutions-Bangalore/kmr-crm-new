import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { PATHS } from "@/constants/paths.ts";
import { VendorSpotFormContainer } from "../components/VendorSpotFormDialog.tsx";

/** Full-page create/edit for vendor spot quotes — replaces the cramped dialog. */
export function VendorSpotFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const parsedId = id ? Number(id) : undefined;
  const spotId = parsedId !== undefined && !Number.isNaN(parsedId) ? parsedId : undefined;
  const isEditing = Boolean(spotId);

  const goBack = () => navigate(`${PATHS.vendor}?tab=spots`);

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={goBack} className="gap-2">
          <ArrowLeft className="size-4" />
          <span>Back to Spot Rates</span>
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <VendorSpotFormContainer
            key={isEditing ? `edit-spot-${spotId}` : "new-spot"}
            spotId={spotId}
            onClose={goBack}
          />
        </CardContent>
      </Card>
    </div>
  );
}

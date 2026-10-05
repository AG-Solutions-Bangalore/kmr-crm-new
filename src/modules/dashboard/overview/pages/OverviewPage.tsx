import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { APP_NAME, APP_TAGLINE } from "@/constants/app.ts";
import { CompanyStatusCard } from "../components/CompanyStatusCard.tsx";

export function OverviewPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Card */}
      <Card className="relative overflow-hidden border-border/80 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">{APP_NAME}</CardTitle>
          <CardDescription>{APP_TAGLINE}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground -mt-2.5">
            Welcome back. Below is a real-time summary across all connected CRM
            modules and APIs.
          </p>
        </CardContent>
      </Card>

      {/* Company Info */}
      <CompanyStatusCard />
    </div>
  );
}

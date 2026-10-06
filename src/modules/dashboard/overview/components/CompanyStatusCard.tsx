import { Loader2, Mail, MapPin, Phone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { getApiErrorMessage } from "@/lib/axios";
import { useCheckStatus } from "@/modules/auth/login/hook/useCheckStatus.ts";

/** Live company info from GET /panel-check-status. */
export function CompanyStatusCard() {
  const status = useCheckStatus();

  if (status.isPending) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="animate-spin" />
            Checking server status…
          </p>
        </CardContent>
      </Card>
    );
  }

  if (status.isError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-destructive">
            {getApiErrorMessage(status.error, "Server status unavailable.")}
          </p>
        </CardContent>
      </Card>
    );
  }

  const company = status.data.company_detils;
  const companyImageBase =
    status.data.image_url.find((item) => item.image_for === "Company")
      ?.image_url ?? "";
  const logoUrl = company.company_logo
    ? `${companyImageBase}${company.company_logo}`
    : "";
  const mobiles = [company.company_mobile_no, company.company_mobile_no2]
    .filter(Boolean)
    .join(" · ");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar className="size-11">
            {logoUrl ? (
              <AvatarImage src={logoUrl} alt={company.company_name} />
            ) : null}
            <AvatarFallback>{company.company_short.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <CardTitle className="truncate">{company.company_name}</CardTitle>
            <CardDescription>
              {company.company_place} · Panel v
              {status.data.version.version_panel}
            </CardDescription>
          </div>
          <Badge
            className="ml-auto animate-pulse bg-green-500 shadow-lg shadow-green-500/30 shrink-0"
            variant={company.company_status === "Active" ? "default" : "secondary"}
          >
            {company.company_status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm sm:grid-cols-3">
        <p className="flex items-center gap-2 text-muted-foreground">
          <Mail className="size-4 shrink-0" />
          <span className="truncate">{company.company_email}</span>
        </p>
        {mobiles ? (
          <p className="flex items-center gap-2 text-muted-foreground">
            <Phone className="size-4 shrink-0" />
            <span className="truncate">{mobiles}</span>
          </p>
        ) : null}
        {company.company_address ? (
          <p className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="size-4 shrink-0" />
            <span className="truncate">{company.company_address}</span>
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

import { useCheckStatus } from "@/modules/auth/login/hook/useCheckStatus.ts";
import { APP_NAME } from "@/constants/app.ts";

const FALLBACK_LOGO = "/logo.png";

/** Live company logo from GET /panel-check-status. Falls back to bundled logo. */
export function useCompanyLogo(): string {
  const { data } = useCheckStatus();
  const company = data?.company_detils;
  if (!company?.company_logo) return FALLBACK_LOGO;
  const base =
    data?.image_url.find((item) => item.image_for === "Company")?.image_url ?? "";
  return `${base}${company.company_logo}`;
}

export function CompanyLogo({ className }: { className?: string }) {
  const logoUrl = useCompanyLogo();
  return (
    <img
      src={logoUrl}
      alt={APP_NAME}
      className={className ?? "h-5 w-auto max-w-[125px] object-contain"}
    />
  );
}

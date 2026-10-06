import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { APP_NAME, APP_TAGLINE } from "@/constants/app.ts";
import { PATHS } from "@/constants/paths.ts";
import { Mail, MessageSquare, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useDashboardCounts } from "../hook/useDashboard.ts";

interface StatItem {
  label: string;
  count: number | string;
  path: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

export function OverviewPage() {
  // GET /dashboard — the only data source for these metrics.
  const { data: dashboardCounts, isLoading: loadingDashboard } =
    useDashboardCounts();

  const stats: StatItem[] = [
    {
      label: "Enquiries",
      count: loadingDashboard ? "—" : (dashboardCounts?.enquiry_count ?? 0),
      path: PATHS.enquiry,
      icon: MessageSquare,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-500/10",
    },
    {
      label: "Subscribers",
      count: loadingDashboard ? "—" : (dashboardCounts?.newsletter_count ?? 0),
      path: PATHS.newsletter,
      icon: Mail,
      color: "text-pink-600 dark:text-pink-400",
      bg: "bg-pink-500/10",
    },
  ];

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

      {/* Live Metrics Grid */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
          Live System Metrics
        </h2>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {stats.map((s) => (
            <Link
              key={s.label}
              to={s.path}
              className="group block rounded-xl border border-border/80 bg-card p-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex size-8 items-center justify-center rounded-lg ${s.bg} ${s.color}`}
                >
                  <s.icon className="size-4" />
                </span>
                <span className="text-lg font-bold text-foreground">
                  {s.count}
                </span>
              </div>
              <p className="mt-2 text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors truncate">
                {s.label}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

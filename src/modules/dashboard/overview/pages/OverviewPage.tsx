import { Link } from "react-router-dom";
import {
  FolderTree,
  MessageSquare,
  Newspaper,
  Store,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { APP_NAME, APP_TAGLINE } from "@/constants/app.ts";
import { PATHS } from "@/constants/paths.ts";
import { CompanyStatusCard } from "../components/CompanyStatusCard.tsx";

interface QuickLink {
  title: string;
  description: string;
  path: string;
  icon: LucideIcon;
}

const QUICK_LINKS: QuickLink[] = [
  {
    title: "Vendors",
    description: "Manage vendors and their details.",
    path: PATHS.vendor,
    icon: Store,
  },
  {
    title: "Categories",
    description: "Manage product categories.",
    path: PATHS.category,
    icon: FolderTree,
  },
  {
    title: "Enquiries",
    description: "View and manage customer enquiries.",
    path: PATHS.enquiry,
    icon: MessageSquare,
  },
  {
    title: "News",
    description: "Publish and manage news articles.",
    path: PATHS.news,
    icon: Newspaper,
  },
];

export function OverviewPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card className="relative overflow-hidden border-border/80 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">{APP_NAME}</CardTitle>
          <CardDescription>{APP_TAGLINE}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground -mt-2.5">
            Welcome back. Pick a module below or use the sidebar to navigate.
          </p>
        </CardContent>
      </Card>

      <CompanyStatusCard />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {QUICK_LINKS.map((link) => (
          <Card
            key={link.path}
            className="group transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2.5 text-base">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground shadow-sm">
                  <link.icon className="size-4 shrink-0" />
                </span>
                {link.title}
              </CardTitle>
              <CardDescription>{link.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                asChild
                className="w-full transition-colors group-hover:border-primary/40 group-hover:bg-primary/5 group-hover:text-primary"
              >
                <Link to={link.path}>Open {link.title}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

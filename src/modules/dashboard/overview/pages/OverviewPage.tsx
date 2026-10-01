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
      <Card>
        <CardHeader>
          <CardTitle>{APP_NAME}</CardTitle>
          <CardDescription>{APP_TAGLINE}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Welcome back. Pick a module below or use the sidebar to navigate.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {QUICK_LINKS.map((link) => (
          <Card key={link.path}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <link.icon className="size-4 shrink-0" />
                {link.title}
              </CardTitle>
              <CardDescription>{link.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <Link to={link.path}>Open {link.title}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

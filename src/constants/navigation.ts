import {
  Bell,
  FileText,
  FolderTree,
  Globe,
  HelpCircle,
  Images,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Newspaper,
  Quote,
  SlidersHorizontal,
  Store,
  Users,
  type LucideIcon,
} from "lucide-react";
import { PATHS } from "./paths.ts";

export interface NavItem {
  title: string;
  description: string;
  path: string;
  icon: LucideIcon;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

/**
 * Sidebar navigation. To expose a new module in the sidebar,
 * just append `{ title, description, path, icon }` here —
 * the route itself lives in `src/routes.tsx`.
 */
export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Main",
    items: [
      {
        title: "Overview",
        description: "Dashboard home and quick links.",
        path: PATHS.overview,
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Catalog",
    items: [
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
        title: "News",
        description: "Publish and manage news articles.",
        path: PATHS.news,
        icon: Newspaper,
      },
      {
        title: "Blog",
        description: "Publish and manage blog posts.",
        path: PATHS.blog,
        icon: FileText,
      },
      {
        title: "Gallery",
        description: "Manage gallery images.",
        path: PATHS.gallery,
        icon: Images,
      },
      {
        title: "Sliders",
        description: "Manage home & category banner sliders.",
        path: PATHS.slider,
        icon: SlidersHorizontal,
      },
    ],
  },
  {
    label: "Engagement",
    items: [
      {
        title: "Enquiries",
        description: "View and manage customer enquiries.",
        path: PATHS.enquiry,
        icon: MessageSquare,
      },
      {
        title: "Newsletter",
        description: "Manage newsletter subscribers.",
        path: PATHS.newsletter,
        icon: Mail,
      },
      {
        title: "Notifications",
        description: "Manage push notifications.",
        path: PATHS.notification,
        icon: Bell,
      },
      {
        title: "FAQs",
        description: "Manage frequently asked questions.",
        path: PATHS.faq,
        icon: HelpCircle,
      },
      {
        title: "Testimonials",
        description: "Manage customer testimonials.",
        path: PATHS.testimonial,
        icon: Quote,
      },
      {
        title: "Clients",
        description: "Manage clients.",
        path: PATHS.client,
        icon: Users,
      },
      {
        title: "Site Pages",
        description: "Configure site page routes.",
        path: PATHS.pages,
        icon: Globe,
      },
    ],
  },
];

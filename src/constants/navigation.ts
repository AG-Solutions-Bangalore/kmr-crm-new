import {
  Bell,
  Clock,
  Download,
  FileText,
  FolderTree,
  GitBranch,
  HelpCircle,
  Images,
  IndianRupee,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Newspaper,
  Quote,
  Radio,
  SlidersHorizontal,
  Sparkles,
  Store,
  Users,
  type LucideIcon,
} from "lucide-react";
import { PATHS } from "./paths.ts";

export interface NavChildItem {
  title: string;
  path: string;
  icon?: LucideIcon;
}

export interface NavEntry {
  title: string;
  path?: string;
  icon: LucideIcon;
  /** Allowed user types: 3 = Superadmin, 2 = Admin. If omitted, visible to both. */
  userTypes?: number[];
  children?: NavChildItem[];
}

/**
 * Sidebar navigation matching role access:
 * - Admin (user_type = 2): Dashboard through Enquiry->Download
 * - Superadmin (user_type = 3): All modules including Sliders, Clients, Blog, Gallery, FAQs, Testimonials
 */
export const SIDEBAR_ITEMS: NavEntry[] = [
  {
    title: "Dashboard",
    path: PATHS.overview,
    icon: LayoutDashboard,
    userTypes: [2, 3],
  },
  {
    title: "Category",
    path: PATHS.category,
    icon: FolderTree,
    userTypes: [2, 3],
  },
  {
    title: "Sub Category",
    path: `${PATHS.category}?tab=sub`,
    icon: GitBranch,
    userTypes: [2, 3],
  },
  {
    title: "Members",
    icon: Users,
    userTypes: [2, 3],
    children: [
      {
        title: "Trail User",
        path: `${PATHS.member}?tab=trail`,
        icon: Clock,
      },
      {
        title: "Members",
        path: PATHS.member,
        icon: Users,
      },
    ],
  },
  {
    title: "Vendor",
    path: PATHS.vendor,
    icon: Store,
    userTypes: [2, 3],
  },
  {
    title: "APP Rates",
    icon: IndianRupee,
    userTypes: [2, 3],
    children: [
      {
        title: "Live",
        path: `${PATHS.vendor}?tab=live`,
        icon: Radio,
      },
      {
        title: "Rate",
        path: `${PATHS.vendor}?tab=rates`,
        icon: IndianRupee,
      },
      {
        title: "Spot",
        path: `${PATHS.vendor}?tab=spots`,
        icon: Sparkles,
      },
    ],
  },
  {
    title: "News",
    path: PATHS.news,
    icon: Newspaper,
    userTypes: [2, 3],
  },
  {
    title: "Notification",
    path: PATHS.notification,
    icon: Bell,
    userTypes: [2, 3],
  },
  {
    title: "Newsletter",
    path: PATHS.newsletter,
    icon: Mail,
    userTypes: [2, 3],
  },
  {
    title: "Enquiry",
    icon: MessageSquare,
    userTypes: [2, 3],
    children: [
      {
        title: "Enquiry",
        path: PATHS.enquiry,
        icon: MessageSquare,
      },
      {
        title: "Download",
        path: PATHS.enquiryReport,
        icon: Download,
      },
    ],
  },
  // Superadmin only (user_type = 3)
  {
    title: "Sliders",
    path: PATHS.slider,
    icon: SlidersHorizontal,
    userTypes: [3],
  },
  {
    title: "Clients",
    path: PATHS.client,
    icon: Users,
    userTypes: [3],
  },
  {
    title: "Blog Gallery",
    path: PATHS.gallery,
    icon: Images,
    userTypes: [3],
  },
  {
    title: "Blog",
    path: PATHS.blog,
    icon: FileText,
    userTypes: [3],
  },
  {
    title: "FAQs",
    path: PATHS.faq,
    icon: HelpCircle,
    userTypes: [3],
  },
  {
    title: "Testimonials",
    path: PATHS.testimonial,
    icon: Quote,
    userTypes: [3],
  },
];

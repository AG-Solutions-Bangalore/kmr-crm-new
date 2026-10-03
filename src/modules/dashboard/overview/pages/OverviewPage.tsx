import { Link } from "react-router-dom";
import {
  Bell,
  FileText,
  FolderTree,
  Globe,
  HelpCircle,
  Images,
  Mail,
  MessageSquare,
  Newspaper,
  Quote,
  SlidersHorizontal,
  Store,
  Users,
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
import { useVendors } from "@/modules/dashboard/vendor/hook/useVendor.ts";
import { useNews } from "@/modules/dashboard/news/hook/useNews.ts";
import { useBlogs } from "@/modules/dashboard/blog/hook/useBlog.ts";
import { useSliders } from "@/modules/dashboard/slider/hook/useSlider.ts";
import { useNotifications } from "@/modules/dashboard/notification/hook/useNotification.ts";
import { useGalleryList } from "@/modules/dashboard/gallery/hook/useGallery.ts";
import { useClients } from "@/modules/dashboard/client/hook/useClient.ts";
import { useTestimonials } from "@/modules/dashboard/testimonial/hook/useTestimonial.ts";
import { useFaqs } from "@/modules/dashboard/faq/hook/useFaq.ts";

interface StatItem {
  label: string;
  count: number | string;
  path: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

export function OverviewPage() {
  const { data: vendors = [], isLoading: loadingVendors } = useVendors();
  const { data: news = [], isLoading: loadingNews } = useNews();
  const { data: blogs = [], isLoading: loadingBlogs } = useBlogs();
  const { data: sliders = [], isLoading: loadingSliders } = useSliders();
  const { data: notifications = [], isLoading: loadingNotifications } = useNotifications();
  const { data: gallery = [], isLoading: loadingGallery } = useGalleryList();
  const { data: clients = [], isLoading: loadingClients } = useClients();
  const { data: testimonials = [], isLoading: loadingTestimonials } = useTestimonials();
  const { data: faqs = [], isLoading: loadingFaqs } = useFaqs();

  const stats: StatItem[] = [
    {
      label: "Vendors",
      count: loadingVendors ? "—" : vendors.length,
      path: PATHS.vendor,
      icon: Store,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "News Articles",
      count: loadingNews ? "—" : news.length,
      path: PATHS.news,
      icon: Newspaper,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Blog Posts",
      count: loadingBlogs ? "—" : blogs.length,
      path: PATHS.blog,
      icon: FileText,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      label: "Hero Sliders",
      count: loadingSliders ? "—" : sliders.length,
      path: PATHS.slider,
      icon: SlidersHorizontal,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: "Notifications",
      count: loadingNotifications ? "—" : notifications.length,
      path: PATHS.notification,
      icon: Bell,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500/10",
    },
    {
      label: "Gallery Media",
      count: loadingGallery ? "—" : gallery.length,
      path: PATHS.gallery,
      icon: Images,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-500/10",
    },
    {
      label: "Clients",
      count: loadingClients ? "—" : clients.length,
      path: PATHS.client,
      icon: Users,
      color: "text-cyan-600 dark:text-cyan-400",
      bg: "bg-cyan-500/10",
    },
    {
      label: "Testimonials",
      count: loadingTestimonials ? "—" : testimonials.length,
      path: PATHS.testimonial,
      icon: Quote,
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-500/10",
    },
    {
      label: "FAQ Topics",
      count: loadingFaqs ? "—" : faqs.length,
      path: PATHS.faq,
      icon: HelpCircle,
      color: "text-teal-600 dark:text-teal-400",
      bg: "bg-teal-500/10",
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
            Welcome back. Below is a real-time summary across all connected CRM modules and APIs.
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
                <span className={`flex size-8 items-center justify-center rounded-lg ${s.bg} ${s.color}`}>
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

      {/* Company Info */}
      <CompanyStatusCard />

      {/* Quick Navigation Cards */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
          Module Direct Access
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Vendors & Spots",
              description: "Manage vendors, live spots, and gold/silver rates.",
              path: PATHS.vendor,
              icon: Store,
            },
            {
              title: "Categories",
              description: "Product hierarchy and categorization.",
              path: PATHS.category,
              icon: FolderTree,
            },
            {
              title: "News & Bulletins",
              description: "Live news feeds and press bulletins.",
              path: PATHS.news,
              icon: Newspaper,
            },
            {
              title: "Blog Articles",
              description: "Publish SEO-rich blog articles and stories.",
              path: PATHS.blog,
              icon: FileText,
            },
            {
              title: "Hero Sliders",
              description: "Home and category promotional banners.",
              path: PATHS.slider,
              icon: SlidersHorizontal,
            },
            {
              title: "Media Gallery",
              description: "Image repository and media asset management.",
              path: PATHS.gallery,
              icon: Images,
            },
            {
              title: "Customer Enquiries",
              description: "Review incoming client contact enquiries.",
              path: PATHS.enquiry,
              icon: MessageSquare,
            },
            {
              title: "Newsletter Subscribers",
              description: "Subscriber email list and audience reach.",
              path: PATHS.newsletter,
              icon: Mail,
            },
            {
              title: "Push Notifications",
              description: "App alerts and customer broadcast messaging.",
              path: PATHS.notification,
              icon: Bell,
            },
            {
              title: "Testimonials",
              description: "Client reviews and ratings per website page.",
              path: PATHS.testimonial,
              icon: Quote,
            },
            {
              title: "Clients & Partners",
              description: "Client portfolio and brand partner logos.",
              path: PATHS.client,
              icon: Users,
            },
            {
              title: "FAQs Knowledge Base",
              description: "Frequently asked questions grouped by page.",
              path: PATHS.faq,
              icon: HelpCircle,
            },
            {
              title: "Site Page Routes",
              description: "View configured pageOne and pageTwo URLs.",
              path: PATHS.pages,
              icon: Globe,
            },
          ].map((link) => (
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
                <CardDescription className="text-xs">{link.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="w-full transition-colors group-hover:border-primary/40 group-hover:bg-primary/5 group-hover:text-primary text-xs"
                >
                  <Link to={link.path}>Open {link.title}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

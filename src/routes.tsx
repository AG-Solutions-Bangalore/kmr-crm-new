import type { ReactNode } from "react";
import { PATHS } from "./constants/paths.ts";
import { ChangePasswordPage } from "./modules/auth/login/pages/ChangePasswordPage.tsx";
import { ForgotPasswordPage } from "./modules/auth/login/pages/ForgotPasswordPage.tsx";
import { LoginPage } from "./modules/auth/login/pages/LoginPage.tsx";
import { BlogPage } from "./modules/dashboard/blog/pages/BlogPage.tsx";
import { BlogFormPage } from "./modules/dashboard/blog/pages/BlogFormPage.tsx";
import { CategoryPage } from "./modules/dashboard/category/pages/CategoryPage.tsx";
import { ClientPage } from "./modules/dashboard/client/pages/ClientPage.tsx";
import { EnquiryPage } from "./modules/dashboard/enquiry/pages/EnquiryPage.tsx";
import { EnquiryReportPage } from "./modules/dashboard/enquiry-report/pages/EnquiryReportPage.tsx";
import { FaqPage } from "./modules/dashboard/faq/pages/FaqPage.tsx";
import { FaqFormPage } from "./modules/dashboard/faq/pages/FaqFormPage.tsx";
import { GalleryPage } from "./modules/dashboard/gallery/pages/GalleryPage.tsx";
import { MemberPage } from "./modules/dashboard/member/pages/MemberPage.tsx";
import { NewsPage } from "./modules/dashboard/news/pages/NewsPage.tsx";
import { NewsletterPage } from "./modules/dashboard/newsletter/pages/NewsletterPage.tsx";
import { NotificationPage } from "./modules/dashboard/notification/pages/NotificationPage.tsx";
import { OverviewPage } from "./modules/dashboard/overview/pages/OverviewPage.tsx";
import { SliderPage } from "./modules/dashboard/slider/pages/SliderPage.tsx";
import { TestimonialPage } from "./modules/dashboard/testimonial/pages/TestimonialPage.tsx";
import { VendorPage } from "./modules/dashboard/vendor/pages/VendorPage.tsx";
import { VendorSpotFormPage } from "./modules/dashboard/vendor/pages/VendorSpotFormPage.tsx";
import { VendorLiveFormPage } from "./modules/dashboard/vendor/pages/VendorLiveFormPage.tsx";
import { VendorRateFormPage } from "./modules/dashboard/vendor/pages/VendorRateFormPage.tsx";

export interface AppRoute {
  path: string;
  title: string;
  element: ReactNode;
}

/** Routes that don't need a session. Rendered without the dashboard shell. */
export const publicRoutes: AppRoute[] = [
  { path: PATHS.login, title: "Login", element: <LoginPage /> },
  {
    path: PATHS.forgotPassword,
    title: "Forgot password",
    element: <ForgotPasswordPage />,
  },
  {
    path: PATHS.changePassword,
    title: "Change password",
    element: <ChangePasswordPage />,
  },
];

/**
 * Routes rendered inside <DashboardLayout /> behind <ProtectedRoute />.
 * To add a module: build its page, then swap the ModulePlaceholder below.
 */
export const dashboardRoutes: AppRoute[] = [
  { path: PATHS.overview, title: "Overview", element: <OverviewPage /> },
  {
    path: PATHS.vendor,
    title: "Vendors",
    element: <VendorPage />,
  },
  {
    path: PATHS.vendorSpotNew,
    title: "Create Spot Quote",
    element: <VendorSpotFormPage />,
  },
  {
    path: PATHS.vendorSpotEdit,
    title: "Edit Spot Quote",
    element: <VendorSpotFormPage />,
  },
  {
    path: PATHS.vendorLiveNew,
    title: "Create Live Rate",
    element: <VendorLiveFormPage />,
  },
  {
    path: PATHS.vendorLiveEdit,
    title: "Edit Live Rate",
    element: <VendorLiveFormPage />,
  },
  {
    path: PATHS.vendorRateNew,
    title: "Create Standard Rate",
    element: <VendorRateFormPage />,
  },
  {
    path: PATHS.vendorRateEdit,
    title: "Edit Standard Rate",
    element: <VendorRateFormPage />,
  },
  {
    path: PATHS.category,
    title: "Categories",
    element: <CategoryPage />,
  },
  {
    path: PATHS.news,
    title: "News",
    element: <NewsPage />,
  },
  {
    path: PATHS.blog,
    title: "Blog",
    element: <BlogPage />,
  },
  {
    path: PATHS.blogNew,
    title: "Create Blog Post",
    element: <BlogFormPage />,
  },
  {
    path: PATHS.blogEdit,
    title: "Edit Blog Post",
    element: <BlogFormPage />,
  },
  {
    path: PATHS.gallery,
    title: "Gallery",
    element: <GalleryPage />,
  },
  {
    path: PATHS.enquiry,
    title: "Enquiries",
    element: <EnquiryPage />,
  },
  {
    path: PATHS.enquiryReport,
    title: "Enquiry Report",
    element: <EnquiryReportPage />,
  },
  {
    path: PATHS.newsletter,
    title: "Newsletter",
    element: <NewsletterPage />,
  },
  {
    path: PATHS.notification,
    title: "Notifications",
    element: <NotificationPage />,
  },
  {
    path: PATHS.faq,
    title: "FAQs",
    element: <FaqPage />,
  },
  {
    path: PATHS.faqNew,
    title: "Create FAQ",
    element: <FaqFormPage />,
  },
  {
    path: PATHS.faqEdit,
    title: "Edit FAQ",
    element: <FaqFormPage />,
  },
  {
    path: PATHS.testimonial,
    title: "Testimonials",
    element: <TestimonialPage />,
  },
  {
    path: PATHS.client,
    title: "Clients",
    element: <ClientPage />,
  },
  {
    path: PATHS.member,
    title: "Members",
    element: <MemberPage />,
  },
  {
    path: PATHS.slider,
    title: "Sliders",
    element: <SliderPage />,
  },
];

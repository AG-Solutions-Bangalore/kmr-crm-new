import type { ReactNode } from "react";
import { PATHS } from "./constants/paths.ts";
import { ModulePlaceholder } from "./components/common/ModulePlaceholder.tsx";
import { LoginPage } from "./modules/auth/login/pages/LoginPage.tsx";
import { ForgotPasswordPage } from "./modules/auth/login/pages/ForgotPasswordPage.tsx";
import { ChangePasswordPage } from "./modules/auth/login/pages/ChangePasswordPage.tsx";
import { OverviewPage } from "./modules/dashboard/overview/pages/OverviewPage.tsx";

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
    element: (
      <ModulePlaceholder
        title="Vendors"
        description="Manage vendors and their details."
      />
    ),
  },
  {
    path: PATHS.category,
    title: "Categories",
    element: (
      <ModulePlaceholder
        title="Categories"
        description="Manage product categories."
      />
    ),
  },
  {
    path: PATHS.news,
    title: "News",
    element: (
      <ModulePlaceholder
        title="News"
        description="Publish and manage news articles."
      />
    ),
  },
  {
    path: PATHS.blog,
    title: "Blog",
    element: (
      <ModulePlaceholder
        title="Blog"
        description="Publish and manage blog posts."
      />
    ),
  },
  {
    path: PATHS.gallery,
    title: "Gallery",
    element: (
      <ModulePlaceholder
        title="Gallery"
        description="Manage gallery images."
      />
    ),
  },
  {
    path: PATHS.enquiry,
    title: "Enquiries",
    element: (
      <ModulePlaceholder
        title="Enquiries"
        description="View and manage customer enquiries."
      />
    ),
  },
  {
    path: PATHS.newsletter,
    title: "Newsletter",
    element: (
      <ModulePlaceholder
        title="Newsletter"
        description="Manage newsletter subscribers."
      />
    ),
  },
  {
    path: PATHS.notification,
    title: "Notifications",
    element: (
      <ModulePlaceholder
        title="Notifications"
        description="Manage push notifications."
      />
    ),
  },
  {
    path: PATHS.faq,
    title: "FAQs",
    element: (
      <ModulePlaceholder
        title="FAQs"
        description="Manage frequently asked questions."
      />
    ),
  },
  {
    path: PATHS.testimonial,
    title: "Testimonials",
    element: (
      <ModulePlaceholder
        title="Testimonials"
        description="Manage customer testimonials."
      />
    ),
  },
  {
    path: PATHS.client,
    title: "Clients",
    element: (
      <ModulePlaceholder title="Clients" description="Manage clients." />
    ),
  },
];

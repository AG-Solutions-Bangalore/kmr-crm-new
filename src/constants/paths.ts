/**
 * Central route paths. Import these instead of hardcoding URL strings —
 * adding a new module = add a path here + one nav item + one route entry.
 */
export const PATHS = {
  // Public
  login: "/login",
  forgotPassword: "/forgot-password",
  changePassword: "/change-password",

  // Dashboard
  overview: "/",
  vendor: "/vendor",
  category: "/category",
  news: "/news",
  blog: "/blog",
  blogNew: "/blog/new",
  blogEdit: "/blog/:id/edit",
  gallery: "/gallery",
  enquiry: "/enquiry",
  newsletter: "/newsletter",
  notification: "/notification",
  slider: "/slider",
  faq: "/faq",
  faqNew: "/faq/new",
  faqEdit: "/faq/:id/edit",
  testimonial: "/testimonial",
  client: "/client",
  // Account
  profile: "/profile",
} as const;

export type AppPath = (typeof PATHS)[keyof typeof PATHS];

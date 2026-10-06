export interface NewsletterSubscriber {
  id: number;
  newsletter_email: string;
  newsletter_created?: string | null;
  // legacy mock aliases (kept for backward compat)
  email?: string | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface NewsletterListResponse {
  code?: number;
  message?: string;
  data?: NewsletterSubscriber[] | {
    current_page?: number;
    data: NewsletterSubscriber[];
    total?: number;
    per_page?: number;
    last_page?: number;
  };
}

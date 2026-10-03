export interface NewsletterSubscriber {
  id: number;
  email: string;
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

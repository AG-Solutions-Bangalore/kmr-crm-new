export type TestimonialStatus = "Active" | "Inactive";

export interface PageOneItem {
  page_url: string;
  page_name: string;
}

export interface TestimonialItem {
  id: number;
  testimonial_for: string;
  testimonial_client_name: string;
  testimonial_description: string;
  testimonial_rating: number | string;
  testimonial_status?: TestimonialStatus | string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface TestimonialListResponse {
  code?: number;
  message?: string;
  data?: TestimonialItem[] | {
    current_page?: number;
    data: TestimonialItem[];
    total?: number;
    per_page?: number;
    last_page?: number;
  };
}

export interface TestimonialMutationPayload {
  testimonial_for: string;
  testimonial_client_name: string;
  testimonial_description: string;
  testimonial_rating: number | string;
  testimonial_status?: TestimonialStatus | string;
}

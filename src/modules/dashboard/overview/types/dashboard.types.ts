/** GET /dashboard response — counts for modules whose list APIs are down. */
export interface DashboardCounts {
  newsletter_count: number;
  enquiry_count: number;
}

export interface DashboardResponse {
  code?: number;
  message?: string;
  data?: Partial<DashboardCounts> | null;
}

export type MemberStatus = "Active" | "Inactive";

export interface MemberItem {
  id: number;
  name: string;
  mobile?: string | null;
  email?: string | null;
  city?: string | null;
  address?: string | null;
  trail?: string | null;
  register_date?: string | null;
  validity_date?: string | null;
  status?: MemberStatus | string;
  user_type?: number | string | null;
  remarks?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface MemberListResponse {
  code?: number;
  message?: string;
  data?: MemberItem[] | {
    current_page?: number;
    data: MemberItem[];
    total?: number;
    per_page?: number;
    last_page?: number;
  };
}

export interface MemberMutationPayload {
  name: string;
  mobile: string;
  email: string;
  city: string;
  address?: string;
  trail?: string;
  validity_date?: string;
  status?: MemberStatus | string;
}

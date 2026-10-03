export type ClientStatus = "Active" | "Inactive";

export interface ClientItem {
  id: number;
  clients_name: string;
  clients_image?: string;
  clients_status?: ClientStatus | string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ClientListResponse {
  code?: number;
  message?: string;
  data?: ClientItem[] | {
    current_page?: number;
    data: ClientItem[];
    total?: number;
    per_page?: number;
    last_page?: number;
  };
}

export interface ClientMutationPayload {
  clients_name: string;
  clients_image?: File | string | null;
  clients_status?: ClientStatus | string;
}

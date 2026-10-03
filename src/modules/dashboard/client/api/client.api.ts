import { api, throwIfApiError, toFormData } from "@/lib/axios.ts";
import { pageQuery, parsePaginatedResponse, type PagedResult } from "@/lib/pagination.ts";
import type {
  ClientItem,
  ClientListResponse,
  ClientMutationPayload,
  ClientStatus,
} from "../types/client.types.ts";

/** GET /client — Fetch all clients. */
export async function fetchClients(): Promise<ClientItem[]> {
  const { data } = await api.get<ClientListResponse | ClientItem[]>("/client");
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    if (Array.isArray(data.data)) return data.data;
    if (data.data && typeof data.data === "object" && Array.isArray(data.data.data)) {
      return data.data.data;
    }
  }
  return [];
}

/** GET /client?page=N&per_page=M&search=Q — Server-side paginated clients. */
export async function fetchClientsPage(
  page = 1,
  perPage = 10,
  search = "",
): Promise<PagedResult<ClientItem>> {
  const { data } = await api.get<ClientListResponse | ClientItem[]>(
    pageQuery("/client", page, perPage, search),
  );
  return parsePaginatedResponse<ClientItem>(data, page, perPage);
}

/** GET /client/:id — Fetch single client details. */
export async function fetchClientById(id: number | string): Promise<ClientItem> {
  const { data } = await api.get<{ data?: ClientItem } | ClientItem>(`/client/${id}`);
  if (data && typeof data === "object" && "data" in data && data.data) {
    return data.data;
  }
  return data as ClientItem;
}

/** POST /client — Create new client. */
export async function createClient(payload: ClientMutationPayload): Promise<unknown> {
  const formData = toFormData({
    clients_name: payload.clients_name,
    clients_image: payload.clients_image ?? "",
    clients_status: payload.clients_status ?? "Active",
  });

  const { data } = await api.post("/client", formData);
  throwIfApiError(data as { code?: number; message?: string }, "Could not create client.");
  return data;
}

/** PUT /client/:id — Update existing client. */
export async function updateClient(
  id: number | string,
  payload: ClientMutationPayload,
): Promise<unknown> {
  const formData = toFormData({
    _method: "PUT",
    clients_name: payload.clients_name,
    clients_image: payload.clients_image ?? "",
    clients_status: payload.clients_status ?? "Active",
  });

  const { data } = await api.post(`/client/${id}`, formData);
  throwIfApiError(data as { code?: number; message?: string }, "Could not update client.");
  return data;
}

/** PATCH /clients/:id/status — Toggle client status. */
export async function updateClientStatus(
  id: number | string,
  status: ClientStatus,
): Promise<unknown> {
  const formData = toFormData({
    _method: "PATCH",
    clients_status: status,
  });

  const { data } = await api.post(`/clients/${id}/status`, formData);
  throwIfApiError(data as { code?: number; message?: string }, "Could not update client status.");
  return data;
}

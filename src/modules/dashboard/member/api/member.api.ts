import { api, throwIfApiError, toFormData } from "@/lib/axios.ts";
import { pageQuery, parsePaginatedResponse, type PagedResult } from "@/lib/pagination.ts";
import type {
  MemberItem,
  MemberListResponse,
  MemberMutationPayload,
} from "../types/member.types.ts";

/** GET /member — Fetch all members. */
export async function fetchMembers(): Promise<MemberItem[]> {
  const { data } = await api.get<MemberListResponse | MemberItem[]>("/member");
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    if (Array.isArray(data.data)) return data.data;
    if (data.data && typeof data.data === "object" && Array.isArray(data.data.data)) {
      return data.data.data;
    }
  }
  return [];
}

/** GET /member?page=N&per_page=M&search=Q — Server-side paginated members. */
export async function fetchMembersPage(
  page = 1,
  perPage = 10,
  search = "",
): Promise<PagedResult<MemberItem>> {
  const { data } = await api.get<MemberListResponse | MemberItem[]>(
    pageQuery("/member", page, perPage, search),
  );
  return parsePaginatedResponse<MemberItem>(data, page, perPage);
}

/** GET /member/:id — Fetch single member details. */
export async function fetchMemberById(id: number | string): Promise<MemberItem> {
  const { data } = await api.get<{ data?: MemberItem } | MemberItem>(`/member/${id}`);
  if (data && typeof data === "object" && "data" in data && data.data) {
    return data.data;
  }
  return data as MemberItem;
}

/** POST /member — Create new member. Required: name, mobile, email, city. */
export async function createMember(payload: MemberMutationPayload): Promise<unknown> {
  const formData = toFormData({
    name: payload.name,
    mobile: payload.mobile,
    email: payload.email,
    city: payload.city,
    address: payload.address ?? "",
    status: payload.status ?? "Active",
  });

  const { data } = await api.post("/member", formData);
  throwIfApiError(data as { code?: number; message?: string }, "Could not create member.");
  return data;
}

/**
 * PUT /member/:id — Update existing member (via POST + `_method: "PUT"`).
 * NOTE: `status` must always be sent — omitting it resets it to null server-side.
 */
export async function updateMember(
  id: number | string,
  payload: MemberMutationPayload,
): Promise<unknown> {
  const formData = toFormData({
    _method: "PUT",
    name: payload.name,
    mobile: payload.mobile,
    email: payload.email,
    city: payload.city,
    address: payload.address ?? "",
    trail: payload.trail,
    validity_date: payload.validity_date,
    status: payload.status ?? "Active",
  });

  const { data } = await api.post(`/member/${id}`, formData);
  throwIfApiError(data as { code?: number; message?: string }, "Could not update member.");
  return data;
}

/**
 * Status toggle goes through PUT /member/:id with the flipped status —
 * PATCH /members/:id/status returns 200 but does NOT persist (verified live).
 */
export async function updateMemberStatus(
  id: number | string,
  current: MemberItem,
  status: MemberMutationPayload["status"],
): Promise<unknown> {
  return updateMember(id, {
    name: current.name,
    mobile: current.mobile || "",
    email: current.email || "",
    city: current.city || "",
    address: current.address || "",
    trail: current.trail || undefined,
    validity_date: current.validity_date || undefined,
    status,
  });
}

/** GET /getTrailMember?page=N&per_page=M&search=Q — Trial members only. */
export async function fetchTrailMembersPage(
  page = 1,
  perPage = 10,
  search = "",
): Promise<PagedResult<MemberItem>> {
  const { data } = await api.get<MemberListResponse | MemberItem[]>(
    pageQuery("/getTrailMember", page, perPage, search),
  );
  return parsePaginatedResponse<MemberItem>(data, page, perPage);
}

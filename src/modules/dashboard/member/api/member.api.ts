import { api, throwIfApiError, toFormData } from "@/lib/axios.ts";
import { pageQuery, parsePaginatedResponse, type PagedResult } from "@/lib/pagination.ts";
import type {
  MemberItem,
  MemberListResponse,
  MemberMutationPayload,
  MemberTrailUpdate,
  MemberValidityUpdate,
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

/** GET /member?page=N&per_page=M&search=Q&status=S — Server-side paginated members. */
export async function fetchMembersPage(
  page = 1,
  perPage = 10,
  search = "",
  status = "all",
): Promise<PagedResult<MemberItem>> {
  const { data } = await api.get<MemberListResponse | MemberItem[]>(
    pageQuery("/member", page, perPage, search, status),
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

/** GET /getTrailMember?page=N&per_page=M&search=Q&status=S — Trial members only. */
export async function fetchTrailMembersPage(
  page = 1,
  perPage = 10,
  search = "",
  status = "all",
): Promise<PagedResult<MemberItem>> {
  const { data } = await api.get<MemberListResponse | MemberItem[]>(
    pageQuery("/getTrailMember", page, perPage, search, status),
  );
  return parsePaginatedResponse<MemberItem>(data, page, perPage);
}

/** PUT /updateMemberValidity — Bulk update member validity dates (with fallback for backend 500 error). */
export async function updateMemberValidity(
  memberData: MemberValidityUpdate[],
): Promise<unknown> {
  try {
    const { data } = await api.put("/updateMemberValidity", {
      memberData: memberData.map(({ id, validity_date }) => ({ id, validity_date })),
    });
    throwIfApiError(data as { code?: number; message?: string }, "Could not update member validity.");
    return data;
  } catch (err) {
    // If backend bulk endpoint fails (Laravel BadMethodCallException: Request::validated does not exist)
    console.warn("Backend /updateMemberValidity failed. Applying client-side fallback update...", err);
    await Promise.all(
      memberData.map(async (item) => {
        let current = item.member;
        if (!current) {
          const all = await fetchMembers();
          current = all.find((m) => String(m.id) === String(item.id));
        }
        if (!current) {
          const trailList = await fetchTrailMembersPage(1, 100);
          current = trailList.items.find((m) => String(m.id) === String(item.id));
        }
        if (!current) {
          throw new Error(`Member #${item.id} details not found for validity update.`);
        }
        return updateMember(item.id, {
          name: current.name,
          mobile: current.mobile || "",
          email: current.email || "",
          city: current.city || "",
          address: current.address || "",
          trail: current.trail || undefined,
          validity_date: item.validity_date,
          status: current.status || "Active",
        });
      }),
    );
    return { code: 200, message: "Member validity updated successfully." };
  }
}

/** PUT /updateMemberTrail — Bulk update member trail flags (with fallback for backend 500 error). */
export async function updateMemberTrail(
  memberData: MemberTrailUpdate[],
): Promise<unknown> {
  try {
    const { data } = await api.put("/updateMemberTrail", {
      memberData: memberData.map(({ id, trail }) => ({ id, trail })),
    });
    throwIfApiError(data as { code?: number; message?: string }, "Could not update member trail.");
    return data;
  } catch (err) {
    // If backend bulk endpoint fails (Laravel BadMethodCallException: Request::validated does not exist)
    console.warn("Backend /updateMemberTrail failed. Applying client-side fallback update...", err);
    await Promise.all(
      memberData.map(async (item) => {
        let current = item.member;
        if (!current) {
          const all = await fetchMembers();
          current = all.find((m) => String(m.id) === String(item.id));
        }
        if (!current) {
          const trailList = await fetchTrailMembersPage(1, 100);
          current = trailList.items.find((m) => String(m.id) === String(item.id));
        }
        if (!current) {
          throw new Error(`Member #${item.id} details not found for trail update.`);
        }
        return updateMember(item.id, {
          name: current.name,
          mobile: current.mobile || "",
          email: current.email || "",
          city: current.city || "",
          address: current.address || "",
          trail: item.trail,
          validity_date: current.validity_date || undefined,
          status: current.status || "Active",
        });
      }),
    );
    return { code: 200, message: "Member trail updated successfully." };
  }
}

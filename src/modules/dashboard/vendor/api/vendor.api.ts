import { api, throwIfApiError, toFormData } from "@/lib/axios.ts";
import { pageQuery, parsePaginatedResponse, type PagedResult } from "@/lib/pagination.ts";
import type {
  Vendor,
  VendorListResponse,
  VendorLiveProduct,
  VendorMutationPayload,
  VendorSpotItem,
  VendorStatus,
} from "../types/vendor.types.ts";

/** GET /vendor — Fetch all vendors. */
export async function fetchVendors(): Promise<Vendor[]> {
  const { data } = await api.get<VendorListResponse | Vendor[]>("/vendor");
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    if (Array.isArray(data.data)) return data.data;
    if (data.data && typeof data.data === "object" && Array.isArray(data.data.data)) {
      return data.data.data;
    }
  }
  return [];
}

/** GET /vendor?page=N&per_page=M&search=Q — Server-side paginated vendors. */
export async function fetchVendorsPage(
  page = 1,
  perPage = 10,
  search = "",
): Promise<PagedResult<Vendor>> {
  const { data } = await api.get<VendorListResponse | Vendor[]>(
    pageQuery("/vendor", page, perPage, search),
  );
  return parsePaginatedResponse<Vendor>(data, page, perPage);
}

/** GET /activeVendors — Fetch only active vendors. */
export async function fetchActiveVendors(): Promise<Vendor[]> {
  const { data } = await api.get<VendorListResponse | Vendor[]>("/activeVendors");
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    if (Array.isArray(data.data)) return data.data;
    if (data.data && typeof data.data === "object" && Array.isArray(data.data.data)) {
      return data.data.data;
    }
  }
  return [];
}

/** GET /vendor/:id — Fetch single vendor details. */
export async function fetchVendorById(id: number | string): Promise<Vendor> {
  const { data } = await api.get<{ data?: Vendor } | Vendor>(`/vendor/${id}`);
  if (data && typeof data === "object" && "data" in data && data.data) {
    return data.data;
  }
  return data as Vendor;
}

/** POST /vendor — Create new vendor. */
export async function createVendor(payload: VendorMutationPayload): Promise<unknown> {
  const formData = toFormData({
    vendor_name: payload.vendor_name,
    vendor_mobile: payload.vendor_mobile,
    vendor_email: payload.vendor_email,
    vendor_city: payload.vendor_city,
    vendor_trade: payload.vendor_trade,
    vendor_address: payload.vendor_address,
    vendor_image: payload.vendor_image ?? "",
    vendor_status: payload.vendor_status ?? "Active",
  });

  const { data } = await api.post("/vendor", formData);
  throwIfApiError(data as { code?: number; message?: string }, "Could not create vendor.");
  return data;
}

/** PUT /vendor/:id — Update existing vendor. */
export async function updateVendor(
  id: number | string,
  payload: VendorMutationPayload,
): Promise<unknown> {
  const formData = toFormData({
    _method: "PUT",
    vendor_name: payload.vendor_name,
    vendor_mobile: payload.vendor_mobile,
    vendor_email: payload.vendor_email,
    vendor_city: payload.vendor_city,
    vendor_trade: payload.vendor_trade,
    vendor_address: payload.vendor_address,
    ...(payload.vendor_image instanceof File ? { vendor_image: payload.vendor_image } : {}),
    vendor_status: payload.vendor_status ?? "Active",
  });

  const { data } = await api.post(`/vendor/${id}`, formData);
  throwIfApiError(data as { code?: number; message?: string }, "Could not update vendor.");
  return data;
}

/** PATCH /vendors/:id/status — Toggle vendor status. */
export async function updateVendorStatus(
  id: number | string,
  status: VendorStatus,
): Promise<unknown> {
  const formData = toFormData({
    _method: "PATCH",
    vendor_status: status,
  });

  const { data } = await api.post(`/vendors/${id}/status`, formData);
  throwIfApiError(data as { code?: number; message?: string }, "Could not update vendor status.");
  return data;
}

/** GET /vendor-spot — Fetch vendor spots. */
export async function fetchVendorSpots(): Promise<VendorSpotItem[]> {
  const { data } = await api.get("/vendor-spot");
  return parsePaginatedResponse<VendorSpotItem>(data, 1, 10).items;
}

/** POST /vendor-spot — Create vendor spot. */
export async function createVendorSpot(payload: {
  products: Array<{
    vendor_id: number | string;
    category_id: number | string;
    sub_category_id?: number | string;
    vendor_spot_heading: string;
    vendor_spot_details: string;
  }>;
}): Promise<unknown> {
  const { data } = await api.post("/vendor-spot", payload);
  throwIfApiError(data as { code?: number; message?: string }, "Could not create vendor spot.");
  return data;
}

/** PATCH /vendor-spots/:id/status — Toggle vendor spot status. */
export async function updateVendorSpotStatus(
  id: number | string,
  status: string,
): Promise<unknown> {
  const formData = toFormData({ _method: "PATCH", vendor_spot_status: status });
  const { data } = await api.post(`/vendor-spots/${id}/status`, formData);
  throwIfApiError(data as { code?: number; message?: string }, "Could not update spot status.");
  return data;
}

/** GET /vendor-live — Fetch vendor live products. */
export async function fetchVendorLives(): Promise<VendorLiveProduct[]> {
  const { data } = await api.get("/vendor-live");
  return parsePaginatedResponse<VendorLiveProduct>(data, 1, 10).items;
}

/** POST /vendor-live — Create vendor live product rates. */
export async function createVendorLive(payload: {
  products: Array<{
    vendor_id: number | string;
    category_id: number | string;
    sub_category_id?: number | string;
    vendor_product: string;
    vendor_product_size: string;
    vendor_product_rate: string | number;
  }>;
}): Promise<unknown> {
  const { data } = await api.post("/vendor-live", payload);
  throwIfApiError(data as { code?: number; message?: string }, "Could not create vendor live product.");
  return data;
}

/** PATCH /vendor-lives/:id/status — Toggle vendor live status. */
export async function updateVendorLiveStatus(
  id: number | string,
  status: string,
): Promise<unknown> {
  const formData = toFormData({ _method: "PATCH", vendor_product_status: status });
  const { data } = await api.post(`/vendor-lives/${id}/status`, formData);
  throwIfApiError(data as { code?: number; message?: string }, "Could not update vendor live status.");
  return data;
}

/** GET /vendor-rate — Fetch vendor rates. */
export async function fetchVendorRates(): Promise<VendorLiveProduct[]> {
  const { data } = await api.get("/vendor-rate");
  return parsePaginatedResponse<VendorLiveProduct>(data, 1, 10).items;
}

/** POST /vendor-rate — Create vendor rates. */
export async function createVendorRate(payload: {
  products: Array<{
    vendor_id: number | string;
    category_id: number | string;
    sub_category_id?: number | string;
    vendor_product: string;
    vendor_product_size: string;
    vendor_product_rate: string | number;
  }>;
}): Promise<unknown> {
  const { data } = await api.post("/vendor-rate", payload);
  throwIfApiError(data as { code?: number; message?: string }, "Could not create vendor rate.");
  return data;
}

/** PATCH /vendor-rates/:id/status — Toggle vendor rate status. */
export async function updateVendorRateStatus(
  id: number | string,
  status: string,
): Promise<unknown> {
  const formData = toFormData({ _method: "PATCH", vendor_product_status: status });
  const { data } = await api.post(`/vendor-rates/${id}/status`, formData);
  throwIfApiError(data as { code?: number; message?: string }, "Could not update vendor rate status.");
  return data;
}


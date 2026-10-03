import { api, throwIfApiError, toFormData } from "@/lib/axios.ts";
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
    vendor_image: payload.vendor_image ?? "",
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
  const { data } = await api.get<{ data?: VendorSpotItem[] } | VendorSpotItem[]>("/vendor-spot");
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && Array.isArray(data.data)) {
    return data.data;
  }
  return [];
}

/** GET /vendor-live — Fetch vendor live products. */
export async function fetchVendorLives(): Promise<VendorLiveProduct[]> {
  const { data } = await api.get<{ data?: VendorLiveProduct[] } | VendorLiveProduct[]>("/vendor-live");
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && Array.isArray(data.data)) {
    return data.data;
  }
  return [];
}

import { api, throwIfApiError, toFormData } from "@/lib/axios";
import type {
  FetchProfileResponse,
  UpdateProfilePayload,
  UpdateProfileResponse,
} from "../types/profile.types.ts";

/** GET /panel-fetch-profile — bearer required. */
export async function fetchProfile(): Promise<FetchProfileResponse> {
  const { data } =
    await api.get<FetchProfileResponse>("/panel-fetch-profile");
  throwIfApiError(data, "Could not load profile.");
  return data;
}

/**
 * Updates mobile/email.
 *
 * NOTE: sent as POST with `_method=PUT` (standard Laravel method spoofing).
 * A real multipart PUT is not parsed by this PHP backend and returns an
 * error page — verified against the live API.
 */
export async function updateProfile(
  payload: UpdateProfilePayload,
): Promise<UpdateProfileResponse> {
  const { data } = await api.post<UpdateProfileResponse>(
    "/panel-update-profile",
    toFormData({
      _method: "PUT",
      mobile: payload.mobile,
      email: payload.email,
    }),
  );
  throwIfApiError(data, "Could not update profile. Please try again.");
  return data;
}

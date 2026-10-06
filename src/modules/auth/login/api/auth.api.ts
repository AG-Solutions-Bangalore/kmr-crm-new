import { api, throwIfApiError, toFormData } from "@/lib/axios";
import type {
  ApiMessageResponse,
  ChangePasswordPayload,
  CheckStatusResponse,
  DotenvResponse,
  ForgotPasswordPayload,
  LoginPayload,
  LoginResponse,
} from "../types/auth.types.ts";

/** GET /panel-check-status — public. Backend health + company info. */
export async function checkStatus(): Promise<CheckStatusResponse> {
  const { data } = await api.get<CheckStatusResponse>("/panel-check-status");
  throwIfApiError(data, "Status check failed.");
  return data;
}

/** GET /panel-fetch-dotenv — public. Returns an opaque env/config token. */
export async function fetchDotenv(): Promise<DotenvResponse> {
  const { data } = await api.get<DotenvResponse>("/panel-fetch-dotenv");
  return data;
}

/** POST /panel-login — form-data { username, password }. */
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>(
    "/panel-login",
    toFormData({ username: payload.username, password: payload.password }),
  );
  throwIfApiError(data, "Invalid username or password.");
  return data;
}

/** POST /panel-send-password — form-data { username, email }. */
export async function sendPassword(
  payload: ForgotPasswordPayload,
): Promise<ApiMessageResponse> {
  const { data } = await api.post<ApiMessageResponse>(
    "/panel-send-password",
    toFormData({ username: payload.username, email: payload.email }),
  );
  throwIfApiError(data, "Could not send password. Please try again.");
  return data;
}

/** POST /panel-change-password — form-data { username, old_password, new_password }. */
export async function changePassword(
  payload: ChangePasswordPayload,
): Promise<ApiMessageResponse> {
  const { data } = await api.post<ApiMessageResponse>(
    "/panel-change-password",
    toFormData({
      username: payload.username,
      old_password: payload.old_password,
      new_password: payload.new_password,
    }),
  );
  throwIfApiError(data, "Could not change password. Please try again.");
  return data;
}

/**
 * POST /panel-logout — bearer required.
 * NOTE: a `{}` body is sent on purpose — a fully empty POST is rejected
 * by the server WAF ("Not Acceptable"). Verified against the live API.
 */
export async function logout(): Promise<ApiMessageResponse> {
  const { data } = await api.post<ApiMessageResponse>("/panel-logout", {});
  throwIfApiError(data, "Could not log out. Please try again.");
  return data;
}

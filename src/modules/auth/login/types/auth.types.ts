export interface AuthUser {
  id: number;
  name: string;
  mobile: string;
  email: string;
  user_type: number;
  status: string;
  last_login?: string | null;
  validity_date?: string | null;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  code: number;
  message?: string;
  UserInfo: {
    token: string;
    token_expires_at: string;
    user: AuthUser;
  };
}

export interface ForgotPasswordPayload {
  username: string;
  email: string;
}

export interface ChangePasswordPayload {
  username: string;
  old_password: string;
  new_password: string;
}

/** Generic `{ code, message }` shape used by send-password / change-password / logout. */
export interface ApiMessageResponse {
  code: number;
  message?: string;
  success?: string;
}

export interface CompanyDetails {
  id: number;
  company_name: string;
  company_email: string;
  company_short: string;
  company_mobile_no: string;
  company_mobile_no2?: string | null;
  company_address: string;
  company_place: string;
  company_logo: string;
  company_status: string;
}

export interface StatusImageUrl {
  image_for: string;
  image_url: string;
}

export interface CheckStatusResponse {
  code: number;
  success: string;
  message: string;
  version: { version_panel: string };
  company_detils: CompanyDetails;
  image_url: StatusImageUrl[];
}

export interface DotenvResponse {
  data: string;
}

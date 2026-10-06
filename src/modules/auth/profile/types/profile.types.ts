export interface Profile {
  id: number;
  name: string;
  mobile: string;
  email: string;
}

export interface FetchProfileResponse {
  profile: Profile;
  code?: number;
  message?: string;
}

export interface UpdateProfilePayload {
  mobile: string;
  email: string;
}

export interface UpdateProfileResponse {
  code: number;
  message?: string;
}

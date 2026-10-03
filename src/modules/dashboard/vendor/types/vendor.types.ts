export type VendorStatus = "Active" | "Inactive";

export interface Vendor {
  id: number;
  vendor_name: string;
  vendor_mobile: string;
  vendor_email: string;
  vendor_city: string;
  vendor_trade?: string | null;
  vendor_trade_name?: string | null;
  vendor_register_date?: string | null;
  vendor_address?: string | null;
  vendor_image?: string | null;
  vendor_status?: VendorStatus | string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface VendorImageUrl {
  image_for: string;
  image_url: string;
}

export interface VendorListResponse {
  code?: number;
  message?: string;
  data?: Vendor[] | {
    current_page?: number;
    data: Vendor[];
    total?: number;
    per_page?: number;
    last_page?: number;
  };
  image_url?: VendorImageUrl[];
}

export interface VendorMutationPayload {
  vendor_name: string;
  vendor_mobile: string;
  vendor_email: string;
  vendor_city: string;
  vendor_trade: string;
  vendor_address: string;
  vendor_image?: File | string | null;
  vendor_status?: VendorStatus | string;
}

export interface VendorLiveProduct {
  id: number;
  vendor_id: number | string;
  category_id: number | string;
  sub_category_id?: number | string | null;
  vendor_product: string;
  vendor_product_size: string;
  vendor_product_rate: string | number;
  vendor_product_status?: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface VendorSpotItem {
  id: number;
  vendor_id: number | string;
  vendor_name?: string | null;
  vendor_image?: string | null;
  vendor_mobile?: string | null;
  category_id: number | string;
  categories_name?: string | null;
  sub_category_id?: number | string | null;
  sub_categories_name?: string | null;
  vendor_spot_heading: string;
  vendor_spot_details: string;
  vendor_spot_created_date?: string | null;
  vendor_spot_created_time?: string | null;
  vendor_spot_status?: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export type VendorRateProduct = VendorLiveProduct;

export interface VendorSpotPayload {
  products: Array<{
    vendor_id: number | string;
    category_id: number | string;
    sub_category_id?: number | string;
    vendor_spot_heading: string;
    vendor_spot_details: string;
  }>;
}

export interface VendorRatePayload {
  products: Array<{
    vendor_id: number | string;
    category_id: number | string;
    sub_category_id?: number | string;
    vendor_product: string;
    vendor_product_size: string;
    vendor_product_rate: string | number;
  }>;
}


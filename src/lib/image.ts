import { useSyncExternalStore } from "react";

const CRM_PUBLIC_BASE = "https://kmrlive.in/crmapi/public";

export const API_DEFAULT_NO_IMAGE_URL = `${CRM_PUBLIC_BASE}/assets/images/no_image.jpg`;

let dynamicNoImageUrl: string = API_DEFAULT_NO_IMAGE_URL;

const noImageListeners = new Set<() => void>();

function notifyNoImageListeners(): void {
  for (const cb of noImageListeners) {
    try {
      cb();
    } catch {
      // ignore listener errors
    }
  }
}

function subscribeNoImage(cb: () => void): () => void {
  noImageListeners.add(cb);
  return () => {
    noImageListeners.delete(cb);
  };
}

export function setApiNoImageUrl(url?: string | null): void {
  if (url && typeof url === "string" && url.trim()) {
    const next = url.trim();
    if (next !== dynamicNoImageUrl) {
      dynamicNoImageUrl = next;
      notifyNoImageListeners();
    }
  }
}

export function getApiNoImageUrl(): string {
  return dynamicNoImageUrl;
}

export function getNoImageSnapshot(): string {
  return dynamicNoImageUrl;
}

/**
 * Reactive accessor for the API `No Image` placeholder.
 * Re-renders when `/category` returns a new `image_url` entry,
 * so cards switch from the bundled default to the live URL automatically.
 */
export function useApiNoImageUrl(): string {
  return useSyncExternalStore(
    subscribeNoImage,
    getNoImageSnapshot,
    getNoImageSnapshot,
  );
}

/**
 * Pull the dynamic `No Image` placeholder out of any API list response.
 * Every list endpoint returns:
 *   "image_url": [{ "image_for": "No Image", "image_url": "https://.../no_image.jpg" }, ...]
 * Call with the raw response body (`data` from axios) right after fetching.
 * Safe to call on any shape — no-ops when no entry is present.
 */
export function syncApiNoImageUrl(res: unknown): void {
  if (!res || typeof res !== "object") return;
  const list = (res as { image_url?: Array<{ image_for?: string; image_url?: string }> })
    .image_url;
  if (!Array.isArray(list)) return;
  const noImg = list.find(
    (it) => it?.image_for?.trim().toLowerCase() === "no image",
  );
  if (noImg?.image_url) {
    setApiNoImageUrl(noImg.image_url);
  }
}

/**
 * Resolve any module image with dynamic API `no_image` fallback.
 * Use everywhere instead of bare `resolveAssetImageUrl(...)` so a
 * `null` filename never renders a static placeholder.
 */
export function resolveDynamicImageUrl(
  value: string | null | undefined,
  folder: string,
): string {
  return (
    resolveAssetImageUrl(value, folder, getApiNoImageUrl()) ||
    getApiNoImageUrl()
  );
}

/**
 * Build a viewable image URL from whatever the API returns.
 * API is inconsistent: sometimes bare filename (`1.webp`),
 * sometimes `gallery_images/1.webp`, sometimes `assets/...`,
 * sometimes a full URL. Handle all without double-prefixing.
 */
export function resolveAssetImageUrl(
  value: string | null | undefined,
  folder: string,
  fallbackUrl: string | null = null,
): string | null {
  if (!value) return fallbackUrl;
  const v = value.trim();
  if (!v) return fallbackUrl;
  if (
    v.startsWith("http://") ||
    v.startsWith("https://") ||
    v.startsWith("data:") ||
    v.startsWith("blob:")
  ) {
    return v;
  }
  const assetsIdx = v.indexOf("assets/images/");
  if (assetsIdx >= 0) {
    return `${CRM_PUBLIC_BASE}/${v.slice(assetsIdx)}`;
  }
  // Already includes folder e.g. `gallery_images/1.webp` or `/gallery_images/1.webp`
  const clean = v.replace(/^\/+/, "");
  if (clean.startsWith(`${folder}/`)) {
    return `${CRM_PUBLIC_BASE}/assets/images/${clean}`;
  }
  if (clean.startsWith("images/")) {
    return `${CRM_PUBLIC_BASE}/assets/${clean}`;
  }
  return `${CRM_PUBLIC_BASE}/assets/images/${folder}/${clean}`;
}

/**
 * Resolves category image or falls back to the dynamic API no_image placeholder.
 */
export function resolveCategoryImageUrl(
  value: string | null | undefined,
  useFallback = true,
): string | null {
  const fallback = useFallback ? getApiNoImageUrl() : null;
  return resolveAssetImageUrl(value, "category_images", fallback) || fallback;
}

/**
 * Gallery image URL — prefers the exact URL coming from the API.
 * If `baseUrl` (gallery_url) is already a complete file URL it is used
 * as-is; if it is only a base folder, the filename is joined to it;
 * otherwise falls back to the local assets resolution.
 */
export function resolveGalleryImageUrl(
  filename: string | null | undefined,
  baseUrl: string | null | undefined,
): string | null {
  const apiUrl = (baseUrl || "").trim();
  const file = (filename || "").trim();
  if (apiUrl) {
    const lower = apiUrl.toLowerCase();
    const isCompleteUrl =
      /\.(jpg|jpeg|png|webp|gif|svg|avif|bmp|mp4|pdf)(\?.*)?$/.test(lower) ||
      (file !== "" && lower.endsWith(file.toLowerCase()));
    if (isCompleteUrl) return apiUrl;
    if (!file) return apiUrl;
    return `${apiUrl.replace(/\/?$/, "/")}${file.replace(/^\/+/, "")}`;
  }
  if (!file) return null;
  return resolveAssetImageUrl(file, "gallerys_images");
}

/**
 * Text copied by gallery copy buttons: full image path + file name,
 * e.g. `https://.../gallerys_images/1.webp\n1.webp`.
 * Returns "" when there is nothing to copy.
 */
export function galleryShareText(
  filename: string | null | undefined,
  baseUrl: string | null | undefined,
): string {
  const url = resolveGalleryImageUrl(filename, baseUrl);
  const file = (filename || "").trim();
  if (url && file) return `${url}\n${file}`;
  return url || file;
}

const CRM_PUBLIC_BASE = "https://kmrlive.in/crmapi/public";

/**
 * Build a viewable image URL from whatever the API returns.
 * API is inconsistent: sometimes bare filename (`1.webp`),
 * sometimes `gallery_images/1.webp`, sometimes `assets/...`,
 * sometimes a full URL. Handle all without double-prefixing.
 */
export function resolveAssetImageUrl(
  value: string | null | undefined,
  folder: string,
): string | null {
  if (!value) return null;
  const v = value.trim();
  if (!v) return null;
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

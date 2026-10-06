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

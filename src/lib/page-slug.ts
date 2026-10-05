/**
 * Normalizes a CMS page reference to a slug.
 *
 * The page-list APIs (`/pageOne`, `/pageTwo`) return full URLs seeded from a
 * dev server (e.g. `http://localhost:5173/contact`). Persisting those
 * verbatim bakes a host into the record, so strip any origin and keep only
 * the path slug (`contact`). Plain slugs pass through unchanged.
 */
export function normalizePageSlug(
  value: string | null | undefined,
): string {
  const raw = (value ?? "").trim();
  if (!raw) return "home";
  try {
    if (/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(raw)) {
      const path = new URL(raw).pathname.replace(/^\/+|\/+$/g, "");
      return path || "home";
    }
  } catch {
    // Not a parseable absolute URL — fall through to relative handling.
  }
  const clean = raw.replace(/^\/+|\/+$/g, "");
  return clean || "home";
}

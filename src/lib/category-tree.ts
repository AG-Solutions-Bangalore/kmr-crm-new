import type { Category } from "@/modules/dashboard/category/types/category.types.ts";

/** A category with no parent — selectable as a Category (not a sub). */
export function isRootCategory(c: { parent_id?: number | string | null }): boolean {
  return (
    c.parent_id === null ||
    c.parent_id === undefined ||
    c.parent_id === "" ||
    c.parent_id === "0" ||
    c.parent_id === 0
  );
}

/**
 * Merge both category sources into one deduped list.
 * /activeCategories misses some parents (e.g. id 10 which has ~13 children),
 * /category has the full tree. The active version wins on conflicts.
 */
export function mergeCategories<T extends { id: number | string }>(active: T[], all: T[]): T[] {
  const map = new Map<string, T>();
  for (const c of [...all, ...active]) map.set(String(c.id), c);
  return [...map.values()];
}

/**
 * Categories selectable as a Category: roots + anything that has children.
 * Falls back to the full list when nothing qualifies.
 */
export function getParentCategories(categories: Category[]): Category[] {
  const parentIdSet = new Set(categories.map((c) => String(c.parent_id ?? "")));
  const list = categories.filter(
    (c) => isRootCategory(c) || parentIdSet.has(String(c.id)),
  );
  return list.length > 0 ? list : categories;
}

/**
 * Strict linking: direct children of the selected category only.
 * No category selected -> empty (caller disables the sub dropdown).
 */
export function getSubCategories(
  categories: Category[],
  categoryId: string,
): Category[] {
  if (!categoryId) return [];
  return categories.filter(
    (c) =>
      String(c.parent_id ?? "") === String(categoryId) &&
      String(c.id) !== String(categoryId),
  );
}

/**
 * Normalizes a category or sub-category name into a URL-friendly slug part.
 */
export function slugifyPart(val: string): string {
  return val
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Builds the category slug:
 * - Root category: e.g. "Coconut" -> "coconut"
 * - Sub-category: e.g. Parent "Coconut" + Sub "Coconut Oil" -> "coconut/coconut-oil"
 */
export function buildCategorySlug(
  name: string,
  isSub: boolean,
  parent?: { categories_name?: string; categories_slug?: string | null },
): string {
  const selfSlug = slugifyPart(name);
  if (!isSub || !parent) return selfSlug;

  const parentSlug =
    (parent.categories_slug ? parent.categories_slug.trim() : "") ||
    slugifyPart(parent.categories_name || "");

  if (parentSlug && selfSlug) {
    return `${parentSlug}/${selfSlug}`;
  }
  return selfSlug;
}


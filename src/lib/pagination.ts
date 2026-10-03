export interface PagedResult<T> {
  items: T[];
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
}

interface LaravelPaged<T> {
  current_page?: number;
  data: T[];
  total?: number;
  per_page?: number;
  last_page?: number;
}

/**
 * Normalizes the backend's many list shapes into one paginated result:
 * - plain array (full list)
 * - `{ data: [...] }` (full list)
 * - `{ data: { current_page, data, total, per_page, last_page } }` (Laravel paginator)
 */
export function parsePaginatedResponse<T>(
  data: unknown,
  page: number,
  perPage: number,
): PagedResult<T> {
  if (Array.isArray(data)) {
    return {
      items: data as T[],
      total: data.length,
      perPage: data.length || perPage,
      currentPage: 1,
      lastPage: 1,
    };
  }
  if (data && typeof data === "object") {
    const outer = data as { data?: unknown };
    if (Array.isArray(outer.data)) {
      const items = outer.data as T[];
      return {
        items,
        total: items.length,
        perPage: items.length || perPage,
        currentPage: 1,
        lastPage: 1,
      };
    }
    if (outer.data && typeof outer.data === "object") {
      const paged = outer.data as LaravelPaged<T>;
      if (Array.isArray(paged.data)) {
        return {
          items: paged.data,
          total: paged.total ?? paged.data.length,
          perPage: paged.per_page ?? perPage,
          currentPage: paged.current_page ?? page,
          lastPage: paged.last_page ?? 1,
        };
      }
    }
  }
  return { items: [], total: 0, perPage, currentPage: page, lastPage: 1 };
}

/** Builds `?page=&per_page=` (+ optional `&search=`) for list endpoints. */
export function pageQuery(
  path: string,
  page: number,
  perPage: number,
  search = "",
): string {
  const q = search.trim();
  return `${path}?page=${page}&per_page=${perPage}${q ? `&search=${encodeURIComponent(q)}` : ""}`;
}

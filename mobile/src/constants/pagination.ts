/** Mirrors the web's constants/pagination.ts (capped at 50: the coach client endpoint rejects larger pages). */
export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
export const DEFAULT_PAGE_SIZE = 10;

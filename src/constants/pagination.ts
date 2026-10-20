/** Capped at 50 because the admin audit-log and coach client endpoints reject larger pages. */
export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
export const DEFAULT_PAGE_SIZE = 10;

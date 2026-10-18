import type { Role } from '@prisma/client';

/** Privilege order: USER < COACH < ADMIN. */
const ROLE_RANK: Record<Role, number> = { USER: 0, COACH: 1, ADMIN: 2 };

export function hasAtLeastRole(actual: Role, minimum: Role): boolean {
  return ROLE_RANK[actual] >= ROLE_RANK[minimum];
}

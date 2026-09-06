import { prisma } from '../lib/prismaClient.js';
import { HttpError } from '../middleware/errorHandler.js';
import type { UpsertProfileInput } from '../validators/profile.validators.js';

export async function getProfileByUserId(userId: string) {
  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) {
    throw new HttpError(404, 'Profile not found');
  }
  return profile;
}

export async function upsertProfile(userId: string, input: UpsertProfileInput) {
  return prisma.profile.upsert({
    where: { userId },
    create: { userId, ...input },
    update: { ...input },
  });
}

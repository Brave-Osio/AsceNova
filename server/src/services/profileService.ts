import { prisma } from '../lib/prismaClient.js';
import { HttpError } from '../middleware/errorHandler.js';
import { calculateBmi } from '../lib/bmi.js';
import type { Profile } from '@prisma/client';
import type { UpsertProfileInput } from '../validators/profile.validators.js';

/** BMI is derived from the current profile height/weight on every read, so it can never go stale. */
function withBmi(profile: Profile) {
  return { ...profile, bmi: calculateBmi(profile.heightCm, profile.currentWeightKg) };
}

export async function getProfileByUserId(userId: string) {
  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) {
    throw new HttpError(404, 'Profile not found');
  }
  return withBmi(profile);
}

export async function upsertProfile(userId: string, input: UpsertProfileInput) {
  const profile = await prisma.profile.upsert({
    where: { userId },
    create: { userId, ...input },
    update: { ...input },
  });
  return withBmi(profile);
}

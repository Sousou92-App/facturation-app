import { prisma } from "@/lib/prisma";

const TRIAL_DAYS = 7;

export async function getOrCreateCurrentUser() {
  const id = "merchant-default";
  let user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id,
        trialEndsAt: new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000),
      },
    });
  }

  return user;
}

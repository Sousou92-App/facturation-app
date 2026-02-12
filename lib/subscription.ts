import { Plan, SubscriptionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function refreshSubscriptionState(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User introuvable");

  const now = new Date();
  const hasPaidPlan = user.plan === Plan.PREMIUM && !!user.currentPeriodEndsAt && user.currentPeriodEndsAt > now;

  if (hasPaidPlan) return user;

  if (user.trialEndsAt && now <= user.trialEndsAt) {
    if (user.plan !== Plan.TRIAL || user.status !== SubscriptionStatus.ACTIVE) {
      return prisma.user.update({
        where: { id: user.id },
        data: { plan: Plan.TRIAL, status: SubscriptionStatus.ACTIVE },
      });
    }
    return user;
  }

  if (user.plan !== Plan.FREE || user.status !== SubscriptionStatus.EXPIRED) {
    return prisma.user.update({
      where: { id: user.id },
      data: { plan: Plan.FREE, status: SubscriptionStatus.EXPIRED },
    });
  }

  return user;
}

export async function canCreateInvoice(userId: string) {
  const user = await refreshSubscriptionState(userId);
  return user.plan === Plan.PREMIUM || user.plan === Plan.TRIAL;
}

export async function activateOrRenewPremium(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User introuvable");

  const now = new Date();
  const baseDate = user.currentPeriodEndsAt && user.currentPeriodEndsAt > now ? user.currentPeriodEndsAt : now;
  const nextEnd = new Date(baseDate.getTime() + THIRTY_DAYS_MS);

  return prisma.user.update({
    where: { id: userId },
    data: {
      plan: Plan.PREMIUM,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodEndsAt: nextEnd,
    },
  });
}

import { NextResponse } from "next/server";
import { createChargilyCheckout } from "@/lib/chargily";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

const PREMIUM_PRICE_DZD = 500;

export async function POST() {
  try {
    const user = await getOrCreateCurrentUser();
    const checkout = await createChargilyCheckout({ amount: PREMIUM_PRICE_DZD, userId: user.id });

    await prisma.payment.create({
      data: {
        userId: user.id,
        checkoutId: checkout.id,
        amountDzd: PREMIUM_PRICE_DZD,
        status: "PENDING",
        provider: "chargily",
      },
    });

    return NextResponse.json({ checkoutUrl: checkout.checkout_url, checkoutId: checkout.id });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

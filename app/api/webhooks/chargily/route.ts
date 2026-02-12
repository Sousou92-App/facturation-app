import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { activateOrRenewPremium } from "@/lib/subscription";

function verifySignature(rawBody: string, signature: string, secret: string) {
  const hmac = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature));
}

export async function POST(req: Request) {
  const signature = req.headers.get("signature");
  const secret = process.env.CHARGILY_WEBHOOK_SECRET || process.env.CHARGILY_SECRET_KEY_TEST || "";
  const rawBody = await req.text();

  if (!signature || !secret) {
    return NextResponse.json({ error: "Signature/Webhook secret manquant" }, { status: 400 });
  }

  if (!verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as {
    type?: string;
    data?: { id?: string; metadata?: { userId?: string } };
  };

  const checkoutId = event.data?.id;
  const userId = event.data?.metadata?.userId;

  if (!checkoutId || !userId) {
    return NextResponse.json({ ok: true });
  }

  if (event.type?.includes("paid")) {
    await prisma.payment.updateMany({ where: { checkoutId }, data: { status: "PAID" } });
    await activateOrRenewPremium(userId);
  }

  if (event.type?.includes("failed")) {
    await prisma.payment.updateMany({ where: { checkoutId }, data: { status: "FAILED" } });
  }

  return NextResponse.json({ ok: true });
}

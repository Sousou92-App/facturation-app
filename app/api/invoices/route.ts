import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { canCreateInvoice } from "@/lib/subscription";

const schema = z.object({
  customer: z.string().min(1),
  description: z.string().min(1),
  amountDzd: z.number().int().positive(),
});

export async function POST(req: Request) {
  const user = await getOrCreateCurrentUser();
  const allowed = await canCreateInvoice(user.id);
  if (!allowed) {
    return NextResponse.json(
      { error: "Abonnement expiré. Passez à Premium pour créer de nouvelles factures." },
      { status: 403 }
    );
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
  }

  const invoice = await prisma.invoice.create({
    data: {
      userId: user.id,
      customer: parsed.data.customer,
      description: parsed.data.description,
      amountDzd: parsed.data.amountDzd,
    },
  });

  return NextResponse.json({ invoice });
}

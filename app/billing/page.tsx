import Link from "next/link";
import { BillingCard } from "@/components/billing-card";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import { refreshSubscriptionState } from "@/lib/subscription";

export default async function BillingPage() {
  const user = await getOrCreateCurrentUser();
  const updated = await refreshSubscriptionState(user.id);

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-4">
      <Link href="/" className="text-blue-700">← Retour</Link>
      <BillingCard
        plan={updated.plan}
        status={updated.status}
        trialEndsAt={updated.trialEndsAt?.toISOString() ?? null}
        currentPeriodEndsAt={updated.currentPeriodEndsAt?.toISOString() ?? null}
      />
    </main>
  );
}

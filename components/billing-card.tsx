"use client";

import { useState } from "react";

export function BillingCard({
  plan,
  status,
  trialEndsAt,
  currentPeriodEndsAt,
}: {
  plan: string;
  status: string;
  trialEndsAt: string | null;
  currentPeriodEndsAt: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setLoading(true);
    setError(null);
    const response = await fetch("/api/chargily/checkout", { method: "POST" });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Erreur paiement");
      setLoading(false);
      return;
    }

    window.location.href = data.checkoutUrl;
  }

  return (
    <div className="space-y-3 rounded-xl border bg-white p-4">
      <h1 className="text-xl font-semibold">Facturation abonnement</h1>
      <p>Plan: <strong>{plan}</strong></p>
      <p>Statut: <strong>{status}</strong></p>
      <p>Fin essai: {trialEndsAt ? new Date(trialEndsAt).toLocaleString("fr-FR") : "-"}</p>
      <p>Fin période Premium: {currentPeriodEndsAt ? new Date(currentPeriodEndsAt).toLocaleString("fr-FR") : "-"}</p>
      <button onClick={pay} disabled={loading} className="rounded bg-emerald-600 px-4 py-2 text-white">
        {loading ? "Redirection..." : "Payer 500 DA"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

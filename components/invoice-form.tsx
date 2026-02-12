"use client";

import { useState } from "react";

export function InvoiceForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setMessage(null);
    const payload = {
      customer: String(formData.get("customer") || ""),
      description: String(formData.get("description") || ""),
      amountDzd: Number(formData.get("amountDzd") || 0),
    };

    const response = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Erreur");
      setLoading(false);
      return;
    }

    setMessage("Facture créée avec succès.");
    (document.getElementById("invoice-form") as HTMLFormElement)?.reset();
    setLoading(false);
  }

  return (
    <form
      id="invoice-form"
      action={onSubmit}
      className="space-y-3 rounded-xl border bg-white p-4"
    >
      <h2 className="text-lg font-semibold">Créer une facture</h2>
      <input name="customer" required placeholder="Client" className="w-full rounded border p-2" />
      <input name="description" required placeholder="Description" className="w-full rounded border p-2" />
      <input name="amountDzd" type="number" min={1} required placeholder="Montant DZD" className="w-full rounded border p-2" />
      <button disabled={loading} className="rounded bg-blue-600 px-4 py-2 text-white">
        {loading ? "Chargement..." : "Créer"}
      </button>
      {message && <p className="text-sm">{message}</p>}
    </form>
  );
}

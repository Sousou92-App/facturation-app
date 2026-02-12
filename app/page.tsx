import Link from "next/link";
import { InvoiceForm } from "@/components/invoice-form";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { refreshSubscriptionState } from "@/lib/subscription";

export default async function HomePage() {
  const user = await getOrCreateCurrentUser();
  const updated = await refreshSubscriptionState(user.id);
  const invoices = await prisma.invoice.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });

  return (
    <main className="mx-auto max-w-4xl space-y-4 p-4">
      <header className="flex items-center justify-between rounded-xl border bg-white p-4">
        <div>
          <h1 className="text-2xl font-bold">Application de facturation (DZD)</h1>
          <p>Plan actuel: {updated.plan} - {updated.status}</p>
        </div>
        <Link href="/billing" className="rounded bg-slate-900 px-4 py-2 text-white">Billing</Link>
      </header>

      <InvoiceForm />

      <section className="rounded-xl border bg-white p-4">
        <h2 className="mb-2 text-lg font-semibold">Factures</h2>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th>Client</th><th>Description</th><th>Montant</th><th>Payé</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-t">
                  <td>{inv.customer}</td>
                  <td>{inv.description}</td>
                  <td>{inv.amountDzd} DZD</td>
                  <td>{inv.isPaid ? "Oui" : "Non"}</td>
                  <td>{new Date(inv.createdAt).toLocaleDateString("fr-FR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

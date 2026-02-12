const CHECKOUT_ENDPOINT = "https://pay.chargily.net/test/api/v2/checkouts";
const LIVE_CHECKOUT_ENDPOINT = "https://pay.chargily.net/api/v2/checkouts";

export function getChargilySecretKey() {
  const mode = process.env.CHARGILY_MODE === "live" ? "live" : "test";
  return mode === "live" ? process.env.CHARGILY_SECRET_KEY_LIVE : process.env.CHARGILY_SECRET_KEY_TEST;
}

export async function createChargilyCheckout(params: { amount: number; userId: string }) {
  const secretKey = getChargilySecretKey();
  if (!secretKey) throw new Error("Clé Chargily manquante");

  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const endpoint = process.env.CHARGILY_MODE === "live" ? LIVE_CHECKOUT_ENDPOINT : CHECKOUT_ENDPOINT;

  const payload = {
    amount: params.amount,
    currency: "DZD",
    success_url: `${appUrl}/billing?payment=success`,
    failure_url: `${appUrl}/billing?payment=failed`,
    metadata: { userId: params.userId },
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secretKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Chargily API error (${response.status})`);
  }

  return response.json() as Promise<{ id: string; checkout_url: string }>;
}

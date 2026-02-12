# Facturation DZ (Next.js + Chargily)

Application de facturation avec abonnement **Premium 500 DZD/mois** et essai **7 jours**.

## Stack
- Next.js + TypeScript
- Tailwind CSS
- Prisma
- SQLite (dev)

## Setup
```bash
npm install
cp .env.example .env
npm run prisma:migrate -- --name init
npm run dev
```

## Variables d'environnement
- `DATABASE_URL` (sqlite en dev: `file:./dev.db`)
- `APP_URL` (ex: `http://localhost:3000`)
- `CHARGILY_SECRET_KEY_TEST`
- `CHARGILY_SECRET_KEY_LIVE`
- `CHARGILY_WEBHOOK_SECRET` (ou la même clé secrète)
- `CHARGILY_MODE` (`test` ou `live`)

## Règles abonnement implémentées
- Inscription: `plan=TRIAL`, `status=ACTIVE`, `trialEndsAt=now+7j`
- Fin essai sans paiement: `plan=FREE`, `status=EXPIRED`
- Paiement réussi: `plan=PREMIUM`, `status=ACTIVE`, `currentPeriodEndsAt=max(now,currentPeriodEndsAt)+30j`
- Création facture autorisée côté serveur seulement si `TRIAL` ou `PREMIUM`

## Test mode Chargily
1. Aller sur `/billing`
2. Cliquer **Payer 500 DA**
3. Le backend crée un checkout Chargily V2 et redirige vers `checkout_url`

## Webhook local
Endpoint: `POST /api/webhooks/chargily`

Exemple avec tunnel (ngrok):
```bash
ngrok http 3000
```
Configurer Chargily webhook URL vers:
`https://<votre-ngrok>/api/webhooks/chargily`

Le webhook vérifie la signature HMAC (`header: signature`) sur le payload brut.

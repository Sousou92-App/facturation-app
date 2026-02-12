import "./globals.css";

export const metadata = {
  title: "Facturation DZ",
  description: "Facturation avec abonnement Premium",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}

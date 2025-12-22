import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'sonner'; // ✅ Pour les notifications

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Reputation OS",
  description: "Gérez vos avis clients avec l'IA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="fr">
        <body className={inter.className}>
          {/* Le contenu de votre application */}
          {children}
          
          {/* ✅ Le gestionnaire de notifications (indispensable pour le module marketing) */}
          <Toaster position="bottom-center" richColors closeButton />
        </body>
      </html>
    </ClerkProvider>
  );
}
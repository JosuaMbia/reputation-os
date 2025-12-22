import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'sonner'; 
import { AICopilot } from "@/components/ai-copilot"; // ✅ IL EST DE RETOUR

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
          {/* Le contenu principal de votre application */}
          {children}
          
          {/* ✅ LE COPILOT FLOTTANT (Central) */}
          <AICopilot />

          {/* ✅ Les notifications Toast (Indispensable pour le marketing) */}
          <Toaster position="bottom-center" richColors closeButton />
        </body>
      </html>
    </ClerkProvider>
  );
}
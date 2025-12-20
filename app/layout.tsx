import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { AICopilot } from "@/components/ai-copilot"; // ✅ Import du Copilot

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Reputation OS - Gestion intelligente des avis Google",
  description: "SaaS intelligent pour gérer les avis Google avec IA",
  icons: {
    icon: '/logo.png',
  },
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
          {/* Le contenu de votre site */}
          {children}
          
          {/* ✅ Le Copilot est ajouté ici. Il s'affichera par-dessus toutes les pages */}
          <AICopilot />
        </body>
      </html>
    </ClerkProvider>
  );
}
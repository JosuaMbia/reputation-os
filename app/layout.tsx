import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { AICopilot } from "@/components/ai-copilot"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Reputation OS - Gestion intelligente des avis Google",
  description: "SaaS intelligent pour gérer les avis Google avec IA",
  // ✅ AJOUT DU LOGO ICI
  icons: {
    icon: '/logo.png', // Next.js ira chercher ce fichier dans le dossier public/
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
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
// app/dashboard/layout.tsx (exemple)



export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      {/* Le contenu normal de vos pages dashboard */}
      {children}

      {/* ✅ LE COPILOT EST ICI (Il flottera par-dessus tout) */}
      <AICopilot />
    </div>
  );
}
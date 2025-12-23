import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs"; // ✅ IMPORT INDISPENSABLE
import { SettingsForm } from "@/components/settings-form";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const business = await prisma.business.findFirst({
    where: { userId }
  });

  // Si pas de business (cas rare si on est dans le dashboard), on gère
  if (!business) return <div className="p-8">Chargement du profil...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* ✅ LE FIL D'ARIANE (BREADCRUMBS) EST ICI */}
        <Breadcrumbs />

        <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">⚙️ Paramètres & Connexions</h1>
            <p className="text-gray-500 mt-1">
                Gérez l'identité de votre entreprise et vos intégrations réseaux sociaux.
            </p>
        </div>

        {/* Le Formulaire Complet (Identité + Social + IA) */}
        <SettingsForm initialData={business} />

      </div>
    </div>
  );
}
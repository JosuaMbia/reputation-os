import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UpgradeButton } from "@/components/upgrade-button";
import { updateBusinessSettings } from "@/app/actions/update-settings";
import Link from "next/link";

export default async function SettingsPage() {
  // 1. Vérification Auth & Récupération du Business
  const { userId } = await auth();
  if (!userId) redirect("/");

  const business = await prisma.business.findFirst({
    where: { userId: userId }
  });

  // Si l'utilisateur n'a pas encore fini l'onboarding
  if (!business) {
    return (
      <div className="p-8 text-center">
        <p>Veuillez d'abord connecter votre établissement.</p>
        <Link href="/dashboard" className="text-blue-600 underline">Retour au Dashboard</Link>
      </div>
    );
  }

  // 2. Configuration Stripe
  // Récupère l'ID du prix depuis .env, sinon utilise une valeur de test par défaut
  const STRIPE_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || "price_test_placeholder";
  
  // Vérifie si l'abonnement est actif (si l'ID d'abonnement existe en base)
  const isPro = !!business.stripeSubscriptionId;

  // 3. Wrapper pour l'action serveur (Formulaire IA)
  async function saveSettings(formData: FormData) {
    'use server'
    await updateBusinessSettings(formData);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* En-tête */}
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold dark:text-white">⚙️ Paramètres</h1>
            <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-medium transition">
             ← Retour
            </Link>
        </div>

        {/* --- SECTION 1 : ABONNEMENT STRIPE --- */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 dark:text-white flex items-center gap-2">
            💎 Mon Abonnement
          </h2>
          <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
            <div>
              <p className="font-medium text-gray-900 dark:text-white text-lg">
                Statut : <span className={isPro ? "text-green-600 font-bold" : "text-gray-500"}>
                  {isPro ? "Premium Actif ✅" : "Gratuit"}
                </span>
              </p>
              {!isPro && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Passez Pro pour activer la réponse automatique aux avis.
                </p>
              )}
            </div>
            
            {/* Affichage conditionnel du bouton */}
            {isPro ? (
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium cursor-default">
                Géré via le portail Stripe
              </button>
            ) : (
              <UpgradeButton priceId={STRIPE_PRICE_ID} businessId={business.id} />
            )}
          </div>
        </div>

        {/* --- SECTION 2 : CONFIGURATION IA (Votre Action) --- */}
        <div>
            <h2 className="text-2xl font-bold mb-2 dark:text-white">🧠 Configuration IA</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
                Personnalisez la façon dont l'IA répond à vos clients.
            </p>

            <form action={saveSettings} className="space-y-6">
                
                {/* IDENTITÉ & SEO LOCAL */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 dark:text-white">📍 Identité & SEO</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type d'activité</label>
                            <input name="type" defaultValue={business.type || ""} placeholder="Ex: Boulangerie" className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ville</label>
                            <input name="city" defaultValue={business.city || ""} placeholder="Ex: Paris" className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                    </div>
                </div>

                {/* MOTS-CLÉS */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 dark:text-white">🚀 Mots-clés Cibles</h3>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Liste de mots-clés (séparés par des virgules)</label>
                    <input name="seoKeywords" defaultValue={business.seoKeywords || ""} placeholder="Ex: meilleur croissant, sandwich frais..." className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>

                {/* PERSONNALITÉ */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 dark:text-white">🎭 Ton & Signature</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ton de réponse</label>
                            <select name="tone" defaultValue={business.tone || "professional"} className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500">
                                <option value="professional">👔 Professionnel (Vouvoiement)</option>
                                <option value="friendly">👋 Amical (Tutoiement possible)</option>
                                <option value="empathetic">❤️ Empathique</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Signature</label>
                            <input name="signature" defaultValue={business.signature || ""} placeholder="L'équipe..." className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition transform hover:scale-105">
                        💾 Sauvegarder tout
                    </button>
                </div>
            </form>
        </div>

      </div>
    </div>
  );
}
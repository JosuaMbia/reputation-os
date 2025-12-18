import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { updateBusinessSettings } from "@/app/actions/update-settings";

export default async function SettingsPage() {
  // 1. Vérification Auth & Récupération Données
  const { userId } = await auth();
  if (!userId) redirect("/");

  const business = await prisma.business.findFirst({
    where: { userId: userId }
  });

  // Si pas de business, on redirige (ou on affiche un message)
  if (!business) {
    return (
      <div className="p-8 text-center">
        <p>Veuillez d'abord connecter votre établissement sur le Dashboard.</p>
        <Link href="/dashboard" className="text-blue-600 underline">Retour</Link>
      </div>
    );
  }

  // 2. L'Action Serveur pour sauvegarder
  async function saveSettings(formData: FormData) {
    'use server'
    await updateBusinessSettings(formData);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* En-tête avec Navigation */}
        <div className="mb-6 flex items-center justify-between">
            <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-medium flex items-center gap-2 transition">
            ← Retour au Dashboard
            </Link>
        </div>

        <h1 className="text-3xl font-bold mb-2 dark:text-white">⚙️ Paramètres IA & SEO</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
            Configurez le cerveau de votre assistant pour des réponses parfaites et un meilleur référencement.
        </p>

        {/* Le Formulaire Principal */}
        <form action={saveSettings} className="space-y-6">
            
            {/* CARD 1 : IDENTITÉ & SEO LOCAL */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4 dark:text-white flex items-center gap-2">
                    📍 Identité & SEO Local
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type d'activité</label>
                        <input 
                            name="type" 
                            defaultValue={business.type || ""} 
                            placeholder="Ex: Boulangerie Artisanale"
                            className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ville (Crucial pour le SEO)</label>
                        <input 
                            name="city" 
                            defaultValue={business.city || ""} 
                            placeholder="Ex: Lyon"
                            className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                </div>
            </div>

            {/* CARD 2 : STRATÉGIE DE MOTS-CLÉS */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4 dark:text-white flex items-center gap-2">
                    🚀 Mots-clés Cibles
                </h2>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Liste de mots-clés (séparés par des virgules)
                    </label>
                    <input 
                        name="seoKeywords" 
                        defaultValue={business.seoKeywords || ""} 
                        placeholder="Ex: meilleur croissant, sandwich frais, déjeuner rapide"
                        className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        💡 L'IA tentera d'insérer ces termes naturellement dans les réponses aux avis positifs (4-5 étoiles) pour booster votre visibilité Google.
                    </p>
                </div>
            </div>

            {/* CARD 3 : PERSONNALITÉ DE L'IA */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4 dark:text-white flex items-center gap-2">
                    🧠 Personnalité & Ton
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ton de réponse</label>
                        <div className="relative">
                            <select 
                                name="tone" 
                                defaultValue={business.tone || "professional"} 
                                className="w-full p-3 border rounded-lg bg-gray-50 appearance-none focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                            >
                                <option value="professional">👔 Professionnel & Courtois (Vouvoiement)</option>
                                <option value="friendly">👋 Amical & Chaleureux (Tutoie parfois)</option>
                                <option value="empathetic">❤️ Empathique & Attentionné</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Signature automatique</label>
                        <input 
                            name="signature" 
                            defaultValue={business.signature || ""} 
                            placeholder="Ex: L'équipe du Garage Michel"
                            className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                </div>
            </div>

            {/* BOUTON D'ACTION */}
            <div className="flex justify-end pt-4">
                <button 
                    type="submit" 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition transform hover:scale-105"
                >
                    💾 Sauvegarder les réglages
                </button>
            </div>

        </form>
      </div>
    </div>
  );
}
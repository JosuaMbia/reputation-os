"use client";

import { useState } from "react";
import { updateBusinessSettings } from "@/app/actions/update-settings";
import Link from "next/link";

interface SettingsFormProps {
  business: any;
  isPro: boolean;
  stripePriceId: string;
}

export function SettingsForm({ business, isPro }: SettingsFormProps) {
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    await updateBusinessSettings(formData);
    setLoading(false);
    
    // ✅ Afficher le Toast
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="relative">
      {/* ✅ NOTIFICATION FLOTTANTE (Toast) */}
      {showToast && (
        <div className="fixed top-24 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-in slide-in-from-right-10 z-50">
          <span className="text-xl">✅</span>
          <span className="font-bold">Modifications sauvegardées !</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* En-tête */}
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold dark:text-white">⚙️ Paramètres</h1>
            <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-medium transition">
              ← Retour Dashboard
            </Link>
        </div>

        {/* --- SECTION 1 : ABONNEMENT --- */}
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
            
            {/* ✅ BOUTON CORRIGÉ : Lien simple vers la page Pricing */}
            {isPro ? (
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium cursor-default">
                Géré via Stripe
              </button>
            ) : (
              <Link 
                href="/pricing" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:shadow-lg transition transform hover:-translate-y-0.5"
              >
                S'abonner maintenant 🚀
              </Link>
            )}
          </div>
        </div>

        {/* --- SECTION 2 : CONFIGURATION IA --- */}
        <div>
            <h2 className="text-2xl font-bold mb-2 dark:text-white">🧠 Configuration IA</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
                Personnalisez la façon dont l'IA répond à vos clients.
            </p>

            <form action={handleSubmit} className="space-y-6">
                
                {/* IDENTITÉ & SEO */}
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

                {/* POINTS D'ATTENTION (NOUVEAU) */}
<div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
    <h3 className="text-lg font-semibold mb-4 dark:text-white">🎯 Mes Priorités (Pour l'analyse IA)</h3>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Sur quels critères voulez-vous être jugé ? (séparés par des virgules)
    </label>
    <input 
        name="focusAreas" 
        defaultValue={business.focusAreas || ""} 
        placeholder="Ex: Rapidité de livraison, Amabilité, Propreté..." 
        className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" 
    />
    <p className="text-xs text-gray-400 mt-2">
        L'IA utilisera ces critères pour identifier vos Forces et Faiblesses dans le Dashboard.
    </p>
</div>

                {/* TON & SIGNATURE */}
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

                {/* BOUTON SAUVEGARDER */}
                <div className="flex justify-end pt-4 pb-10">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? "Sauvegarde..." : "💾 Sauvegarder tout"}
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
}
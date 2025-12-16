import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUserWithBusiness } from "@/lib/auth-sync";

// Fonction utilitaire pour calculer la vélocité
function calculateVelocity(reviews: any[], days: number) {
  if (days === 0) return 0;
  return (reviews.length / days).toFixed(2);
}

export default async function AnalyticsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const data = await getCurrentUserWithBusiness(userId);
  const business = data?.user?.businesses?.[0];

  if (!business) {
    return <div className="p-8">Veuillez d'abord synchroniser votre établissement.</div>;
  }

  // Récupérer tous les avis triés par date
  const reviews = await prisma.review.findMany({
    where: { businessId: business.id },
    orderBy: { reviewDate: 'desc' },
  });

  // --- LOGIQUE D'ANALYSE ---

  // 1. Définir le "Jour Z" (Date d'inscription à la solution)
  // Pour l'instant on prend la date de création du compte, ou une date arbitraire si trop récent
  const joinDate = new Date(business.createdAt);
  const now = new Date();
  
  // Calculer la durée d'utilisation (en jours)
  const daysSinceJoin = Math.max(1, Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 3600 * 24)));
  
  // Période de comparaison (même durée avant l'inscription)
  const compareDate = new Date(joinDate);
  compareDate.setDate(compareDate.getDate() - daysSinceJoin);

  // 2. Segmenter les avis
  const reviewsAfter = reviews.filter(r => new Date(r.reviewDate) >= joinDate);
  const reviewsBefore = reviews.filter(r => new Date(r.reviewDate) < joinDate && new Date(r.reviewDate) >= compareDate);

  // 3. Métriques de Volume (Proxy Ventes)
  const velocityAfter = calculateVelocity(reviewsAfter, daysSinceJoin);
  const velocityBefore = calculateVelocity(reviewsBefore, daysSinceJoin);
  
  // Estimation des ventes (Hypothèse: 1 avis = 20 ventes, à ajuster selon le secteur)
  const SALES_MULTIPLIER = 20; 
  const estSalesAfter = Math.round(reviewsAfter.length * SALES_MULTIPLIER);
  const estSalesBefore = Math.round(reviewsBefore.length * SALES_MULTIPLIER);
  const salesGrowth = estSalesBefore > 0 ? ((estSalesAfter - estSalesBefore) / estSalesBefore * 100).toFixed(1) : "0";

  // 4. Métriques SEO (Taux de réponse)
  const responseRateAfter = reviewsAfter.length > 0 
    ? Math.round((reviewsAfter.filter(r => r.isReplied).length / reviewsAfter.length) * 100) 
    : 0;
  
  const responseRateBefore = reviewsBefore.length > 0 
    ? Math.round((reviewsBefore.filter(r => r.isReplied).length / reviewsBefore.length) * 100) 
    : 0;

  // --- ANALYSE QUALITATIVE (SIMULATION IA) ---
  // Idéalement, cela viendrait d'une analyse GPT réelle stockée en base.
  // Ici on fait une analyse basique sur les notes.
  const positiveReviews = reviews.filter(r => r.rating >= 4);
  const negativeReviews = reviews.filter(r => r.rating <= 3);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Analyse & Performance</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Comparaison sur {daysSinceJoin} jours d'utilisation vs la période précédente.
        </p>

        {/* SECTION 1: ROI & VOLUME (PREUVE DE VALEUR) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          {/* Carte Croissance Avis */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Fréquence d'avis (Hebdo)</h3>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {(Number(velocityAfter) * 7).toFixed(1)}
              </span>
              <span className={`text-sm font-medium ${Number(velocityAfter) >= Number(velocityBefore) ? 'text-green-600' : 'text-red-500'}`}>
                vs {(Number(velocityBefore) * 7).toFixed(1)} avant
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-2">Indicateur de trafic client</p>
          </div>

          {/* Carte Estimation Ventes */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-green-500">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Ventes Estimées (Période)</h3>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                ~{estSalesAfter}
              </span>
              <span className="text-sm text-green-600 font-medium">
                {Number(salesGrowth) > 0 ? `+${salesGrowth}%` : `${salesGrowth}%`}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-2">Basé sur ratio 1 avis / {SALES_MULTIPLIER} clients</p>
          </div>

          {/* Carte Impact SEO */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Impact SEO (Réponses)</h3>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {responseRateAfter}%
              </span>
              <span className="text-sm text-purple-600 font-medium">
                vs {responseRateBefore}% avant
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-2">Un taux de 100% booste la visibilité Google</p>
          </div>
        </div>

        {/* SECTION 2: QUALITATIF (CE QUI MARCHE / PÊCHE) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Points Forts */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-green-50 dark:bg-green-900/20 px-6 py-4 border-b border-green-100 dark:border-green-800">
              <h3 className="font-bold text-green-800 dark:text-green-300 flex items-center gap-2">
                <span>🚀</span> Ce que vos clients adorent (Top 5)
              </h3>
            </div>
            <div className="p-6">
              {positiveReviews.length > 0 ? (
                <ul className="space-y-4">
                  {positiveReviews.slice(0, 5).map((r) => (
                    <li key={r.id} className="text-sm text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700 last:border-0 pb-3 last:pb-0">
                      <span className="text-green-500 font-bold mr-2">+{r.rating}★</span>
                      "{r.content.length > 80 ? r.content.substring(0, 80) + '...' : r.content}"
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">Pas assez de données positives pour analyser.</p>
              )}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition">
                  ✨ Analyser les thèmes forts avec l'IA
                </button>
              </div>
            </div>
          </div>

          {/* Points d'Amélioration */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-red-50 dark:bg-red-900/20 px-6 py-4 border-b border-red-100 dark:border-red-800">
              <h3 className="font-bold text-red-800 dark:text-red-300 flex items-center gap-2">
                <span>⚠️</span> Points de vigilance (Top 5)
              </h3>
            </div>
            <div className="p-6">
              {negativeReviews.length > 0 ? (
                <ul className="space-y-4">
                  {negativeReviews.slice(0, 5).map((r) => (
                    <li key={r.id} className="text-sm text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700 last:border-0 pb-3 last:pb-0">
                      <span className="text-red-500 font-bold mr-2">{r.rating}★</span>
                      "{r.content.length > 80 ? r.content.substring(0, 80) + '...' : r.content}"
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-center py-4">Bravo ! Aucun avis négatif récent.</p>
              )}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition">
                  🛡️ Générer un plan d'action correctif
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
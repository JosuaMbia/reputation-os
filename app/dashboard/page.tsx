import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  // 1. Récupérer les infos du business et les stats des avis
  const business = await prisma.business.findFirst({
    where: { userId },
    include: {
      reviews: true, // On récupère les avis pour calculer les stats
    },
  });

  // Si pas de business, on redirige vers l'onboarding (si vous en avez un) ou on affiche un message
  if (!business) {
    return <div>Chargement du profil...</div>;
  }

  // 2. Calculs des Statistiques
  const totalReviews = business.reviews.length;
  
  // Calcul de la note moyenne
  const averageRating = totalReviews > 0
    ? (business.reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews).toFixed(1)
    : "0.0";

  // Calcul du nombre d'avis sans réponse (si vous gérez ce champ, sinon optionnel)
  const pendingReviews = business.reviews.filter(r => !r.response).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* En-tête de bienvenue */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Bonjour, {business.name || "Entrepreneur"} 👋
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Voici ce qui se passe sur votre e-réputation aujourd'hui.
            </p>
          </div>
          <Link 
            href="/dashboard/settings" 
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition shadow-sm"
          >
            ⚙️ Réglages
          </Link>
        </div>

        {/* CAS 1 : Aucun avis importé -> On guide l'utilisateur */}
        {totalReviews === 0 ? (
          <div className="bg-indigo-600 rounded-2xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">🚀 Lancez la machine !</h2>
              <p className="text-indigo-100 max-w-lg">
                Vous n'avez pas encore d'avis synchronisés. Importez vos avis Google ou Trustpilot pour commencer à générer des réponses avec l'IA.
              </p>
              <Link 
                href="/dashboard/reviews" 
                className="inline-block px-6 py-3 bg-white text-indigo-600 font-bold rounded-lg hover:bg-indigo-50 transition"
              >
                📥 Importer mes avis maintenant
              </Link>
            </div>
            <div className="text-6xl">📊</div>
          </div>
        ) : (
          /* CAS 2 : Des avis existent -> On affiche les KPIs */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* KPI 1 : Note Moyenne */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Note Moyenne</h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">{averageRating}</span>
                <span className="text-yellow-500 text-2xl">★</span>
              </div>
            </div>

            {/* KPI 2 : Total Avis */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Total Avis</h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">{totalReviews}</span>
                <span className="text-sm text-gray-500">avis analysés</span>
              </div>
            </div>

            {/* KPI 3 : Action Rapide */}
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-6 rounded-xl shadow-sm text-white flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-medium text-purple-100 uppercase">À traiter</h3>
                <div className="mt-2 text-3xl font-bold">{pendingReviews} avis</div>
              </div>
              <Link href="/dashboard/reviews" className="mt-4 text-sm font-bold hover:underline flex items-center gap-1">
                Gérer mes avis →
              </Link>
            </div>
          </div>
        )}

        {/* Liens Rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/dashboard/reviews" className="group bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-500 transition cursor-pointer">
                <h3 className="text-lg font-bold mb-2 group-hover:text-indigo-600 transition">⭐ Gestion des Avis</h3>
                <p className="text-gray-500 text-sm">Voir, importer et répondre à vos avis Google & Trustpilot.</p>
            </Link>
            
            <Link href="/dashboard/settings" className="group bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 hover:border-purple-500 transition cursor-pointer">
                <h3 className="text-lg font-bold mb-2 group-hover:text-purple-600 transition">🧠 Configuration IA</h3>
                <p className="text-gray-500 text-sm">Ajuster le ton, la signature et les mots-clés de l'assistant.</p>
            </Link>
        </div>

      </div>
    </div>
  );
}
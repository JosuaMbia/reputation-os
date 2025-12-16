import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { getCurrentUserWithBusiness } from "@/lib/auth-sync";
import { BusinessInfoCard } from '@/components/BusinessInfoCard';

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  // Récupérer les données utilisateur
  const userData = await getCurrentUserWithBusiness(userId);

  // Statistiques fictives (en attendant l'intégration Google Business API)
  const stats = {
    totalReviews: 0,
    newReviews: 0,
    avgRating: 0,
    responseRate: 0
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🌟</span>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Reputation OS
              </h1>
            </Link>
            <div>
              <UserButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Bienvenue, {userData?.user?.name || "Utilisateur"}
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Gérez vos avis Google et améliorez votre réputation en ligne.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Avis totaux</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalReviews}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Nouveaux avis</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.newReviews}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Note moyenne</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.avgRating.toFixed(1)} ⭐</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Taux de réponse</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.responseRate}%</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Actions rapides
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition">
              <span className="text-2xl">💬</span>
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-gray-100">Voir les avis</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Gérer vos avis clients</p>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition">
              <span className="text-2xl">🤖</span>
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-gray-100">Générer réponses IA</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Réponses personnalisées</p>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition">
              <span className="text-2xl">⚙️</span>
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-gray-100">Paramètres</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Configurer votre compte</p>
              </div>
            </button>
          </div>
        </div>

              {/* Informations établissement Google */}
      <BusinessInfoCard />
      </div>
    </div>
  );
}
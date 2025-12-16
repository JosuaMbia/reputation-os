import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { getCurrentUserWithBusiness } from "@/lib/auth-sync";
import { BusinessInfoCard } from '@/components/BusinessInfoCard';

export default async function DashboardPage() {
  // 1. Vérification Authentification
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  // 2. Récupération des données DB (Prisma)
  const data = await getCurrentUserWithBusiness(userId);
  const user = data?.user;
  
  // On prend le premier business de l'utilisateur (s'il existe)
  const business = user?.businesses?.[0];
  const reviews = business?.reviews || [];

  // 3. Calcul des statistiques réelles
  const totalReviews = reviews.length;
  
  // Calcul moyenne
  const avgRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : "0.0";

  // Calcul taux de réponse
  const repliedCount = reviews.filter(r => r.isReplied).length;
  const responseRate = totalReviews > 0
    ? Math.round((repliedCount / totalReviews) * 100)
    : 0;

  // Calcul nouveaux avis (ce mois-ci)
  const currentMonth = new Date().getMonth();
  const newReviews = reviews.filter(r => new Date(r.reviewDate).getMonth() === currentMonth).length;

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
            <div className="flex items-center gap-4">
               {/* Petit texte de bienvenue dans la nav */}
               <span className="text-sm text-gray-500 hidden md:block">
                 {business?.name || "Aucun établissement"}
               </span>
               <UserButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Bienvenue, {user?.name || "Utilisateur"}
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Voici un aperçu des performances de <strong>{business?.name || "votre établissement"}</strong>.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Total */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-blue-500">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Avis totaux</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{totalReviews}</p>
          </div>

          {/* Card 2: Nouveaux */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-green-500">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Nouveaux (ce mois)</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{newReviews}</p>
          </div>

          {/* Card 3: Moyenne */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-yellow-500">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Note moyenne</h3>
            <div className="flex items-end gap-2">
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{avgRating}</p>
              <span className="text-yellow-500 text-xl mb-1">⭐</span>
            </div>
          </div>

          {/* Card 4: Réponse */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-purple-500">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Taux de réponse</h3>
            <div className="flex items-center gap-2">
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{responseRate}%</p>
                {responseRate < 50 && totalReviews > 0 && (
                    <span className="text-xs text-red-500 mt-3 font-medium">⚠️ Faible</span>
                )}
            </div>
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Colonne Gauche : Actions Rapides */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Actions rapides
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
                        <Link href="/dashboard/reviews" className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 transition group">
                <span className="text-2xl group-hover:scale-110 transition-transform">💬</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-gray-100">Gérer les avis</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Voir et répondre aux clients</p>
                </div>
              </Link>

              <button className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-gray-700 transition group">
                <span className="text-2xl group-hover:scale-110 transition-transform">🤖</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-gray-100">Réponses IA</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Configurer le ton et le style</p>
                </div>
              </button>

                            <Link href="/dashboard/analytics" className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950 transition group">
                <span className="text-2xl group-hover:scale-110 transition-transform">📊</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-gray-100">Analytics</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Voir les statistiques</p>
                </div>
              </Link>

                        <Link href="/dashboard/settings" className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 transition">
                <span className="text-2xl group-hover:scale-110 transition-transform">⚙️</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-gray-100">Paramètres</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Compte et intégrations</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Colonne Droite : Info Business (Composant Client) */}
        <div className="lg:col-span-1">
             {/* Ce composant gérera la synchro Google côté client si besoin */}
             <BusinessInfoCard />
        </div>

      </div>
    </div>
  );
}
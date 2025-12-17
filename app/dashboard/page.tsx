import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { getCurrentUserWithBusiness } from "@/lib/auth-sync";
import { BusinessInfoCard } from '@/components/BusinessInfoCard';
import { syncBusinessData } from "@/app/actions/sync-business";

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

  // --- CAS : AUCUN ÉTABLISSEMENT TROUVÉ (Pour Joëlle) ---
  if (!business || !business.googlePlaceId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
        <nav className="absolute top-0 w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
             <div className="font-bold text-xl text-gray-900 dark:text-white">Reputation OS</div>
             <UserButton />
        </nav>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-100 dark:border-gray-700 mt-10">
          <div className="text-5xl mb-6">🚀</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Bienvenue sur Reputation OS</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Pour commencer, nous devons connecter votre fiche Google Business existante.
          </p>
          
          <form action={syncBusinessData}>
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <span>🔄</span> Lancer la détection automatique
            </button>
          </form>
          
          <p className="text-xs text-gray-400 mt-6">
            Cela va scanner votre compte Google pour trouver votre établissement.
          </p>
        </div>
      </div>
    );
  }

  // 3. Calcul des statistiques (Si connecté)
  const reviews = business.reviews || [];
  const totalReviews = reviews.length;
  
  const avgRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : "0.0";

  const repliedCount = reviews.filter(r => r.isReplied).length;
  const responseRate = totalReviews > 0
    ? Math.round((repliedCount / totalReviews) * 100)
    : 0;

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
               <span className="text-sm text-gray-500 hidden md:block">
                 {business?.name}
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
          Voici un aperçu des performances de <strong>{business?.name}</strong>.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-blue-500">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Avis totaux</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{totalReviews}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-green-500">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Nouveaux (ce mois)</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{newReviews}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-yellow-500">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Note moyenne</h3>
            <div className="flex items-end gap-2">
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{avgRating}</p>
              <span className="text-yellow-500 text-xl mb-1">⭐</span>
            </div>
          </div>

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
                  <p className="text-sm text-gray-
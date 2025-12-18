import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { getCurrentUserWithBusiness } from "@/lib/auth-sync";
import { BusinessInfoCard } from '@/components/BusinessInfoCard';
import { SyncButton } from '@/components/SyncButton';
import { ManualRequestForm } from "@/components/manual-request-form"; // ✅ Le nouvel import

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  const data = await getCurrentUserWithBusiness(userId);
  const user = data?.user;
  const business = user?.businesses?.[0];

  // --- CAS 1 : AUCUN ÉTABLISSEMENT TROUVÉ (Écran d'attente) ---
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
            En attente de validation Google...
          </p>
          
          <SyncButton />
          
          {/* 👇 FORMULAIRE MANUEL INTÉGRÉ ICI 👇 */}
          <div className="mt-8 pt-6 border-t border-gray-100">
             <p className="text-sm text-gray-500 mb-4">En attendant, envoyez votre première invitation :</p>
             <ManualRequestForm />
          </div>
        </div>
      </div>
    );
  }

  // --- CAS 2 : DASHBOARD COMPLET ---
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
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-bold text-blue-600">Reputation OS</Link>
          <span className="text-sm text-gray-500 hidden md:block">{business.name}</span>
        </div>
        <UserButton />
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLONNE GAUCHE (Stats + Actions) */}
        <div className="lg:col-span-2 space-y-6">
           {/* Stats Grid */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-blue-500">
                <div className="text-sm text-gray-500 dark:text-gray-400">Avis Total</div>
                <div className="text-2xl font-bold dark:text-white">{totalReviews}</div>
                <div className="text-xs text-green-600">+{newReviews} ce mois</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-yellow-500">
                <div className="text-sm text-gray-500 dark:text-gray-400">Note Moyenne</div>
                <div className="text-2xl font-bold dark:text-white">{avgRating} ⭐</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-purple-500">
                <div className="text-sm text-gray-500 dark:text-gray-400">Taux Réponse</div>
                <div className="text-2xl font-bold dark:text-white">{responseRate}%</div>
              </div>
           </div>
           
           {/* Actions Rapides */}
           <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="font-bold mb-4 dark:text-white">Actions Rapides</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/dashboard/reviews" className="p-4 border rounded hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 flex gap-3 items-center">
                   <span className="text-2xl">💬</span>
                   <div>
                     <div className="font-semibold dark:text-white">Gérer les avis</div>
                     <div className="text-xs text-gray-500 dark:text-gray-400">Répondre aux clients</div>
                   </div>
                </Link>
                <Link href="/dashboard/analytics" className="p-4 border rounded hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 flex gap-3 items-center">
                   <span className="text-2xl">📊</span>
                   <div>
                     <div className="font-semibold dark:text-white">Analytics</div>
                     <div className="text-xs text-gray-500 dark:text-gray-400">Voir les stats</div>
                   </div>
                </Link>
              </div>
           </div>
        </div>

        {/* COLONNE DROITE (Infos + Outils) */}
        <div className="lg:col-span-1 space-y-6">
          <BusinessInfoCard />
          
          {/* 👇 FORMULAIRE PLACÉ ICI DANS LE DASHBOARD 👇 */}
          <ManualRequestForm />
        </div>
      </div>
    </div>
  );
}
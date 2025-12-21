import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getDashboardData } from "@/app/actions/get-dashboard-data"; // ✅ Le connecteur
import { AnalyticsCharts } from "@/components/analytics-chart"; // ✅ Les graphiques

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  // On charge les données via le "Cerveau"
  const data = await getDashboardData();

  if (!data) return <div className="p-10 text-center text-gray-500">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* EN-TÊTE */}
        <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {data.name} <span className="text-sm text-gray-500">({data.totalReviews} avis)</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/reviews" className="px-4 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-sm border border-indigo-100">
              📥 Importer Avis
            </Link>
            <UserButton afterSignOutUrl="/"/>
          </div>
        </div>

        {/* --- ZONE VISUELLE (GRAPHIQUES) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* KPI Note Globale */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center flex flex-col justify-center">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Santé Globale</h3>
              <div className="text-6xl font-black text-gray-900 dark:text-white flex justify-center items-center gap-2">
                {data.ratingDisplay} <span className="text-yellow-400 text-4xl">★</span>
              </div>
              <div className={`mt-4 mx-auto px-4 py-1 rounded-full text-xs font-bold border w-fit ${data.rating < 4 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                {data.rating < 4 ? "⚠️ ACTION REQUISE" : "✅ EXCELLENT"}
              </div>
            </div>

            {/* GRAPHIQUES */}
            <div className="lg:col-span-2">
                <AnalyticsCharts 
                    distribution={data.distribution}
                    timelineLabels={data.timelineLabels}
                    timelineData={data.timelineData}
                />
            </div>
        </div>

        {/* --- ZONE D'ACTIONS --- */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">🚀 Actions de Croissance</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* ✅ CARTE MASSE (RESTAURÉE) */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg cursor-pointer transition hover:-translate-y-1">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-3xl bg-white/20 p-2 rounded-lg">📢</span>
                    <span className="bg-orange-400 text-white text-[10px] font-bold px-2 py-1 rounded uppercase">Populaire</span>
                </div>
                <h3 className="font-bold text-lg mb-1">Campagne de Masse</h3>
                <p className="text-blue-100 text-sm mb-4">Envoyez 50 SMS d'un coup pour noyer les avis négatifs.</p>
                <Link href="/dashboard/campaigns" className="block w-full text-center bg-white text-blue-600 font-bold py-3 rounded-lg hover:bg-blue-50 transition">
                    Lancer une campagne →
                </Link>
            </div>

            {/* Carte QR Code */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <div className="text-3xl mb-4 bg-purple-50 w-fit p-2 rounded-lg">🔳</div>
                <h3 className="font-bold text-lg mb-1 dark:text-white">QR Code Comptoir</h3>
                <p className="text-gray-500 text-sm mb-4">Affiche à scanner pour vos clients sur place.</p>
                <button className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white font-bold py-3 rounded-lg">Télécharger PDF</button>
            </div>

             {/* Carte SMS Unitaire */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <div className="text-3xl mb-4 bg-green-50 w-fit p-2 rounded-lg">📱</div>
                <h3 className="font-bold text-lg mb-1 dark:text-white">SMS Unitaire</h3>
                <p className="text-gray-500 text-sm mb-4">Envoi rapide à un seul client.</p>
                <button className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white font-bold py-3 rounded-lg">Envoi Rapide</button>
            </div>
        </div>
      </div>
    </div>
  );
}
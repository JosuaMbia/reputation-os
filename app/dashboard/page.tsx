import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getDashboardData } from "@/app/actions/get-dashboard-data";
import { AnalyticsCharts } from "@/components/analytics-chart";
import { Settings } from "lucide-react"; // Pour l'icône

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const data = await getDashboardData();
  if (!data) return <div className="p-10 text-center text-gray-500">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* --- EN-TÊTE --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {data.name} 
              <span className="text-sm font-normal text-gray-500">({data.totalReviews} avis)</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* ✅ BOUTON AVIS (Renommé) */}
            <Link 
              href="/dashboard/reviews" 
              className="px-4 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-sm hover:bg-indigo-100 transition border border-indigo-100"
            >
              ⭐ Gérer mes avis
            </Link>

            {/* ✅ BOUTON RÉGLAGES (Restauré) */}
            <Link 
              href="/dashboard/settings" 
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
              title="Réglages"
            >
              <Settings className="w-5 h-5" />
            </Link>
            
            <div className="pl-3 border-l border-gray-200">
                <UserButton afterSignOutUrl="/"/>
            </div>
          </div>
        </div>

        {/* ... (Le reste du code des graphiques et actions reste identique à avant) ... */}
        {/* Copiez ici le reste du fichier précédent (AnalyticsCharts, Actions de croissance, etc.) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-center items-center text-center">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Santé Globale</h3>
              <div className="text-6xl font-black text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                {data.ratingDisplay} <span className="text-yellow-400 text-4xl">★</span>
              </div>
              <div className={`px-4 py-1 rounded-full text-xs font-bold border ${data.rating < 4 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                {data.rating < 4 ? "⚠️ ACTION REQUISE" : "✅ EXCELLENT"}
              </div>
            </div>
            <div className="lg:col-span-2">
                <AnalyticsCharts distribution={data.distribution} timelineLabels={data.timelineLabels} timelineData={data.timelineData} />
            </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">🚀 Actions de Croissance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg cursor-pointer transition hover:-translate-y-1">
                <h3 className="font-bold text-lg mb-1">📢 Campagne de Masse</h3>
                <p className="text-blue-100 text-sm mb-4">Envoyez 50 SMS pour noyer les avis négatifs.</p>
                <Link href="/dashboard/campaigns" className="block w-full text-center bg-white text-blue-600 font-bold py-3 rounded-lg hover:bg-blue-50">Lancer</Link>
            </div>
             <div className="bg-white dark:bg-gray-800 border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-lg mb-1">🔳 QR Code</h3>
                <p className="text-gray-500 text-sm mb-4">Affiche pour le comptoir.</p>
                <button className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-lg">Télécharger</button>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-lg mb-1">📱 SMS Unitaire</h3>
                <p className="text-gray-500 text-sm mb-4">Envoi rapide unique.</p>
                <button className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-lg">Envoyer</button>
            </div>
        </div>

      </div>
    </div>
  );
}
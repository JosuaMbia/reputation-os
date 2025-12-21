import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getDashboardData } from "@/app/actions/get-dashboard-data";
import { AnalyticsCharts } from "@/components/analytics-chart";
import { QrCodeCard, SmsCard } from "@/components/dashboard-actions";
import { SwotAnalysis } from "@/components/swot-analysis"; // ✅ On garde l'import
import { Settings, Info } from "lucide-react";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const data = await getDashboardData();
  if (!data) return <div className="p-10 text-center">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {data.name} <span className="text-sm font-normal text-gray-500">({data.totalReviews} avis)</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/reviews" className="px-4 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-sm border border-indigo-100 hover:bg-indigo-100 transition">
              ⭐ Gérer mes avis
            </Link>
            <Link href="/dashboard/settings" className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"><Settings className="w-5 h-5" /></Link>
            <div className="pl-3 border-l"><UserButton afterSignOutUrl="/"/></div>
          </div>
        </div>

        {/* --- ZONE 1 : ANALYSE & SANTÉ --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* KPI Note + DIAGNOSTIC */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-center">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 text-center">Santé Globale</h3>
              <div className="text-6xl font-black text-gray-900 dark:text-white flex justify-center items-center gap-2 mb-4">
                {data.ratingDisplay} <span className="text-yellow-400 text-4xl">★</span>
              </div>
              
              <div className={`mx-auto px-4 py-1 rounded-full text-xs font-bold border mb-4 ${data.rating < 4 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                {data.rating < 4 ? "⚠️ ACTION REQUISE" : "✅ EXCELLENT"}
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm">
                  <p className="font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                    <Info className="w-4 h-4"/> Diagnostic :
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">{data.diagnostic}</p>
                  
                  <p className="font-bold text-indigo-600 mb-1">💡 Conseil :</p>
                  <p className="text-gray-600 dark:text-gray-400">{data.advice}</p>
              </div>
            </div>

            {/* GRAPHIQUES */}
            <div className="lg:col-span-2">
                <AnalyticsCharts distribution={data.distribution} timelineLabels={data.timelineLabels} timelineData={data.timelineData} />
            </div>
        </div>

        {/* --- ZONE 2 : SWOT INTERACTIF (Le seul, l'unique !) --- */}
        {/* J'ai supprimé l'ancien bloc HTML statique ici */}
        <SwotAnalysis 
            strengths={data.strengths} 
            weaknesses={data.weaknesses} 
        />

        {/* --- ZONE 3 : ACTIONS --- */}
        <h2 className="text-xl font-bold text-gray-900 mt-8">🚀 Actions de Croissance</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* CARTE STUDIO MARKETING (Nouveau) */}
            <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl p-6 text-white shadow-lg cursor-pointer transition hover:-translate-y-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-3xl bg-white/20 p-2 rounded-lg">🎨</span>
                    <span className="bg-white text-pink-600 text-[10px] font-bold px-2 py-1 rounded uppercase">Nouveau</span>
                </div>
                <h3 className="font-bold text-lg mb-1">Studio Marketing IA</h3>
                <p className="text-pink-100 text-sm mb-6 flex-1">
                    Transformez vos avis 5 étoiles en posts Instagram prêts à publier.
                </p>
                <Link href="/dashboard/marketing" className="block w-full text-center bg-white text-pink-600 font-bold py-3 rounded-lg hover:bg-pink-50 transition shadow-sm">
                    Créer des posts →
                </Link>
            </div>

            {/* CARTE MASSIVE (Désactivée ou Lien vers campagnes) */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg cursor-pointer transition hover:-translate-y-1 flex flex-col">
                 <div className="flex justify-between items-start mb-4">
                    <span className="text-3xl bg-white/20 p-2 rounded-lg">📢</span>
                    <span className="bg-orange-400 text-white text-[10px] font-bold px-2 py-1 rounded uppercase">Recommandé</span>
                </div>
                <h3 className="font-bold text-lg mb-1">Campagne de Masse</h3>
                <p className="text-blue-100 text-sm mb-6 flex-1">
                    Envoyez 50 SMS d'un coup pour noyer les avis négatifs.
                </p>
                <Link href="/dashboard/campaigns" className="block w-full text-center bg-white text-blue-600 font-bold py-3 rounded-lg hover:bg-blue-50 transition">
                    Lancer une campagne →
                </Link>
            </div>

            {/* CARTE QR CODE (Actif) */}
            <QrCodeCard googleUrl={data.googleUrl} />

        </div>
      </div>
    </div>
  );
}
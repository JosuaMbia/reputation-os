import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs"; // ✅ Import crucial pour la déconnexion
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  // 1. Récupération des données
  const business = await prisma.business.findFirst({
    where: { userId },
    include: { reviews: true },
  });

  if (!business) return <div className="p-8">Chargement du profil...</div>;

  // 2. Calcul des Stats Réelles
  const totalReviews = business.reviews.length;
  const averageRating = totalReviews > 0
    ? (business.reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews).toFixed(1)
    : "0.0";
  const pendingReviews = business.reviews.filter(r => !r.response).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* --- EN-TÊTE (Avec Bouton Déconnexion) --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {business.name || "Mon Établissement"}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Tableau de bord de réputation
            </p>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Bouton pour importer */}
             <Link 
              href="/dashboard/reviews" 
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition shadow-md flex items-center gap-2"
            >
              📥 Importer Avis
            </Link>
            
            {/* Bouton Réglages */}
            <Link 
              href="/dashboard/settings" 
              className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
            >
              ⚙️ Réglages
            </Link>

            {/* ✅ BOUTON DE DÉCONNEXION CLERK */}
            <div className="pl-4 border-l border-gray-200">
                <UserButton afterSignOutUrl="/"/>
            </div>
          </div>
        </div>

        {/* --- SECTION 1 : LES STATISTIQUES (KPIs) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Note Google</h3>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-4xl font-black text-gray-900 dark:text-white">{averageRating}</span>
                <span className="text-yellow-400 text-2xl">★</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Avis</h3>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-4xl font-black text-gray-900 dark:text-white">{totalReviews}</span>
                <span className="text-gray-500 text-sm">avis synchronisés</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-xl shadow-md text-white">
              <h3 className="text-xs font-bold text-indigo-100 uppercase tracking-wider">À traiter</h3>
              <div className="mt-2 flex justify-between items-end">
                <span className="text-4xl font-black">{pendingReviews}</span>
                <Link href="/dashboard/reviews" className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm font-medium transition">
                  Répondre →
                </Link>
              </div>
            </div>
        </div>

        {/* --- SECTION 2 : VOS OUTILS DIFFERENCIANTS (Restaurés) --- */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 flex items-center gap-2">
            📢 Booster ma réputation
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* CARTE A : ENVOI SMS */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
             <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <span className="bg-blue-100 text-blue-600 p-2 rounded-lg text-xl">📱</span>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Demande par SMS</h3>
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Coût: 1 crédit</span>
             </div>

             <form className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prénom du client</label>
                    <input type="text" placeholder="Ex: Julie" className="w-full p-3 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Numéro de mobile</label>
                    <input type="tel" placeholder="+33 6..." className="w-full p-3 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600" />
                </div>
                <button type="button" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition flex justify-center gap-2">
                    <span>📨</span> Envoyer l'invitation
                </button>
             </form>
          </div>

          {/* CARTE B : QR CODE */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col items-center text-center">
             <div className="flex items-center gap-3 mb-6 w-full justify-start">
                    <span className="bg-purple-100 text-purple-600 p-2 rounded-lg text-xl">🔳</span>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">QR Code Comptoir</h3>
             </div>
             
             <p className="text-sm text-gray-500 mb-6">
                Faites scanner ce code pour obtenir un avis immédiat.
             </p>

             {/* Génération dynamique du QR Code via une API simple */}
             <div className="bg-white p-4 rounded-xl border-2 border-gray-900 mb-6">
                <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${business.googleUrl || "https://google.com"}`} 
                    alt="QR Code Avis" 
                    className="w-40 h-40 object-contain"
                />
             </div>

             <div className="flex gap-3 w-full">
                <button className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-sm transition">
                    🖨️ Imprimer
                </button>
                <button className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-sm transition">
                    ⬇️ Télécharger
                </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ReviewCard } from "@/components/review-card"; // ✅ Le composant intelligent
import { seedFakeReviews } from "@/app/actions/save-reply"; // ✅ L'action de simulation
import Link from "next/link";

export default async function ReviewsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  // On récupère le business ET ses avis triés par date
  const business = await prisma.business.findFirst({
    where: { userId },
    include: { 
        reviews: { 
            orderBy: { reviewDate: 'desc' } 
        } 
    }
  });

  if (!business) {
    return (
      <div className="min-h-screen p-8 text-center flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Aucun établissement connecté</h1>
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          Retour au dashboard pour synchroniser
        </Link>
      </div>
    );
  }

  const reviews = business.reviews || [];

  // Fonction serveur locale pour le bouton de test
  async function seed() {
    'use server'
    await seedFakeReviews();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* En-tête */}
        <div className="flex justify-between items-center mb-8">
          <div>
             <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Avis</h1>
             <p className="text-gray-500 dark:text-gray-400 mt-1">
                Pilotez votre e-réputation et répondez avec l'IA.
             </p>
          </div>
          <Link href="/dashboard" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 transition">
            ← Retour Dashboard
          </Link>
        </div>

        {/* CAS 1 : Aucun avis (Zone de Simulation) */}
        {reviews.length === 0 && (
            <div className="bg-white dark:bg-gray-800 p-10 rounded-xl shadow-sm border border-dashed border-gray-300 dark:border-gray-700 text-center">
                <div className="text-4xl mb-4">🧪</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Zone de Test Technique</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    En attendant la validation de votre quota Google API, nous ne pouvons pas récupérer vos vrais avis.
                    <br/><br/>
                    Générez 3 faux avis pour tester l'interface et la puissance de l'IA immédiatement.
                </p>
                <form action={seed}>
                    <button 
                        type="submit" 
                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-bold transition shadow-lg hover:scale-105 flex items-center gap-2 mx-auto"
                    >
                        <span>⚡</span> Générer 3 Avis de Test
                    </button>
                </form>
            </div>
        )}

        {/* CAS 2 : Liste des avis avec ReviewCard */}
        <div className="space-y-6">
            {reviews.map((review) => (
                <ReviewCard 
                    key={review.id} 
                    review={{
                        ...review, 
                        businessId: business.id // Important pour l'IA
                    }} 
                />
            ))}
        </div>

      </div>
    </div>
  );
}
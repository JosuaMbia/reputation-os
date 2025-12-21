import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ReviewsImporter } from "@/components/reviews-importer";
import { ReviewCard } from "@/components/review-card";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs"; // ✅ Import du Fil d'Ariane

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

    // Si pas de business, on redirige ou on affiche une erreur
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

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                
                {/* ✅ 1. FIL D'ARIANE (Navigation fluide) */}
                <div className="mb-6">
                    <Breadcrumbs />
                </div>

                {/* En-tête */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                           💬 Gestion des Avis
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Centralisez vos avis Google & Trustpilot et répondez avec l'IA.
                        </p>
                    </div>
                    {/* Le bouton retour manuel est devenu optionnel grâce au fil d'ariane, mais on peut le garder ou l'enlever */}
                </div>

                {/* --- ZONE D'IMPORT --- */}
                <div className="mb-10 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                        Ajouter une source
                    </h3>
                    <ReviewsImporter />
                </div>

                {/* --- LISTE DES AVIS --- */}
                <div className="space-y-6">
                    {reviews.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 p-12 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-center">
                            <div className="text-4xl mb-4">👇</div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">C'est un peu vide ici...</h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                Commencez par importer vos avis en collant l'URL de votre fiche Google ou Trustpilot dans le champ ci-dessus.
                            </p>
                        </div>
                    ) : (
                        reviews.map((review) => (
                            <ReviewCard 
                                key={review.id} 
                                review={{
                                    ...review, 
                                    businessId: business.id
                                }} 
                            />
                        ))
                    )}
                </div>

            </div>
        </div>
    );
}
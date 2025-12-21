import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ReviewsImporter } from "@/components/reviews-importer";
import { ReviewCard } from "@/components/review-card";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs"; 

// ✅ CHANGEMENT : On définit le type comme une Promise (Spécifique Next.js 15/16)
interface ReviewsPageProps {
    searchParams: Promise<{ rating?: string }>;
}

export default async function ReviewsPage(props: ReviewsPageProps) {
    const { userId } = await auth();
    if (!userId) redirect("/");

    // ✅ CORRECTION CRITIQUE : On attend (await) que les paramètres soient disponibles
    const searchParams = await props.searchParams;
    const ratingFilter = searchParams.rating ? parseInt(searchParams.rating) : undefined;

    // 2. On récupère le business avec les avis FILTRÉS
    const business = await prisma.business.findFirst({
        where: { userId },
        include: { 
            reviews: { 
                // Si un filtre existe, on l'applique strictement
                where: ratingFilter ? { rating: ratingFilter } : undefined,
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

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                
                {/* FIL D'ARIANE */}
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
                </div>

                {/* ZONE D'IMPORT */}
                <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                        Ajouter une source
                    </h3>
                    <ReviewsImporter />
                </div>

                {/* ✅ INDICATEUR DE FILTRE ACTIF */}
                {ratingFilter && (
                    <div className="mb-6 animate-in slide-in-from-top-2">
                        <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200 px-4 py-3 rounded-lg flex items-center justify-between shadow-sm">
                            <span className="flex items-center gap-2">
                                <span className="text-xl">🔍</span>
                                <span>
                                    Filtre activé : Vous ne voyez que les avis <b>{ratingFilter} étoiles</b>.
                                </span>
                            </span>
                            <Link 
                                href="/dashboard/reviews" 
                                className="px-3 py-1 bg-white dark:bg-indigo-800 rounded-md text-sm font-bold shadow-sm hover:shadow transition"
                            >
                                ✕ Effacer le filtre
                            </Link>
                        </div>
                    </div>
                )}

                {/* LISTE DES AVIS */}
                <div className="space-y-6">
                    {reviews.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 p-12 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-center">
                            <div className="text-4xl mb-4">
                                {ratingFilter ? "∅" : "👇"}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                {ratingFilter ? "Aucun avis trouvé" : "C'est un peu vide ici..."}
                            </h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                {ratingFilter 
                                    ? `Aucun avis ne correspond à la note de ${ratingFilter}/5.` 
                                    : "Commencez par importer vos avis en collant l'URL de votre fiche Google ou Trustpilot dans le champ ci-dessus."
                                }
                            </p>
                            {ratingFilter && (
                                <Link href="/dashboard/reviews" className="mt-4 inline-block text-indigo-600 font-bold hover:underline">
                                    Voir tous les avis
                                </Link>
                            )}
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
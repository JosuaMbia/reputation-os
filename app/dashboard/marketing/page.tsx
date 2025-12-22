import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PostGenerator } from "@/components/post-generator";
import { PostCard } from "@/components/post-card";
import Link from "next/link";
import { CreatePostButton } from "@/components/marketing-client"; // ✅ Le bouton pour la création libre

export default async function MarketingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  // Récupérer le business avec :
  // 1. Les 3 meilleurs avis récents (pour les suggestions)
  // 2. L'historique des posts (pour la galerie)
  const business = await prisma.business.findFirst({
    where: { userId },
    include: { 
        // Pour la zone "Idées du jour"
        reviews: { 
            where: { rating: 5 },
            take: 3,
            orderBy: { reviewDate: 'desc' }
        },
        // Pour la zone "Vos Brouillons & Publications"
        SocialPost: {
            orderBy: { updatedAt: 'desc' }, // ✅ Tri par date de mise à jour (plus pratique)
            include: { 
                review: true,   // Pour afficher le contexte de l'avis si lié
                business: true  // Pour que le PostCard ait accès au type de business (Garage, etc.)
            }
        }
    }
  });

  if (!business) return <div>Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <Breadcrumbs />

        {/* HEADER AVEC BOUTON D'ACTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    🚀 Studio Marketing IA
                </h1>
                <p className="text-gray-500 mt-1">
                    Transformez vos avis en posts ou générez du contenu à la volée.
                </p>
            </div>
            
            {/* ✅ LE BOUTON DE CRÉATION LIBRE (Nouveau) */}
            <CreatePostButton />
        </div>

        {/* --- ZONE 1 : SUGGESTIONS (Review to Post) --- */}
        {/* On n'affiche cette zone que s'il y a des avis 5 étoiles disponibles */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                ✨ Idées du jour (Basées sur vos avis 5★)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {business.reviews.length > 0 ? (
                    business.reviews.map(review => (
                        <PostGenerator key={review.id} review={review} />
                    ))
                ) : (
                    <div className="col-span-3 text-center py-8 bg-white/10 rounded-lg">
                        <p className="mb-2">Pas encore d'avis 5 étoiles récents à transformer.</p>
                        <Link href="/dashboard/reviews" className="underline font-bold hover:text-indigo-200">
                            Importer des avis d'abord
                        </Link>
                    </div>
                )}
            </div>
        </div>

        {/* --- ZONE 2 : GALERIE (Brouillons & Publiés) --- */}
        <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">📅 Vos Brouillons & Publications</h2>
            
            {business.SocialPost.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {business.SocialPost.map(post => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <div className="text-4xl mb-4">🎨</div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Votre galerie est vide</h3>
                    <p className="text-gray-500 mt-2">
                        Utilisez le bouton <strong>"Nouveau Post IA"</strong> ou transformez un avis ci-dessus.
                    </p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
}
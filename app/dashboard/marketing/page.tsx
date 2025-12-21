import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PostGenerator } from "@/components/post-generator"; // On va le créer juste après
import { PostCard } from "@/components/post-card"; // On va le créer aussi

export default async function MarketingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const business = await prisma.business.findFirst({
    where: { userId },
    include: { 
        // On récupère les avis 5 étoiles pour générer des idées
        reviews: { 
            where: { rating: 5 },
            take: 3,
            orderBy: { reviewDate: 'desc' }
        },
        // On récupère les posts existants
        SocialPost: {
            orderBy: { createdAt: 'desc' }
        }
    }
  });

  if (!business) return <div>Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <Breadcrumbs />

        <div className="flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🚀 Studio Marketing</h1>
                <p className="text-gray-500 mt-1">Transformez vos meilleurs avis en posts Instagram & Facebook.</p>
            </div>
        </div>

        {/* SECTION 1 : GÉNÉRATEUR (IDÉES) */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                ✨ Idées du jour (Basées sur vos avis 5★)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {business.reviews.map(review => (
                    <PostGenerator key={review.id} review={review} />
                ))}
                {business.reviews.length === 0 && (
                    <p className="text-indigo-100 italic">Pas encore assez d'avis 5 étoiles pour générer des idées.</p>
                )}
            </div>
        </div>

        {/* SECTION 2 : CALENDRIER EDITORIAL */}
        <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📅 Vos Campagnes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {business.SocialPost.length > 0 ? (
                    business.SocialPost.map(post => (
                        <PostCard key={post.id} post={post} />
                    ))
                ) : (
                    <div className="col-span-3 text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500">Aucun post créé. Cliquez sur "Générer" ci-dessus pour commencer !</p>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}
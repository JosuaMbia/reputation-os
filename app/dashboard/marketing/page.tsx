import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PostGenerator } from "@/components/post-generator";
import { PostCard } from "@/components/post-card";
import Link from "next/link";
import { CreatePostButton } from "@/components/marketing-client";
import { MarketingStats } from "@/components/marketing-stats"; 

// Interface pour Next.js 15+ (Params as Promise)
interface MarketingPageProps {
    searchParams: Promise<{ tab?: string }>;
}

export default async function MarketingPage(props: MarketingPageProps) {
  // Résolution asynchrone des paramètres (Standard V1 Next.js 15)
  const searchParams = await props.searchParams;
  const tab = searchParams.tab || "create"; 

  const { userId } = await auth();
  if (!userId) redirect("/");

  // Récupération optimisée des données
  const business = await prisma.business.findFirst({
    where: { userId },
    include: { 
        // 3 derniers avis 5★ pour les suggestions
        reviews: { 
            where: { rating: 5 },
            take: 3,
            orderBy: { reviewDate: 'desc' }
        },
        // Historique des posts (Du plus récent au plus ancien)
        SocialPost: {
            orderBy: { updatedAt: 'desc' },
            include: { 
                review: true,
                business: true 
            }
        }
    }
  });

  if (!business) return <div>Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <Breadcrumbs />

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    🚀 Studio Marketing IA
                </h1>
                <p className="text-gray-500 mt-1">
                    Pilotez votre stratégie Social Media : Création, Publication et Analyse.
                </p>
            </div>
            
            {/* Bouton d'action (Uniquement sur l'onglet création) */}
            {tab === 'create' && <CreatePostButton />}
        </div>

        {/* NAVIGATION ONGLETS */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
            <Link 
                href="/dashboard/marketing?tab=create" 
                className={`px-6 py-3 text-sm font-bold border-b-2 transition ${tab === 'create' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                🎨 Création & Brouillons
            </Link>
            <Link 
                href="/dashboard/marketing?tab=stats" 
                className={`px-6 py-3 text-sm font-bold border-b-2 transition ${tab === 'stats' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                📊 Performances
            </Link>
        </div>

        {/* CONTENU */}
        {tab === 'create' ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                
                {/* SECTION 1 : SUGGESTIONS INTELLIGENTES */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        ✨ Suggestions IA (Basées sur vos avis 5★)
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {business.reviews.length > 0 ? (
                            business.reviews.map(review => (
                                <PostGenerator key={review.id} review={review} />
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-8 bg-white/10 rounded-lg backdrop-blur-sm">
                                <p className="mb-2 text-indigo-100">Aucun avis 5 étoiles récent à transformer.</p>
                                <Link href="/dashboard/reviews" className="underline font-bold hover:text-white transition">
                                    Importer des avis Google
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* SECTION 2 : GALERIE DE POSTS */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">📅 Vos Contenus</h2>
                    
                    {business.SocialPost.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {business.SocialPost.map(post => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                            <div className="text-4xl mb-4 opacity-50">🎨</div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Aucun post pour le moment</h3>
                            <p className="text-gray-500 mt-2 max-w-md mx-auto">
                                Commencez par cliquer sur <strong>"Nouveau Post IA"</strong> ou transformez un avis client en visuel.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        ) : (
            // SECTION STATISTIQUES
            <MarketingStats />
        )}

      </div>
    </div>
  );
}
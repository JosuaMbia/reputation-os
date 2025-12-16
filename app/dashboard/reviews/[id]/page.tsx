import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ReviewDetailPage({ params }: { params: { id: string } }) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  // Récupérer l'avis spécifique
  const review = await prisma.review.findUnique({
    where: { id: params.id },
    include: { business: true },
  });

  // Sécurité : Vérifier que l'avis existe
  if (!review) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Avis non trouvé</h1>
          <Link href="/dashboard/reviews" className="text-blue-600 hover:underline mt-4 block">
            ← Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation retour */}
        <Link href="/dashboard/reviews" className="text-sm text-blue-600 hover:underline mb-6 flex items-center gap-2">
          <span>←</span> Retour aux avis
        </Link>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          
          {/* En-tête de l'avis */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {review.authorName}
              </h1>
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-400 text-xl">
                  {'★'.repeat(review.rating)}
                  <span className="text-gray-300">{'★'.repeat(5 - review.rating)}</span>
                </div>
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  • {new Date(review.reviewDate).toLocaleDateString('fr-FR', { dateStyle: 'long' })}
                </span>
              </div>
            </div>
            
            {/* Badge de statut */}
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              review.isReplied 
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
            }`}>
              {review.isReplied ? "Répondu ✅" : "En attente ⏳"}
            </span>
          </div>

          {/* Contenu de l'avis */}
          <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg mb-8 italic text-gray-700 dark:text-gray-300 border-l-4 border-gray-300 dark:border-gray-600">
            "{review.content}"
          </div>

          <hr className="border-gray-100 dark:border-gray-700 my-8" />

          {/* Zone de Réponse */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>✍️</span> Votre Réponse
            </h2>

            {review.response ? (
              // Si déjà répondu, on affiche la réponse
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-100 dark:border-blue-800">
                <p className="text-gray-800 dark:text-blue-100 whitespace-pre-wrap">
                  {review.response}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-4 font-medium">
                  Répondu le {review.repliedAt ? new Date(review.repliedAt).toLocaleDateString() : "Date inconnue"}
                </p>
              </div>
            ) : (
              // Sinon, formulaire pour générer/envoyer
              <div className="space-y-4">
                <form action="/api/ai/generate-response" method="POST">
                  <input type="hidden" name="reviewId" value={review.id} />
                  
                  {/* Bouton IA - Version Corrigée */}
                  <button 
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <span>✨</span> Générer une réponse avec l'IA
                  </button>
                </form>

                <p className="text-xs text-gray-500 text-center mt-2">
                  L'IA analysera le ton et le contenu de l'avis pour proposer une réponse adaptée.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
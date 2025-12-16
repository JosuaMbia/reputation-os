import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ReviewDetailPage({ params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const review = await prisma.review.findUnique({
    where: { id: params.id },
    include: { business: true }
  });

  if (!review) {
    return <div className="p-8">Avis non trouvé</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard/reviews" className="text-blue-600 hover:underline mb-4 block">
          ← Retour aux avis
        </Link>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">{review.authorName}</h2>
          <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <span key={i}>{i < review.rating ? '⭐' : '☆'}</span>
            ))}
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{review.content}</p>
          <p className="text-sm text-gray-500">
            {new Date(review.createdAt).toLocaleDateString('fr-FR')}
          </p>
          
          {review.response ? (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Votre réponse:</h3>
              <p className="text-gray-700 dark:text-gray-300 mt-2">{review.response}</p>
            </div>
          ) : (
            <form action="/api/ai/generate-response" method="POST" className="mt-6">
              <input type="hidden" name="reviewId" value={review.id} />
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90"
              >
                🤖 Générer une réponse avec IA
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

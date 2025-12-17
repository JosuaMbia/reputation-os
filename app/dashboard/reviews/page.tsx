import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUserWithBusiness } from "@/lib/auth-sync";
import Link from "next/link";

export default async function ReviewsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const data = await getCurrentUserWithBusiness(userId);
  const business = data?.user?.businesses?.[0];

  if (!business) {
    return (
      <div className="min-h-screen p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Aucun établissement connecté</h1>
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          Retour au dashboard pour synchroniser
        </Link>
      </div>
    );
  }

  const reviews = await prisma.review.findMany({
    where: { businessId: business.id },
    orderBy: { reviewDate: 'desc' },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Vos Avis</h1>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">
            ← Retour
          </Link>
        </div>

        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
              Aucun avis trouvé pour le moment.
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg dark:text-white">{review.authorName}</h3>
                    <div className="flex text-yellow-400">
                      {'★'.repeat(review.rating)}
                      <span className="text-gray-300">{'★'.repeat(5 - review.rating)}</span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.reviewDate).toLocaleDateString()}
                  </span>
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 mb-4">{review.content}</p>
                
                {review.isReplied ? (
                  <div className="bg-green-50 text-green-700 px-3 py-2 rounded text-sm inline-block">
                    ✅ Répondu
                  </div>
                ) : (
                  <Link 
                    href={`/dashboard/reviews/${review.id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition inline-block"
                  >
                    Répondre avec l'IA
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
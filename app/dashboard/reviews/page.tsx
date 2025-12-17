import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";

import { currentUser } from "@clerk/nextjs/server";
    const user = await currentUser();
  
    if (!user) {
    redirect("/sign-in");
  }

  // Récupérer les avis de l'établissement de l'utilisateur
  const business = await prisma.business.findUnique({
        where: { userId: user.id },
    include: {
      reviews: {
        orderBy: { reviewDate: "desc" },
        take: 50
      }
    }
  });

  if (!business) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Gestion des avis</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Veuillez d'abord synchroniser votre établissement Google depuis le dashboard.
        </p>
        <Link 
          href="/dashboard" 
          className="mt-4 inline-block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Retour au dashboard
        </Link>
      </div>
    );
  }

  const reviews = business.reviews || [];
  const stats = {
    total: reviews.length,
    notReplied: reviews.filter(r => !r.isReplied).length,
    positive: reviews.filter(r => r.sentiment === "positive").length,
    negative: reviews.filter(r => r.sentiment === "negative").length,
    neutral: reviews.filter(r => r.sentiment === "neutral").length
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Gestion des avis
        </h1>
        <Link
          href="/dashboard"
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        >
          ← Retour
        </Link>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Sans réponse</p>
          <p className="text-2xl font-bold text-orange-600">{stats.notReplied}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Positifs</p>
          <p className="text-2xl font-bold text-green-600">{stats.positive}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Négatifs</p>
          <p className="text-2xl font-bold text-red-600">{stats.negative}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Neutres</p>
          <p className="text-2xl font-bold text-gray-600">{stats.neutral}</p>
        </div>
      </div>

      {/* Liste des avis */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Aucun avis trouvé. Les avis seront synchronisés automatiquement.
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-500 transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {review.authorName}
                    </p>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={i < review.rating ? "text-yellow-400" : "text-gray-300"}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {new Date(review.reviewDate).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      review.sentiment === "positive"
                        ? "bg-green-100 text-green-700"
                        : review.sentiment === "negative"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {review.sentiment === "positive"
                      ? "Positif"
                      : review.sentiment === "negative"
                      ? "Négatif"
                      : "Neutre"}
                  </span>
                  {review.isReplied && (
                    <span className="px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                      Répondu
                    </span>
                  )}
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {review.content}
              </p>

              {review.response && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Votre réponse:
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {review.response}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Répondu le {new Date(review.repliedAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              )}

              <Link
                href={`/dashboard/reviews/${review.id}`}
                className="inline-block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
              >
                {review.isReplied ? "Voir les détails" : "Répondre avec IA"}
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
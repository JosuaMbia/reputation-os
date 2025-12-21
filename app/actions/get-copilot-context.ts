'use server'

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getCopilotContext() {
  const { userId } = await auth();
  if (!userId) return null;

  const business = await prisma.business.findFirst({
    where: { userId },
    include: { 
      reviews: {
        orderBy: { date: 'desc' },
        take: 5 // On prend les 5 derniers avis pour l'analyse
      }
    }
  });

  if (!business) return null;

  // Calculs en temps réel
  const totalReviews = business.reviews.length;
  const averageRating = totalReviews > 0
    ? (business.reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews)
    : 0;

  return {
    name: business.name,
    rating: averageRating.toFixed(1), // La vraie note (ex: 3.7)
    reviewCount: totalReviews,
    recentReviews: business.reviews,
    // Une petite logique pour déterminer l'état de santé
    healthStatus: averageRating >= 4.5 ? "excellent" : averageRating >= 4.0 ? "good" : averageRating >= 3.5 ? "average" : "critical"
  };
}
'use server'

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getDashboardData() {
  const { userId } = await auth();
  if (!userId) return null;

  const business = await prisma.business.findFirst({
    where: { userId },
    include: { reviews: { orderBy: { reviewDate: 'desc' } } }
  });

  if (!business) return null;

  const reviews = business.reviews;
  const totalReviews = reviews.length;
  
  // 1. Calculs Note
  const averageRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews)
    : 0;

  // 2. Distribution
  const distribution = [0, 0, 0, 0, 0];
  reviews.forEach(r => {
    const star = Math.round(r.rating);
    if (star >= 1 && star <= 5) distribution[star - 1]++;
  });

  // 3. Timeline
  const timelineLabels: string[] = [];
  const timelineData: number[] = [];
  for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      timelineLabels.push(d.toLocaleDateString('fr-FR', { month: 'short' }));
      
      const count = reviews.filter(r => {
          const rDate = new Date(r.reviewDate); 
          return rDate.getMonth() === d.getMonth() && rDate.getFullYear() === d.getFullYear();
      }).length;
      timelineData.push(count);
  }

  // 4. 🚨 ANALYSE INTELLIGENTE (Le Diagnostic)
  let diagnostic = "Tout semble calme.";
  let advice = "Continuez à solliciter vos clients.";

  if (totalReviews === 0) {
      diagnostic = "Manque de données.";
      advice = "Importez vos avis ou commencez une campagne SMS.";
  } else if (averageRating < 4.0) {
      // Analyse des points faibles
      const badReviews = reviews.filter(r => r.rating <= 3);
      const recentBad = badReviews.slice(0, 3);
      
      diagnostic = `Trop d'avis négatifs récents (${badReviews.length} avis ≤ 3★).`;
      advice = "Il faut 'noyer' ces avis. Lancez une campagne SMS massive pour obtenir 10 avis 5★ rapidement.";
  } else if (totalReviews < 10) {
      diagnostic = "Volume d'avis trop faible pour le SEO local.";
      advice = "Visez les 20 avis pour dépasser vos concurrents locaux.";
  } else {
      diagnostic = "Excellente réputation !";
      advice = "Profitez de cette note pour augmenter vos prix ou votre visibilité.";
  }

  return {
    name: business.name,
    googleUrl: business.googleUrl, // Important pour le QR Code
    rating: averageRating, 
    ratingDisplay: averageRating.toFixed(1),
    totalReviews,
    distribution, 
    timelineLabels,
    timelineData,
    diagnostic, // ✅ NOUVEAU
    advice      // ✅ NOUVEAU
  };
}
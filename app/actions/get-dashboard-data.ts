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
  
  // 1. Calculs Note & Distribution (Inchangé)
  const averageRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews)
    : 0;

  const distribution = [0, 0, 0, 0, 0];
  reviews.forEach(r => {
    const star = Math.round(r.rating);
    if (star >= 1 && star <= 5) distribution[star - 1]++;
  });

  // --- 2. CALCULS TEMPORELS DYNAMIQUES (NOUVEAU) ---
  
  // A. Par MOIS (Défaut - 6 derniers mois)
  const monthlyData = { labels: [] as string[], data: [] as number[] };
  for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleDateString('fr-FR', { month: 'short' });
      monthlyData.labels.push(key);
      const count = reviews.filter(r => {
          const rDate = new Date(r.reviewDate); 
          return rDate.getMonth() === d.getMonth() && rDate.getFullYear() === d.getFullYear();
      }).length;
      monthlyData.data.push(count);
  }

  // B. Par JOUR (7 derniers jours)
  const dailyData = { labels: [] as string[], data: [] as number[] };
  for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }); // Ex: Lun 12
      dailyData.labels.push(key);
      const count = reviews.filter(r => {
          const rDate = new Date(r.reviewDate);
          return rDate.getDate() === d.getDate() && rDate.getMonth() === d.getMonth();
      }).length;
      dailyData.data.push(count);
  }

  // C. Par ANNÉE (Vue globale)
  // On prend juste l'année en cours et la précédente pour faire simple
  const yearlyData = { labels: [] as string[], data: [] as number[] };
  for (let i = 1; i >= 0; i--) {
      const d = new Date();
      d.setFullYear(d.getFullYear() - i);
      const key = d.getFullYear().toString();
      yearlyData.labels.push(key);
      const count = reviews.filter(r => new Date(r.reviewDate).getFullYear() === d.getFullYear()).length;
      yearlyData.data.push(count);
  }

  // 3. DIAGNOSTIC & SWOT (Inchangé)
  let diagnostic = "Tout semble calme.";
  let advice = "Continuez à solliciter vos clients.";

  if (totalReviews === 0) {
      diagnostic = "Manque de données.";
      advice = "Importez vos avis ou commencez une campagne SMS.";
  } else if (averageRating < 4.0) {
      const badReviews = reviews.filter(r => r.rating <= 3);
      diagnostic = `Trop d'avis mitigés (${badReviews.length} avis ≤ 3★).`;
      advice = "Votre priorité absolue : obtenir 5 nouveaux avis 5★ cette semaine.";
  } else if (totalReviews < 10) {
      diagnostic = "Volume d'avis faible.";
      advice = "Visez les 20 avis pour dépasser vos concurrents locaux.";
  } else {
      diagnostic = "Excellente réputation !";
      advice = "Profitez de cette note pour augmenter vos prix ou votre visibilité.";
  }

  // SWOT simplifiée pour l'exemple
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const defaultKeywords = ['service', 'accueil', 'prix', 'qualité'];
  const focusKeywords = business.focusAreas ? business.focusAreas.split(',') : defaultKeywords;

  focusKeywords.forEach(k => {
      const keyword = k.trim().toLowerCase();
      const related = reviews.filter(r => (r.content||"").toLowerCase().includes(keyword));
      if(related.length > 0) {
          const score = related.reduce((acc, r) => acc + r.rating, 0) / related.length;
          const label = keyword.charAt(0).toUpperCase() + keyword.slice(1);
          if(score >= 4.2) strengths.push(`${label} (${score.toFixed(1)}★)`);
          else if(score < 4.0) weaknesses.push(`${label} (${score.toFixed(1)}★)`);
      }
  });

  if (weaknesses.length === 0 && averageRating < 4.0) {
      weaknesses.push("Satisfaction Générale");
      weaknesses.push("Ratio Avis Négatifs");
  }
  if (strengths.length === 0 && averageRating >= 4.5) {
      strengths.push("Excellence Globale");
  }

  return {
    name: business.name,
    googleUrl: business.googleUrl,
    rating: averageRating, 
    ratingDisplay: averageRating.toFixed(1),
    totalReviews,
    distribution,
    diagnostic,
    advice,
    strengths,
    weaknesses,
    // ✅ ON RETOURNE MAINTENANT UN OBJET COMPLEXE POUR LE GRAPHIQUE
    timelineData: {
        daily: dailyData,
        monthly: monthlyData,
        yearly: yearlyData
    }
  };
}
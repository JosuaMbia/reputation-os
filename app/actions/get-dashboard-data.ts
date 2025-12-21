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
  
  // 1. Calculs Note Moyenne
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

  // 4. DIAGNOSTIC & CONSEILS
  let diagnostic = "Tout semble calme.";
  let advice = "Continuez à solliciter vos clients.";

  if (totalReviews === 0) {
      diagnostic = "Manque de données.";
      advice = "Importez vos avis ou commencez une campagne SMS.";
  } else if (averageRating < 4.0) {
      const badReviews = reviews.filter(r => r.rating <= 3);
      diagnostic = `Trop d'avis mitigés (${badReviews.length} avis ≤ 3★).`;
      advice = "Votre priorité absolue : obtenir 5 nouveaux avis 5★ cette semaine pour remonter la moyenne.";
  } else if (totalReviews < 10) {
      diagnostic = "Volume d'avis faible.";
      advice = "Visez les 20 avis pour dépasser vos concurrents locaux.";
  } else {
      diagnostic = "Excellente réputation !";
      advice = "Profitez de cette note pour augmenter vos prix ou votre visibilité.";
  }

  // 5. 🧠 ANALYSE SWOT CALIBRÉE (Plus stricte)
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  
  const defaultKeywords = ['service', 'accueil', 'prix', 'qualité', 'rapidité', 'livraison', 'propreté', 'conseil'];
  
  const focusKeywords = business.focusAreas 
    ? business.focusAreas.split(',').map(s => s.trim().toLowerCase()) 
    : defaultKeywords;

  focusKeywords.forEach(keyword => {
      if(!keyword) return;

      const relatedReviews = reviews.filter(r => (r.content || "").toLowerCase().includes(keyword));
      
      if (relatedReviews.length > 0) {
          const topicScore = relatedReviews.reduce((acc, r) => acc + r.rating, 0) / relatedReviews.length;
          const prettyKeyword = keyword.charAt(0).toUpperCase() + keyword.slice(1);

          // FORCE : Si > 4.2 (Vraiment excellent)
          if (topicScore >= 4.2) {
              strengths.push(`${prettyKeyword} (${topicScore.toFixed(1)}★)`);
          } 
          // FAIBLESSE : Si < 4.0 (Tout ce qui n'est pas parfait est améliorable !)
          // ✅ CHANGEMENT ICI : On a remonté le seuil de 3.5 à 4.0
          else if (topicScore < 4.0) {
              weaknesses.push(`${prettyKeyword} (${topicScore.toFixed(1)}★)`);
          }
      }
  });

  // ✅ FILETS DE SÉCURITÉ (Si aucun mot clé trouvé)
  
  // Si note globale < 4 mais aucune faiblesse spécifique trouvée -> On met "Expérience Générale"
  if (weaknesses.length === 0 && averageRating < 4.0) {
      weaknesses.push("Satisfaction Générale");
      weaknesses.push("Ratio Avis Négatifs");
  }
  
  // Si note globale > 4.5 mais aucune force trouvée -> On met "Excellence Globale"
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
    timelineLabels,
    timelineData,
    diagnostic,
    advice,
    strengths,
    weaknesses,
    focusAreas: business.focusAreas
  };
}
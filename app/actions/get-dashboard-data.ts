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

  // 2. Distribution (Barres 1-5 étoiles)
  const distribution = [0, 0, 0, 0, 0];
  reviews.forEach(r => {
    const star = Math.round(r.rating);
    if (star >= 1 && star <= 5) distribution[star - 1]++;
  });

  // 3. Timeline (6 derniers mois)
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

  // 4. 🚨 DIAGNOSTIC GLOBAL (Texte)
  let diagnostic = "Tout semble calme.";
  let advice = "Continuez à solliciter vos clients.";

  if (totalReviews === 0) {
      diagnostic = "Manque de données.";
      advice = "Importez vos avis ou commencez une campagne SMS.";
  } else if (averageRating < 4.0) {
      const badReviews = reviews.filter(r => r.rating <= 3);
      diagnostic = `Trop d'avis négatifs récents (${badReviews.length} avis ≤ 3★).`;
      advice = "Il faut 'noyer' ces avis. Lancez une campagne SMS massive pour obtenir 10 avis 5★ rapidement.";
  } else if (totalReviews < 10) {
      diagnostic = "Volume d'avis trop faible pour le SEO local.";
      advice = "Visez les 20 avis pour dépasser vos concurrents locaux.";
  } else {
      diagnostic = "Excellente réputation !";
      advice = "Profitez de cette note pour augmenter vos prix ou votre visibilité.";
  }

  // 5. 🧠 ANALYSE SWOT (Forces & Faiblesses par Mots-clés)
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  
  // Mots-clés par défaut si le client n'a rien mis dans les Settings
  const defaultKeywords = ['service', 'accueil', 'prix', 'qualité', 'rapidité', 'livraison', 'propreté'];
  
  const focusKeywords = business.focusAreas 
    ? business.focusAreas.split(',').map(s => s.trim().toLowerCase()) 
    : defaultKeywords;

  focusKeywords.forEach(keyword => {
      if(!keyword) return;

      // On cherche les avis contenant ce mot (insensible à la casse)
      const relatedReviews = reviews.filter(r => (r.content || "").toLowerCase().includes(keyword));
      
      if (relatedReviews.length > 0) {
          // Calcul de la note moyenne sur ce sujet précis
          const topicScore = relatedReviews.reduce((acc, r) => acc + r.rating, 0) / relatedReviews.length;
          
          // Mise en forme du mot (1ère lettre majuscule)
          const prettyKeyword = keyword.charAt(0).toUpperCase() + keyword.slice(1);

          if (topicScore >= 4.0) {
              strengths.push(`${prettyKeyword} (${topicScore.toFixed(1)}★)`);
          } else if (topicScore <= 3.8) {
              weaknesses.push(`${prettyKeyword} (${topicScore.toFixed(1)}★)`);
          }
      }
  });

  // Fallback si rien trouvé (pour éviter les cases vides)
  if (strengths.length === 0 && averageRating >= 4) strengths.push("Satisfaction Générale");
  if (weaknesses.length === 0 && averageRating < 3.5) weaknesses.push("Expérience Globale");

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
    // ✅ NOUVEAUX CHAMPS SWOT
    strengths,
    weaknesses,
    focusAreas: business.focusAreas
  };
}
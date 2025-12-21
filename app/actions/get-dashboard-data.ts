'use server'

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getDashboardData() {
  const { userId } = await auth();
  if (!userId) return null;

  const business = await prisma.business.findFirst({
    where: { userId },
    include: { reviews: true }
  });

  if (!business) return null;

  const reviews = business.reviews;
  const totalReviews = reviews.length;
  
  // 1. Calcul de la Note Moyenne
  const averageRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews)
    : 0;

  // 2. Calcul de la Distribution (Pour le graphique en Barres)
  // On veut un tableau [nb 1 étoile, nb 2 étoiles, ..., nb 5 étoiles]
  const distribution = [0, 0, 0, 0, 0];
  reviews.forEach(r => {
    const star = Math.round(r.rating);
    if (star >= 1 && star <= 5) {
        distribution[star - 1]++; // star-1 car l'index commence à 0
    }
  });

  // 3. Calcul de la Timeline (Pour le graphique en Ligne) - 6 derniers mois
  const timelineLabels: string[] = [];
  const timelineData: number[] = [];
  
  // On génère les 6 derniers mois
  for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      
      // Label (ex: "Juin")
      const monthName = d.toLocaleDateString('fr-FR', { month: 'short' });
      timelineLabels.push(monthName);

      // On compte les avis de ce mois-ci
      const count = reviews.filter(r => {
          const rDate = new Date(r.date); // ou r.reviewDate selon votre schema
          return rDate.getMonth() === d.getMonth() && rDate.getFullYear() === d.getFullYear();
      }).length;
      
      timelineData.push(count);
  }

  return {
    name: business.name,
    rating: averageRating, 
    ratingDisplay: averageRating.toFixed(1),
    totalReviews,
    // 👇 Les données formatées exactement pour votre composant
    distribution, 
    timelineLabels,
    timelineData
  };
}
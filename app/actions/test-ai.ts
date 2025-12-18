'use server'

import { generateReviewReply } from "@/lib/ai-response";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function testAiGeneration() {
  const { userId } = await auth();
  if (!userId) return "Erreur auth";

  const business = await prisma.business.findFirst({ where: { userId } });
  if (!business) return "Pas de business";

  // Simulation
  const reply = await generateReviewReply({
    businessId: business.id, // ✅ On utilise le vrai ID maintenant
    reviewerName: "Sophie Martin",
    starRating: 5,
    reviewText: "Super expérience, j'ai adoré l'accueil !",
  });
  
  return reply;
}
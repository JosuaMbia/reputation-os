'use server'

import { generateReviewReply } from "@/lib/ai-response";

export async function testAiGeneration() {
  // Simulation d'un avis négatif difficile
  const fakeReview = {
    businessName: "Boulangerie Délicieuse",
    reviewerName: "Jean-Pierre",
    starRating: 2,
    reviewText: "Le pain était dur comme de la pierre et la vendeuse pas aimable du tout. Très déçu pour le prix.",
    tone: "empathetic" as const // On teste le mode empathique
  };

  const reply = await generateReviewReply(fakeReview);
  return reply;
}
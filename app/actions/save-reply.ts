'use server'

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveReply(reviewId: string, replyText: string) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Non autorisé" };

  try {
    await prisma.review.update({
      where: { id: reviewId },
      data: {
        response: replyText,
        isReplied: true,
        repliedAt: new Date(),
      }
    });

    revalidatePath("/dashboard/reviews");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erreur lors de la sauvegarde" };
  }
}

// 👇 BONUS : Action pour créer de faux avis de test
export async function seedFakeReviews() {
  const { userId } = await auth();
  if (!userId) return;

  const business = await prisma.business.findFirst({ where: { userId } });
  if (!business) return;

  await prisma.review.createMany({
    data: [
      {
        businessId: business.id,
        authorName: "Thomas Dubreuil",
        rating: 5,
        content: "Service impeccable ! J'ai été pris en charge tout de suite. Je recommande vivement.",
        reviewDate: new Date(),
        googleReviewId: "fake_1_" + Date.now()
      },
      {
        businessId: business.id,
        authorName: "Sarah Connor",
        rating: 2,
        content: "Assez déçue. L'attente était longue et le personnel peu souriant. Peut mieux faire.",
        reviewDate: new Date(),
        googleReviewId: "fake_2_" + Date.now()
      },
      {
        businessId: business.id,
        authorName: "Lucas M.",
        rating: 4,
        content: "Bon rapport qualité prix, rien à dire sur le travail. Juste un peu difficile de se garer.",
        reviewDate: new Date(),
        googleReviewId: "fake_3_" + Date.now()
      }
    ]
  });
  
  revalidatePath("/dashboard/reviews");
}
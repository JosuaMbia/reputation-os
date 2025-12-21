'use server'

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// Simulation d'IA (Pour l'instant, on fait des templates intelligents)
// Plus tard, on branchera OpenAI ici pour du vrai génératif
export async function generateSocialPost(reviewId: string) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Non autorisé" };

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { business: true }
  });

  if (!review) return { success: false, error: "Avis introuvable" };

  // Logique de génération de texte (Template IA)
  const templates = [
    `🌟 MERCI ! \n\n"${review.content.substring(0, 100)}..."\n\nMerci à ${review.authorName} pour ce superbe retour ! Toute l'équipe de ${review.business.name} est ravie de vous satisfaire.\n\n👉 Passez nous voir cette semaine !\n\n#SatisfactionClient #${review.business.city?.replace(/\s/g, '') || "Local"} #Merci`,
    
    `On ne s'en lasse pas ! 😍\n\nQuand nos clients parlent de nous : "${review.content.substring(0, 50)}..."\n\nC'est pour ces moments qu'on se lève le matin chez ${review.business.name}. \n\nVous validez ? Venez tester !\n\n#AvisClient #Qualité #GoodVibes`,
    
    `⭐ 5 Étoiles pour commencer la semaine !\n\n${review.authorName} a adoré son expérience. Et vous, c'est pour quand ?\n\n📍 ${review.business.name}\n\n#Review #${review.business.type || "Commerce"} #HappyCustomer`
  ];

  // On choisit un template au hasard
  const randomCaption = templates[Math.floor(Math.random() * templates.length)];

  // On crée le brouillon dans la base de données
  const post = await prisma.socialPost.create({
    data: {
      businessId: review.business.id,
      caption: randomCaption,
      platform: "INSTAGRAM",
      status: "DRAFT",
      // Image par défaut (placeholder)
      imageUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80"
    }
  });

  return { success: true, postId: post.id };
}
import { prisma } from "@/lib/prisma";

// Intégration Google My Business API
// Documentation: https://developers.google.com/my-business/content/review-data

export interface GoogleReview {
  reviewId: string; // Format: accounts/{accId}/locations/{locId}/reviews/{reviewId}
  reviewer: { displayName: string; profilePhotoUrl?: string };
  starRating: "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE";
  comment?: string; // Le commentaire est optionnel
  createTime: string;
  updateTime: string;
  reviewReply?: { comment: string; updateTime: string };
}

// Helper pour convertir le format Google (ENUM) en nombre (Int)
function mapRating(rating: string): number {
  const map: Record<string, number> = {
    ONE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    FIVE: 5,
  };
  return map[rating] || 0;
}

export async function syncGoogleReviews(businessId: string, accessToken: string) {
  console.log("🔄 Synchronisation Google Business pour:", businessId);
  
  let syncedCount = 0;
  const errors: string[] = [];

  try {
    // 1. Récupérer les infos du Business dans votre DB pour avoir l'ID Google
    // Note : On suppose que vous stockez le "name" de la location Google (ex: accounts/X/locations/Y)
    // dans un champ comme `googlePlaceId` ou `googleLocationName`.
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business || !business.googlePlaceId) {
      throw new Error("Business introuvable ou Google Place ID manquant");
    }

    // L'ID doit être sous la forme : accounts/{accountId}/locations/{locationId}
    // Si vous n'avez que l'ID court, il faudra reconstruire cette chaîne.
    const locationName = business.googlePlaceId; 

    // 2. Appel à l'API Google My Business
    const url = `https://mybusiness.googleapis.com/v4/${locationName}/reviews?pageSize=50`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur API Google: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const googleReviews: GoogleReview[] = data.reviews || [];

    // 3. Créer/mettre à jour dans Prisma
    for (const gReview of googleReviews) {
      try {
        await prisma.review.upsert({
          where: { googleReviewId: gReview.reviewId }, // Assurez-vous d'avoir @unique sur ce champ dans Prisma
          update: {
            rating: mapRating(gReview.starRating),
            content: gReview.comment || "",
            updatedAt: new Date(gReview.updateTime),
            // Si une réponse existe sur Google, on la met à jour localement
            replyText: gReview.reviewReply?.comment || null,
            replyDate: gReview.reviewReply ? new Date(gReview.reviewReply.updateTime) : null,
          },
          create: {
            businessId: businessId,
            googleReviewId: gReview.reviewId,
            authorName: gReview.reviewer.displayName,
            rating: mapRating(gReview.starRating),
            content: gReview.comment || "",
            createdAt: new Date(gReview.createTime),
            // Gestion de la réponse existante
            replyText: gReview.reviewReply?.comment || null,
            replyDate: gReview.reviewReply ? new Date(gReview.reviewReply.updateTime) : null,
          },
        });
        syncedCount++;
      } catch (err) {
        console.error("Erreur lors de l'import d'un avis:", err);
        errors.push(`Échec import avis ${gReview.reviewId}`);
      }
    }

    // Mettre à jour la date de dernière synchro du business
    await prisma.business.update({
      where: { id: businessId },
      data: { updatedAt: new Date() } // Ou un champ lastSyncDate si vous en avez un
    });

  } catch (error: any) {
    console.error("Erreur critique syncGoogleReviews:", error);
    errors.push(error.message);
  }

  return { synced: syncedCount, errors };
}

export async function postReplyToGoogle(
  reviewId: string, // Doit être le "resource name" complet : accounts/X/locations/Y/reviews/Z
  reply: string,
  accessToken: string
) {
  console.log("📨 Envoi de réponse sur Google pour:", reviewId);

  try {
    const url = `https://mybusiness.googleapis.com/v4/${reviewId}/reply`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        comment: reply,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur Google API: ${JSON.stringify(errorData)}`);
    }

    // Si succès, on met à jour notre base locale immédiatement
    await prisma.review.update({
      where: { googleReviewId: reviewId },
      data: {
        replyText: reply,
        replyDate: new Date(),
      },
    });

    return { success: true };

  } catch (error) {
    console.error("Erreur postReplyToGoogle:", error);
    return { success: false, error };
  }
}

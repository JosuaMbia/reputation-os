import { prisma } from "@/lib/prisma";

// --- Types Google API ---
// Structure officielle des réponses de l'API Google Business Profile
export interface GoogleReview {
  reviewId: string; // Ex: accounts/X/locations/Y/reviews/Z
  reviewer: { 
    displayName: string; 
    profilePhotoUrl?: string; // L'API renvoie parfois l'URL de la photo
  };
  starRating: "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE";
  comment?: string; // Le message du client (peut être vide)
  createTime: string; // ISO Date string
  updateTime: string; // ISO Date string
  reviewReply?: { 
    comment: string; 
    updateTime: string; 
  };
}

// Helper pour convertir "FIVE" -> 5
function mapRating(rating: string): number {
  const map: Record<string, number> = {
    ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5,
  };
  return map[rating] || 0;
}

/**
 * Synchronise les avis Google pour un Business donné
 * @param businessId ID interne (Prisma) du business
 * @param accessToken Token OAuth Google valide
 */
export async function syncGoogleReviews(businessId: string, accessToken: string) {
  console.log(`🔄 Start sync for business: ${businessId}`);
  
  let syncedCount = 0;
  const errors: string[] = [];

  try {
    // 1. Récupérer le business pour avoir l'identifiant Google
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business || !business.googlePlaceId) {
      throw new Error("Business introuvable ou Google Place ID manquant (Format attendu: accounts/X/locations/Y)");
    }

    // NOTE: Le champ googlePlaceId dans votre DB doit contenir le "Resource Name" Google
    // Format: "accounts/{accountId}/locations/{locationId}"
    const locationResourceName = business.googlePlaceId; 

    // 2. Appel API Google
    const url = `https://mybusiness.googleapis.com/v4/${locationResourceName}/reviews?pageSize=50`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Google API Error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const googleReviews: GoogleReview[] = data.reviews || [];

    // 3. Sauvegarde dans Prisma
    for (const gReview of googleReviews) {
      try {
        await prisma.review.upsert({
          where: { googleReviewId: gReview.reviewId }, // Utilise votre champ @unique
          
          // Mise à jour si l'avis existe déjà (ex: réponse ajoutée ailleurs)
          update: {
            rating: mapRating(gReview.starRating),
            content: gReview.comment || "",
            updatedAt: new Date(gReview.updateTime),
            
            // Mise à jour de la réponse (si modifiée sur Google directement)
            response: gReview.reviewReply?.comment || null,
            isReplied: !!gReview.reviewReply,
            repliedAt: gReview.reviewReply ? new Date(gReview.reviewReply.updateTime) : null,
          },
          
          // Création si nouvel avis
          create: {
            businessId: businessId,
            googleReviewId: gReview.reviewId,
            authorName: gReview.reviewer.displayName,
            authorPhoto: gReview.reviewer.profilePhotoUrl || null,
            rating: mapRating(gReview.starRating),
            content: gReview.comment || "",
            reviewDate: new Date(gReview.createTime), // Map vers votre champ reviewDate
            
            // Gestion de la réponse
            response: gReview.reviewReply?.comment || null,
            isReplied: !!gReview.reviewReply,
            repliedAt: gReview.reviewReply ? new Date(gReview.reviewReply.updateTime) : null,
            
            // Champs par défaut pour l'IA (optionnel, géré par le @default dans le schema)
            actionRequired: false 
          },
        });
        syncedCount++;
      } catch (err) {
        console.error(`❌ Erreur import avis ${gReview.reviewId}:`, err);
        errors.push(`Review ID ${gReview.reviewId} failed`);
      }
    }

    // Mise à jour du timestamp du Business
    await prisma.business.update({
      where: { id: businessId },
      data: { updatedAt: new Date() }
    });

  } catch (error: any) {
    console.error("🔥 Erreur critique syncGoogleReviews:", error);
    return { synced: syncedCount, errors: [error.message] };
  }

  return { synced: syncedCount, errors };
}

/**
 * Poste une réponse à un avis sur Google et met à jour la DB
 */
export async function postReplyToGoogle(
  reviewId: string, // L'ID Google complet (accounts/.../reviews/...)
  replyContent: string,
  accessToken: string
) {
  console.log(`📨 Posting reply to Google: ${reviewId}`);

  try {
    // 1. Appel API Google (PUT)
    const url = `https://mybusiness.googleapis.com/v4/${reviewId}/reply`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        comment: replyContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Google API Error: ${JSON.stringify(errorData)}`);
    }

    // 2. Mise à jour locale dans Prisma pour refléter le succès immédiat
    await prisma.review.update({
      where: { googleReviewId: reviewId },
      data: {
        response: replyContent, // Votre champ schema
        isReplied: true,        // Votre champ schema
        repliedAt: new Date(),  // Votre champ schema
      },
    });

    return { success: true };

  } catch (error: any) {
    console.error("Error posting reply:", error);
    return { success: false, error: error.message };
  }
}

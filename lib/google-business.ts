// lib/google-business.ts
// Intégration avec Google Business Profile API

import { google } from 'googleapis';
import { createAuthenticatedClient, refreshAccessToken } from './google-oauth';
import { prisma } from './prisma';

// Types Google API
export interface GoogleReview {
  reviewId: string;
  reviewer: { displayName: string };
  starRating: "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE";
  comment?: string;
  createTime: string;
  updateTime: string;
  reviewReply?: { comment: string };
}

// Mapper le rating Google vers un nombre
function mapRating(rating: string): number {
  const map: Record<string, number> = {
    'ONE': 1, 'TWO': 2, 'THREE': 3, 'FOUR': 4, 'FIVE': 5
  };
  return map[rating] || 0;
}

/**
 * Synchroniser les avis Google pour un business donné
 * @param businessId - ID du business dans Prisma
 * @param userId - ID de l'utilisateur Clerk
 */
// lib/google-business.ts

// ... (Gardez les imports et l'interface GoogleReview comme avant)

export async function syncGoogleReviews(businessId: string, userId: string) {
  try {
    console.log(`🚀 Démarrage synchro pour Business ID: ${businessId}`);

    // 1. Récupérer les tokens (identique à avant)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        googleAccessToken: true,
        googleRefreshToken: true,
        googleTokenExpiry: true,
      },
    });

    if (!user?.googleAccessToken) {
      throw new Error('Utilisateur non connecté à Google');
    }

    // 2. Refresh Token si nécessaire (identique à avant)
    let accessToken = user.googleAccessToken;
    if (user.googleTokenExpiry && new Date() > user.googleTokenExpiry && user.googleRefreshToken) {
      console.log("🔄 Rafraîchissement du token...");
      const newTokens = await refreshAccessToken(user.googleRefreshToken);
      accessToken = newTokens.access_token!;
      await prisma.user.update({
        where: { id: userId },
        data: {
          googleAccessToken: accessToken,
          googleTokenExpiry: newTokens.expiry_date ? new Date(newTokens.expiry_date) : null,
        },
      });
    }

    // 3. Créer le client
    const oauth2Client = createAuthenticatedClient(accessToken, user.googleRefreshToken || undefined);

    // 4. Récupérer le ID du business dans notre base
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { googlePlaceId: true }, // ATTENTION: Doit être 'accounts/X/locations/Y'
    });

    // ⚠️ Si googlePlaceId est vide, on essaie de le trouver automatiquement
    let locationName = business?.googlePlaceId;

    if (!locationName) {
      console.log("⚠️ Pas de Google Location ID connu, recherche du premier établissement...");
      // Appel API pour lister les comptes
      const accountsRes = await oauth2Client.request({ url: 'https://mybusinessaccountmanagement.googleapis.com/v1/accounts' });
      const accounts = (accountsRes.data as any).accounts;
      
      if (accounts && accounts.length > 0) {
        const accountId = accounts[0].name; // ex: accounts/1183...
        // Appel API pour lister les locations de ce compte
        const locationsRes = await oauth2Client.request({ url: `https://mybusinessbusinessinformation.googleapis.com/v1/${accountId}/locations` });
        const locations = (locationsRes.data as any).locations;
        
        if (locations && locations.length > 0) {
          locationName = locations[0].name; // ex: accounts/1183.../locations/456...
          
          // On sauvegarde ce précieux ID pour la prochaine fois
          await prisma.business.update({
            where: { id: businessId },
            data: { googlePlaceId: locationName }
          });
          console.log(`✅ Business lié trouvé: ${locationName}`);
        }
      }
    }

    if (!locationName) {
      throw new Error("Impossible de trouver un établissement Google Business associé à ce compte.");
    }

    console.log(`📥 Récupération des avis pour: ${locationName}`);

    // 5. APPEL RÉEL À L'API POUR LES AVIS
    // On utilise l'API v4 qui est toujours la référence pour les reviews
    const reviewsResponse = await oauth2Client.request({
      url: `https://mybusiness.googleapis.com/v4/${locationName}/reviews?pageSize=50`
    });

    const googleData = reviewsResponse.data as any;
    const realReviews = googleData.reviews || []; // La liste des vrais avis

    console.log(`✅ ${realReviews.length} avis récupérés depuis Google.`);

    // 6. Sauvegarder dans Prisma
    let syncedCount = 0;
    for (const review of realReviews) {
      // Conversion du format Google
      const stars = mapRating(review.starRating); // "FIVE" -> 5
      const date = new Date(review.createTime);
      
      await prisma.review.upsert({
        where: { googleReviewId: review.reviewId },
        create: {
          businessId,
          googleReviewId: review.reviewId,
          content: review.comment || '(Pas de commentaire)',
          rating: stars,
          authorName: review.reviewer.displayName || 'Anonyme',
          reviewDate: date,
          response: review.reviewReply?.comment || null,
          isReplied: !!review.reviewReply,
        },
        update: {
          content: review.comment || '(Pas de commentaire)',
          rating: stars,
          response: review.reviewReply?.comment || null,
          isReplied: !!review.reviewReply,
          updatedAt: new Date(),
        },
      });
      syncedCount++;
    }

    return { synced: syncedCount, errors: [] };

  } catch (error: any) {
    console.error('❌ Erreur syncGoogleReviews:', error.response?.data || error);
    throw error;
  }
}
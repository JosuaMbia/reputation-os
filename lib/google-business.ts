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
export async function syncGoogleReviews(businessId: string, userId: string) {
  try {
    // 1. Récupérer les tokens de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        googleAccessToken: true,
        googleRefreshToken: true,
        googleTokenExpiry: true,
      },
    });

    if (!user?.googleAccessToken) {
      throw new Error('User not connected to Google');
    }

    // 2. Vérifier si le token est expiré et le rafraîchir si nécessaire
    let accessToken = user.googleAccessToken;
    if (user.googleTokenExpiry && new Date() > user.googleTokenExpiry && user.googleRefreshToken) {
      const newTokens = await refreshAccessToken(user.googleRefreshToken);
      accessToken = newTokens.access_token!;
      
      // Mettre à jour les tokens dans la BD
      await prisma.user.update({
        where: { id: userId },
        data: {
          googleAccessToken: accessToken,
          googleTokenExpiry: newTokens.expiry_date ? new Date(newTokens.expiry_date) : null,
        },
      });
    }

    // 3. Créer le client authentifié
    const oauth2Client = createAuthenticatedClient(accessToken, user.googleRefreshToken);

    // 4. Récupérer le Google Place ID du business
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { googlePlaceId: true },
    });

    if (!business?.googlePlaceId) {
      throw new Error('Business Place ID manquant (Format attendu: accounts/{accountId}/locations/{locationId})');
    }

    // 5. Appel à l'API Google My Business pour récupérer les avis
    const mybusiness = google.mybusinessaccountmanagement({
      version: 'v1',
      auth: oauth2Client,
    });

    // Note: Le code ci-dessous doit être adapté selon l'API Google Business Profile
    // L'API a changé récemment. Voici la structure de base:
    
    const locationResourceName = business.googlePlaceId;
    
    // Exemple d'appel (à adapter selon la documentation Google actuelle)
    // const response = await mybusiness.accounts.locations.reviews.list({
    //   parent: locationResourceName,
    // });

    // TEMPORAIRE : Pour le développement, on simule des données
    const mockReviews: GoogleReview[] = [];

    // 6. Sauvegarder les avis dans Prisma
    for (const review of mockReviews) {
      await prisma.review.upsert({
        where: { googleReviewId: review.reviewId },
        create: {
          businessId,
          googleReviewId: review.reviewId,
          content: review.comment || '',
          rating: mapRating(review.starRating),
          authorName: review.reviewer.displayName,
          reviewDate: new Date(review.createTime),
          response: review.reviewReply?.comment,
          isReplied: !!review.reviewReply,
        },
        update: {
          content: review.comment || '',
          rating: mapRating(review.starRating),
          response: review.reviewReply?.comment,
          isReplied: !!review.reviewReply,
          updatedAt: new Date(),
        },
      });
    }

    return { synced: mockReviews.length, errors: [] };

  } catch (error) {
    console.error('Error syncing Google reviews:', error);
    throw error;
  }
}

/**
 * Poster une réponse à un avis Google
 * @param reviewId - ID de l'avis dans Prisma
 * @param reply - Texte de la réponse
 * @param userId - ID de l'utilisateur
 */
export async function postReplyToGoogle(
  reviewId: string,
  reply: string,
  userId: string
) {
  try {
    // 1. Récupérer l'avis et le business
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { business: true },
    });

    if (!review) {
      throw new Error('Review not found');
    }

    // 2. Récupérer les tokens de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        googleAccessToken: true,
        googleRefreshToken: true,
      },
    });

    if (!user?.googleAccessToken) {
      throw new Error('User not connected to Google');
    }

    // 3. Créer le client authentifié
    const oauth2Client = createAuthenticatedClient(
      user.googleAccessToken,
      user.googleRefreshToken
    );

    // 4. Poster la réponse via l'API Google
    // const mybusiness = google.mybusinessaccountmanagement({
    //   version: 'v1',
    //   auth: oauth2Client,
    // });

    // await mybusiness.accounts.locations.reviews.updateReply({
    //   name: `${review.business.googlePlaceId}/reviews/${review.googleReviewId}`,
    //   requestBody: {
    //     comment: reply,
    //   },
    // });

    // 5. Mettre à jour dans la base de données
    await prisma.review.update({
      where: { id: reviewId },
      data: {
        response: reply,
        isReplied: true,
        repliedAt: new Date(),
      },
    });

    return { success: true };

  } catch (error) {
    console.error('Error posting reply to Google:', error);
    throw error;
  }
}

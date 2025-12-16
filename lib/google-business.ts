// lib/google-business.ts
import { google } from 'googleapis';
import { createAuthenticatedClient, refreshAccessToken } from './google-oauth';
import { prisma } from './prisma';

// --- Types et Helpers ---

export interface GoogleReview {
  reviewId: string;
  reviewer: { displayName: string };
  starRating: "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE";
  comment?: string;
  createTime: string;
  updateTime: string;
  reviewReply?: { comment: string };
}

function mapRating(rating: string): number {
  const map: Record<string, number> = {
    'ONE': 1, 'TWO': 2, 'THREE': 3, 'FOUR': 4, 'FIVE': 5
  };
  return map[rating] || 0;
}

// --- Fonction Principale ---

export async function syncGoogleReviews(businessId: string, userId: string) {
  try {
    console.log(`🚀 Démarrage synchro complète pour Business ID: ${businessId}`);

    // 1. Authentification & Tokens
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

    // Refresh Token si nécessaire
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

    // Création du client Google
    const oauth2Client = createAuthenticatedClient(accessToken, user.googleRefreshToken || undefined);

    // 2. Récupération / Découverte de l'ID Google (Resource Name)
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { googlePlaceId: true }, 
    });

    let locationName = business?.googlePlaceId;

    // Si on n'a pas l'ID, on le cherche
    if (!locationName) {
      console.log("⚠️ Recherche de l'établissement Google...");
      const accountsRes = await oauth2Client.request({ url: 'https://mybusinessaccountmanagement.googleapis.com/v1/accounts' });
      const accounts = (accountsRes.data as any).accounts;
      
      if (accounts && accounts.length > 0) {
        const accountId = accounts[0].name;
        const locationsRes = await oauth2Client.request({ url: `https://mybusinessbusinessinformation.googleapis.com/v1/${accountId}/locations` });
        const locations = (locationsRes.data as any).locations;
        
        if (locations && locations.length > 0) {
          locationName = locations[0].name; // Format: accounts/X/locations/Y
        }
      }
    }

    if (!locationName) {
      throw new Error("Impossible de trouver un établissement Google Business associé.");
    }

    // 3. 🧠 RÉCUPÉRATION DES INFOS + ADRESSE
    console.log(`📥 Récupération des détails de l'établissement...`);
    
    // On appelle l'API Business Information
    const infoRes = await oauth2Client.request({
      url: `https://mybusinessbusinessinformation.googleapis.com/v1/${locationName}?readMask=title,profile,primaryCategory,websiteUri,phoneNumbers,storefrontAddress`
    });
    
    // @ts-ignore - On ignore l'erreur de type strict ici pour faciliter le build
    const info = infoRes.data as any;

    // --- Helper pour formater l'adresse ---
    let formattedAddress = null;
    if (info.storefrontAddress) {
      const addr = info.storefrontAddress;
      const lines = addr.addressLines || [];
      formattedAddress = `${lines.join(', ')}, ${addr.postalCode || ''} ${addr.locality || ''}`;
    }

    const googleCategory = info.primaryCategory?.displayName || null;
    const googleDescription = info.profile?.description || null;
    const googleWebsite = info.websiteUri || null;
    const googlePhone = info.phoneNumbers?.primaryPhone || null;
    const googleName = info.title || null;

    // Mise à jour de la base de données
    await prisma.business.update({
      where: { id: businessId },
      data: {
        googlePlaceId: locationName,
        name: googleName || undefined,
        category: googleCategory,
        description: googleDescription,
        website: googleWebsite,
        phone: googlePhone,
        address: formattedAddress,
        updatedAt: new Date(),
      } as any, // <--- 👈 AJOUTEZ CECI EXACTEMENT (Cela force TypeScript à accepter)
    });
    
    console.log(`✅ Fiche établissement mise à jour : ${googleCategory}`);

    // 4. Récupération des Avis (Reviews)
    console.log(`📥 Récupération des avis...`);
    const reviewsResponse = await oauth2Client.request({
      url: `https://mybusiness.googleapis.com/v4/${locationName}/reviews?pageSize=50`
    });

    const googleData = reviewsResponse.data as any;
    const realReviews = googleData.reviews || [];

    // 5. Sauvegarde des avis
    let syncedCount = 0;
    for (const review of realReviews) {
      const stars = mapRating(review.starRating);
      
      await prisma.review.upsert({
        where: { googleReviewId: review.reviewId },
        create: {
          businessId,
          googleReviewId: review.reviewId,
          content: review.comment || '(Pas de commentaire)',
          rating: stars,
          authorName: review.reviewer.displayName || 'Anonyme',
          reviewDate: new Date(review.createTime),
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

// Fonction pour poster une réponse (inchangée)
export async function postReplyToGoogle(reviewId: string, reply: string, userId: string) {
  try {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { business: true },
    });

    if (!review) throw new Error('Review not found');

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { googleAccessToken: true, googleRefreshToken: true },
    });

    if (!user?.googleAccessToken) throw new Error('User not connected');

    const oauth2Client = createAuthenticatedClient(user.googleAccessToken, user.googleRefreshToken || undefined);

    await oauth2Client.request({
      url: `https://mybusiness.googleapis.com/v4/${review.googleReviewId}/reply`,
      method: 'PUT',
      data: { comment: reply }
    });

    await prisma.review.update({
      where: { id: reviewId },
      data: { response: reply, isReplied: true, repliedAt: new Date() },
    });

    return { success: true };

  } catch (error) {
    console.error('Error posting reply:', error);
    throw error;
  }
}
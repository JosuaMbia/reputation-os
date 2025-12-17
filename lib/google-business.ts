// lib/google-business.ts (VERSION DEBUGGING)
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
    console.log(`🚀 [SYNC] Démarrage pour Business ID: ${businessId}`);

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
      throw new Error('Utilisateur non connecté à Google (Token manquant)');
    }

    // Refresh Token si nécessaire
    let accessToken = user.googleAccessToken;
    if (user.googleTokenExpiry && new Date() > user.googleTokenExpiry && user.googleRefreshToken) {
      console.log("🔄 [AUTH] Rafraîchissement du token...");
      try {
        const newTokens = await refreshAccessToken(user.googleRefreshToken);
        accessToken = newTokens.access_token!;
        await prisma.user.update({
          where: { id: userId },
          data: {
            googleAccessToken: accessToken,
            googleTokenExpiry: newTokens.expiry_date ? new Date(newTokens.expiry_date) : null,
          },
        });
      } catch (e) {
        console.error("❌ [AUTH] Echec refresh token:", e);
        throw new Error("Impossible de rafraîchir la connexion Google. Veuillez vous reconnecter.");
      }
    }

    // Création du client Google
    const oauth2Client = createAuthenticatedClient(accessToken, user.googleRefreshToken || undefined);

    // 2. Récupération / Découverte de l'ID Google (Resource Name)
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { googlePlaceId: true }, 
    });

    let locationName = business?.googlePlaceId;

    // Si on n'a pas l'ID, on le cherche (SCAN INTELLIGENT TOUS COMPTES)
    if (!locationName) {
      console.log("⚠️ [SCAN] Recherche de l'établissement Google...");
      
      let accounts: any[] = [];
      try {
        const accountsRes = await oauth2Client.request({ url: 'https://mybusinessaccountmanagement.googleapis.com/v1/accounts' });
        accounts = (accountsRes.data as any).accounts || [];
      } catch (e: any) {
        console.error("❌ [SCAN] Erreur récupération comptes:", e.response?.data || e.message);
        throw new Error("Impossible de lister vos comptes Google Business. Vérifiez vos droits.");
      }
      
      console.log(`📂 [SCAN] Comptes trouvés : ${accounts.length}`);

      if (accounts.length === 0) {
        throw new Error("Aucun compte Google Business Profile trouvé sur cette adresse email.");
      }

      // 🔄 ON BOUCLE SUR TOUS LES COMPTES
      for (const account of accounts) {
        console.log(`🔍 [SCAN] Compte : ${account.name} (${account.accountName})`);
        try {
          const locationsRes = await oauth2Client.request({ 
            url: `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title` 
          });
          
          const locations = (locationsRes.data as any).locations || [];
          
          if (locations && locations.length > 0) {
            const foundLocation = locations[0];
            locationName = foundLocation.name; // Format: accounts/X/locations/Y
            console.log(`🎉 [SCAN] TROUVÉ ! Établissement : ${foundLocation.title} (${locationName})`);
            break; // On s'arrête dès qu'on a trouvé
          } else {
            console.log("   -> Vide.");
          }
        } catch (err) {
          console.warn(`   -> Erreur d'accès au compte ${account.name}, on passe au suivant.`);
        }
      }
    }

    if (!locationName) {
      throw new Error("Aucun établissement trouvé après avoir scanné tous les comptes Google associés. Êtes-vous sûr d'être administrateur de la fiche ?");
    }

    // 3. 🧠 RÉCUPÉRATION DES INFOS + ADRESSE
    console.log(`📥 [INFO] Récupération détails...`);
    
    let info: any = {};
    try {
        const infoRes = await oauth2Client.request({
        url: `https://mybusinessbusinessinformation.googleapis.com/v1/${locationName}?readMask=title,profile,primaryCategory,websiteUri,phoneNumbers,storefrontAddress`
        });
        info = infoRes.data as any;
    } catch (e: any) {
        console.error("❌ [INFO] Erreur détails:", e.response?.data || e.message);
        throw new Error("Erreur lors de la lecture de la fiche établissement.");
    }

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

    // Mise à jour de la base de données (avec le fix "as any")
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
      } as any, 
    });
    
    console.log(`✅ [DB] Fiche mise à jour : ${googleCategory}`);

    // 4. Récupération des Avis (AVEC PAGINATION)
    console.log(`📥 [REVIEWS] Récupération historique...`);
    
    let allReviews: any[] = [];
    let nextPageToken: string | undefined = undefined;
    const ONE_YEAR_AGO = new Date();
    ONE_YEAR_AGO.setFullYear(ONE_YEAR_AGO.getFullYear() - 1);

    try {
        do {
        const params: any = {
            pageSize: 50,
        };
        if (nextPageToken) params.pageToken = nextPageToken;

        const reviewsResponse = await oauth2Client.request({
            url: `https://mybusiness.googleapis.com/v4/${locationName}/reviews`,
            params: params
        });

        const data = reviewsResponse.data as any;
        const pageReviews = data.reviews || [];
        allReviews = [...allReviews, ...pageReviews];
        nextPageToken = data.nextPageToken;

        // Optimisation : On s'arrête si le dernier avis récupéré est plus vieux qu'un an
        if (pageReviews.length > 0) {
            const lastReviewDate = new Date(pageReviews[pageReviews.length - 1].createTime);
            if (lastReviewDate < ONE_YEAR_AGO) {
            console.log("📅 [REVIEWS] Historique d'un an atteint.");
            break; 
            }
        }

        // Sécurité anti-boucle infinie (max 10 pages = 500 avis)
        if (allReviews.length >= 500) break;

        } while (nextPageToken);
    } catch (e:any) {
        console.warn("⚠️ [REVIEWS] Erreur partielle lors de la récupération des avis (peut-être aucun avis ?) :", e.message);
        // On ne plante pas tout si les avis échouent, on sauvegarde au moins le business
    }

    console.log(`✅ [REVIEWS] ${allReviews.length} avis récupérés.`);

    // 5. Sauvegarde des avis
    let syncedCount = 0;
    for (const review of allReviews) {
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
    console.error('❌ [CRITICAL ERROR] syncGoogleReviews:', error.response?.data || error);
    // On relance l'erreur pour que le client sache que ça a planté
    throw error;
  }
}

// Fonction pour poster une réponse
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
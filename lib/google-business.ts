// lib/google-business.ts (DEBUGGING VERSION)
import { google } from 'googleapis';
import { createAuthenticatedClient, refreshAccessToken } from './google-oauth';
import { prisma } from './prisma';

// --- Types and Helpers ---

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

// --- Main Function ---

export async function syncGoogleReviews(businessId: string, userId: string) {
  try {
    console.log(`🚀 [SYNC] Starting for Business ID: ${businessId}`);

    // 1. Authentication & Tokens
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        googleAccessToken: true,
        googleRefreshToken: true,
        googleTokenExpiry: true,
      },
    });

    if (!user?.googleAccessToken) {
      throw new Error('User not connected to Google (Missing Token)');
    }

    // Refresh Token if necessary
    let accessToken = user.googleAccessToken;
    if (user.googleTokenExpiry && new Date() > user.googleTokenExpiry && user.googleRefreshToken) {
      console.log("🔄 [AUTH] Refreshing token...");
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
        console.error("❌ [AUTH] Token refresh failed:", e);
        throw new Error("Unable to refresh Google connection. Please reconnect.");
      }
    }

    // Create Google Client
    const oauth2Client = createAuthenticatedClient(accessToken, user.googleRefreshToken || undefined);

    // 2. Retrieval / Discovery of Google ID (Resource Name)
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { googlePlaceId: true }, 
    });

    let locationName = business?.googlePlaceId;

    // If ID is missing, search for it (SMART SCAN ALL ACCOUNTS)
    if (!locationName) {
      console.log("⚠️ [SCAN] Searching for Google business listing...");
      
      let accounts: any[] = [];
      try {
        const accountsRes = await oauth2Client.request({ url: 'https://mybusinessaccountmanagement.googleapis.com/v1/accounts' });
        accounts = (accountsRes.data as any).accounts || [];
      } catch (e: any) {
        console.error("❌ [SCAN] Account retrieval error:", e.response?.data || e.message);
        throw new Error("Unable to list your Google Business accounts. Check your permissions.");
      }
      
      console.log(`📂 [SCAN] Accounts found: ${accounts.length}`);

      if (accounts.length === 0) {
        throw new Error("No Google Business Profile account found for this email address.");
      }

      // 🔄 LOOP THROUGH ALL ACCOUNTS
      for (const account of accounts) {
        console.log(`🔍 [SCAN] Account: ${account.name} (${account.accountName})`);
        try {
          const locationsRes = await oauth2Client.request({ 
            url: `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title` 
          });
          
          const locations = (locationsRes.data as any).locations || [];
          
          if (locations && locations.length > 0) {
            const foundLocation = locations[0];
            locationName = foundLocation.name; // Format: accounts/X/locations/Y
            console.log(`🎉 [SCAN] FOUND! Listing: ${foundLocation.title} (${locationName})`);
            break; // Stop as soon as found
          } else {
            console.log("   -> Empty.");
          }
        } catch (err) {
          console.warn(`   -> Error accessing account ${account.name}, moving to next.`);
        }
      }
    }

    if (!locationName) {
      throw new Error("No business listing found after scanning all associated Google accounts. Are you sure you are the listing administrator?");
    }

    // 3. 🧠 RETRIEVE DETAILS + ADDRESS
    console.log(`📥 [INFO] Retrieving details...`);
    
    let info: any = {};
    try {
        const infoRes = await oauth2Client.request({
        url: `https://mybusinessbusinessinformation.googleapis.com/v1/${locationName}?readMask=title,profile,primaryCategory,websiteUri,phoneNumbers,storefrontAddress`
        });
        info = infoRes.data as any;
    } catch (e: any) {
        console.error("❌ [INFO] Details error:", e.response?.data || e.message);
        throw new Error("Error reading business listing.");
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

    // Update database (using 'as any' fix)
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
    
    console.log(`✅ [DB] Listing updated: ${googleCategory}`);

    // 4. Retrieve Reviews (WITH PAGINATION)
    console.log(`📥 [REVIEWS] Retrieving history...`);
    
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

        // Optimization: Stop if the last retrieved review is older than a year
        if (pageReviews.length > 0) {
            const lastReviewDate = new Date(pageReviews[pageReviews.length - 1].createTime);
            if (lastReviewDate < ONE_YEAR_AGO) {
            console.log("📅 [REVIEWS] One year history reached.");
            break; 
            }
        }

        // Infinite loop safety (max 10 pages = 500 reviews)
        if (allReviews.length >= 500) break;

        } while (nextPageToken);
    } catch (e:any) {
        console.warn("⚠️ [REVIEWS] Partial error retrieving reviews (maybe no reviews yet?):", e.message);
        // Don't crash everything if reviews fail, at least save the business
    }

    console.log(`✅ [REVIEWS] ${allReviews.length} reviews retrieved.`);

    // 5. Save Reviews
    let syncedCount = 0;
    for (const review of allReviews) {
      const stars = mapRating(review.starRating);
      
      await prisma.review.upsert({
        where: { googleReviewId: review.reviewId },
        create: {
          businessId,
          googleReviewId: review.reviewId,
          content: review.comment || '(No comment)',
          rating: stars,
          authorName: review.reviewer.displayName || 'Anonymous',
          reviewDate: new Date(review.createTime),
          response: review.reviewReply?.comment || null,
          isReplied: !!review.reviewReply,
        },
        update: {
          content: review.comment || '(No comment)',
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
    // Rethrow error so client knows it failed
    throw error;
  }
}

// Function to post a reply
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
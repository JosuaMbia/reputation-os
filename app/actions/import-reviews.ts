'use server'

import { ApifyClient } from 'apify-client';
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const apifyClient = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
});

export async function scrapeAndSaveReviews(input: string) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Non autorisé" };

    const business = await prisma.business.findFirst({ where: { userId } });
    if (!business) return { success: false, error: "Business introuvable" };

    const isUrl = input.trim().toLowerCase().startsWith("http");
    const isTrustpilot = input.toLowerCase().includes("trustpilot.com");

    let reviewsData: any[] = [];
    let source = "google";

    try {
        if (isTrustpilot) {
            // --- CAS TRUSTPILOT ---
            source = "trustpilot";
            const run = await apifyClient.actor("varys/trustpilot-scraper").call({
                startUrls: [{ url: input }],
                maxItems: 20,
            });
            const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
            reviewsData = items;
        } else {
            // --- CAS GOOGLE MAPS (Avec VOTRE robot) ---
            source = "google";
            console.log(`🚀 Google Maps (${isUrl ? 'URL' : 'Recherche'}) : ${input}`);

            // Configuration spécifique pour 'compass/crawler-google-places'
            const actorInput = {
                // Si c'est une URL on utilise startUrls, sinon searchStrings
                [isUrl ? "startUrls" : "searchStrings"]: [isUrl ? { url: input } : input],
                maxReviews: 30,           
                reviewsSort: "newest",    
                language: "fr",
                scrapeReviews: true,      // OBLIGATOIRE pour avoir les avis
                maxPlacesPerCrawl: 1,     // On veut juste le premier résultat qui correspond
            };

            // ✅ ON UTILISE LE BON ID (Celui de votre capture)
            const run = await apifyClient.actor("compass/crawler-google-places").call(actorInput);
            
            // Ce robot retourne des "Lieux", pas directement des avis
            const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

            if (!items || items.length === 0) {
                return { success: false, error: "Aucun établissement trouvé. Essayez d'être plus précis (ex: 'Midas Osny')." };
            }

            // On prend le premier établissement trouvé
            const place = items[0];
            
            // On extrait les avis qui sont DANS l'objet place
            reviewsData = place.reviews || [];

            // Petit fix : Si c'était une recherche, on sauve la vraie URL pour le QR Code
            if (!isUrl && (place.url || place.googleUrl)) {
                await prisma.business.update({ 
                    where: { id: business.id }, 
                    data: { googleUrl: place.url || place.googleUrl } 
                });
            }
        }

        if (reviewsData.length === 0) {
            return { success: false, error: "L'établissement a été trouvé mais ne contient aucun avis." };
        }

        // 3. SAUVEGARDE
        let count = 0;
        for (const item of reviewsData) {
            const content = item.text || item.content || ""; 
            
            const externalId = item.reviewId || item.id || `auto-${source}-${Date.now()}-${Math.random()}`;
            const rating = item.stars || item.rating || 0;
            const authorName = item.name || item.reviewerName || "Client Google";
            
            let dateStr = item.publishedAtDate || item.date || new Date().toISOString();

            await prisma.review.upsert({
                where: {
                    source_externalId: {
                        source: source,
                        externalId: String(externalId),
                    }
                },
                update: {},
                create: {
                    source: source,
                    externalId: String(externalId),
                    authorName: authorName,
                    rating: Number(rating),
                    content: content,
                    reviewDate: new Date(dateStr),
                    businessId: business.id,
                }
            });
            count++;
        }

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/reviews");
        
        return { success: true, message: `${count} avis importés avec succès !` };

    } catch (error: any) {
        console.error("Erreur Scraping:", error);
        return { success: false, error: "Erreur technique : " + error.message };
    }
}
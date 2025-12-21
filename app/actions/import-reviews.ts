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

    // 1. DÉTECTION : URL ou RECHERCHE ?
    const isUrl = input.trim().toLowerCase().startsWith("http");
    const isTrustpilot = input.toLowerCase().includes("trustpilot.com");

    let reviewsData: any[] = [];
    let source = "google";

    try {
        if (isTrustpilot) {
            // --- CAS TRUSTPILOT ---
            source = "trustpilot";
            console.log(`🚀 Trustpilot : ${input}`);
            await prisma.business.update({ where: { id: business.id }, data: { trustpilotUrl: input }});

            const run = await apifyClient.actor("varys/trustpilot-scraper").call({
                startUrls: [{ url: input }],
                maxItems: 30,
            });
            const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
            reviewsData = items;

        } else {
            // --- CAS GOOGLE MAPS ---
            source = "google";
            console.log(`🚀 Google Maps (${isUrl ? 'URL' : 'Recherche'}) : ${input}`);

            // On utilise le robot SPÉCIALISÉ AVIS (plus fiable pour ce besoin)
            // ID: compass/google-maps-reviews-crawler
            const actorInput = {
                // Si c'est une URL, on utilise 'startUrls', sinon 'searchTerms'
                [isUrl ? "startUrls" : "searchTerms"]: [isUrl ? { url: input } : input],
                maxReviews: 30,
                language: "fr",
                personalData: false // Respect RGPD
            };

            const run = await apifyClient.actor("compass/google-maps-reviews-crawler").call(actorInput);
            
            // Récupération des résultats
            const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
            reviewsData = items;

            // AUTO-CORRECTION : Si c'était une recherche, on sauvegarde l'URL trouvée pour le QR Code
            if (!isUrl && items.length > 0) {
                // Ce robot renvoie souvent l'URL dans 'googleUrl' ou 'url'
                const foundUrl = (items[0] as any).url || (items[0] as any).googleUrl;
                if (foundUrl) {
                    await prisma.business.update({ 
                        where: { id: business.id }, 
                        data: { googleUrl: foundUrl }
                    });
                }
            } else if (isUrl) {
                await prisma.business.update({ 
                    where: { id: business.id }, 
                    data: { googleUrl: input }
                });
            }
        }

        if (!reviewsData || reviewsData.length === 0) {
            return { success: false, error: "Aucun avis trouvé. Essayez une recherche plus simple (ex: 'Nom Ville')." };
        }

        // 3. SAUVEGARDE EN BASE
        let count = 0;
        
        for (const item of reviewsData) {
            const content = item.text || item.content || item.reviewBody || "";
            // ID unique solide
            const externalId = item.reviewId || item.id || `auto-${source}-${Date.now()}-${Math.random()}`;
            const rating = item.stars || item.rating || 0;
            const authorName = item.name || item.reviewerName || "Client";
            
            // Date : On gère les différents formats
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
        // Gestion spécifique de l'erreur "Actor not found" pour vous guider
        if (error.message.includes("Actor with this name was not found")) {
             return { success: false, error: "Erreur config Apify : Le robot 'compass/google-maps-reviews-crawler' n'est pas actif sur votre compte." };
        }
        return { success: false, error: "Erreur technique : " + error.message };
    }
}
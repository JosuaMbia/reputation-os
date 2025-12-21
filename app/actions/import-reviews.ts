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
    let reviewsData: any[] = [];
    let source = "google";

    try {
        console.log(`🚀 Lancement du robot pour : "${input}"`);

        // 2. CONFIGURATION DU ROBOT (compass/crawler-google-places)
        // Ce robot utilise 'searchStrings' pour les recherches et 'startUrls' pour les liens directs
        const actorInput = {
            [isUrl ? "startUrls" : "searchStrings"]: [isUrl ? { url: input } : input],
            maxReviews: 20,      // On veut les avis
            language: "fr",      // En français
            scrapeReviews: true, // IMPORTANT : On force l'extraction des avis
            reviewsSort: "newest", // Les plus récents
            maxImages: 0         // On économise en ne prenant pas les images pour l'instant
        };

        // ✅ CORRECTION DU NOM DU ROBOT
        const run = await apifyClient.actor("compass/crawler-google-places").call(actorInput);
        
        // Récupération des résultats (Ce sont des "Places", pas directement des avis)
        const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
        
        if (!items || items.length === 0) {
            return { success: false, error: "Aucun établissement trouvé. Essayez d'être plus précis (ex: 'Midas Osny')." };
        }

        // 3. TRAITEMENT DES DONNÉES (Structure spécifique : Place -> Reviews)
        let count = 0;
        
        // On parcourt les établissements trouvés (généralement 1 seul si c'est précis)
        for (const place of items) {
            
            // A. AUTO-CORRECTION : On sauvegarde l'URL officielle trouvée par le robot
            // Cela servira pour le QR Code plus tard
            if ((place.url || place.googleUrl) && !isUrl) {
                console.log("✅ URL Google détectée :", place.url);
                await prisma.business.update({
                    where: { id: business.id },
                    data: { googleUrl: place.url || place.googleUrl }
                });
            }

            // B. EXTRACTION DES AVIS DE CET ÉTABLISSEMENT
            const reviews = place.reviews || []; // Le tableau d'avis est à l'intérieur de l'objet Place

            for (const item of reviews) {
                const content = item.text || item.content || "";
                // On garde même les avis sans texte (juste des étoiles) car ça compte pour la moyenne
                
                // ID Unique : Certains avis n'ont pas d'ID, on en génère un basé sur l'auteur et la date
                const externalId = item.reviewId || item.id || `auto-${place.placeId}-${item.name}-${item.publishedAtDate}`;
                
                const dateStr = item.publishedAtDate || item.date || new Date().toISOString();

                await prisma.review.upsert({
                    where: {
                        source_externalId: {
                            source: "google",
                            externalId: String(externalId),
                        }
                    },
                    update: {},
                    create: {
                        source: "google",
                        externalId: String(externalId),
                        authorName: item.name || "Client Google",
                        rating: Number(item.stars || item.rating || 0),
                        content: content,
                        reviewDate: new Date(dateStr),
                        businessId: business.id,
                        // On pourrait ajouter response: item.responseFromOwnerText si on voulait récupérer l'existant
                    }
                });
                count++;
            }
        }

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/reviews");
        
        return { success: true, message: `${count} avis trouvés et importés !` };

    } catch (error: any) {
        console.error("Erreur Scraping:", error);
        return { success: false, error: "Erreur technique : " + (error.message || "Problème de connexion Apify") };
    }
}
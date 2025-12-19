'use server'

import { ApifyClient } from 'apify-client';
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Initialisation du client Apify
const apifyClient = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
});

export async function scrapeAndSaveReviews(url: string) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Non autorisé" };

    // 1. Récupérer le business de l'utilisateur
    const business = await prisma.business.findFirst({ where: { userId } });
    if (!business) return { success: false, error: "Business introuvable" };

    let reviewsData = [];
    let source = "";

    try {
        // 2. DÉTECTION DE LA SOURCE (GOOGLE OU TRUSTPILOT)
        if (url.includes("google.com/maps") || url.includes("goo.gl")) {
            source = "google";
            // On sauvegarde l'URL pour la prochaine fois
            await prisma.business.update({ where: { id: business.id }, data: { googleUrl: url }});
            
            // Lancement du Robot Google Maps (Actor: compass/google-maps-reviews-crawler)
            console.log("🚀 Lancement du scraping Google...");
            const run = await apifyClient.actor("compass/google-maps-reviews-crawler").call({
                startUrls: [{ url: url }],
                maxReviews: 20, // On limite à 20 pour le test (économise vos crédits)
                language: "fr",
            });
            // Récupération des résultats
            const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
            reviewsData = items;

        } else if (url.includes("trustpilot.com")) {
            source = "trustpilot";
            await prisma.business.update({ where: { id: business.id }, data: { trustpilotUrl: url }});

            // Lancement du Robot Trustpilot (Actor: varys/trustpilot-scraper)
            console.log("🚀 Lancement du scraping Trustpilot...");
            const run = await apifyClient.actor("varys/trustpilot-scraper").call({
                startUrls: [{ url: url }],
                maxItems: 20,
            });
            const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
            reviewsData = items;
        } else {
            return { success: false, error: "URL non reconnue (Google Maps ou Trustpilot uniquement)" };
        }

        // 3. TRANSFORMATION & SAUVEGARDE EN BASE
        let count = 0;
        
        for (const item of reviewsData) {
            // Normalisation des données car Google et Trustpilot ont des formats différents
            const externalId = item.id || item.reviewId || `generated-${Date.now()}-${Math.random()}`;
            const content = item.text || item.reviewBody || item.content || "";
            // Si pas de texte, on ignore l'avis (inutile pour l'IA)
            if (!content) continue;

            const rating = item.stars || item.rating || 0;
            const authorName = item.name || item.reviewerName || "Anonyme";
            // Gestion de la date (parfois complexe selon le format retourné)
            const dateStr = item.publishedAtDate || item.date || new Date().toISOString();
            
            // On utilise "upsert" pour ne pas créer de doublons si on re-scrape
            await prisma.review.upsert({
                where: {
                    source_externalId: {
                        source: source,
                        externalId: String(externalId),
                    }
                },
                update: {}, // Si existe déjà, on ne touche à rien
                create: {
                    source: source,
                    externalId: String(externalId),
                    authorName: authorName,
                    rating: Number(rating),
                    content: content,
                    date: new Date(dateStr),
                    businessId: business.id,
                }
            });
            count++;
        }

        revalidatePath("/dashboard/reviews");
        return { success: true, message: `${count} avis importés avec succès depuis ${source} !` };

    } catch (error: any) {
        console.error("Erreur Scraping:", error);
        return { success: false, error: "Erreur lors de l'importation : " + error.message };
    }
}
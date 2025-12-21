'use server'

import { ApifyClient } from 'apify-client';
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Initialisation du client Apify
const apifyClient = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
});

export async function scrapeAndSaveReviews(input: string) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Non autorisé" };

    // 1. Récupérer le business
    const business = await prisma.business.findFirst({ where: { userId } });
    if (!business) return { success: false, error: "Business introuvable" };

    let reviewsData = [];
    let source = "google"; // Par défaut
    
    // 2. INTELLIGENCE : EST-CE UNE URL OU UNE RECHERCHE ? 🧠
    // On regarde si ça commence par http (URL) ou si c'est du texte (Recherche)
    const isUrl = input.trim().toLowerCase().startsWith("http");
    const isTrustpilot = input.toLowerCase().includes("trustpilot.com");

    try {
        if (isTrustpilot) {
            // --- CAS TRUSTPILOT (URL UNIQUEMENT) ---
            source = "trustpilot";
            // Sauvegarde de l'URL TP
            await prisma.business.update({ where: { id: business.id }, data: { trustpilotUrl: input }});

            console.log("🚀 Lancement scraping Trustpilot...");
            const run = await apifyClient.actor("varys/trustpilot-scraper").call({
                startUrls: [{ url: input }],
                maxItems: 20,
            });
            const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
            reviewsData = items;

        } else {
            // --- CAS GOOGLE (URL OU RECHERCHE "MAGIQUE") ---
            source = "google";
            console.log(`🚀 Lancement Google Maps pour : "${input}" (Mode: ${isUrl ? 'URL' : 'Recherche'})`);

            // Configuration intelligente de l'Actor
            const actorInput = isUrl 
                ? { startUrls: [{ url: input }], maxReviews: 20, language: "fr" } // Mode URL
                : { searchTerms: [input], maxReviews: 20, language: "fr" };       // Mode Recherche par nom

            const run = await apifyClient.actor("compass/google-maps-reviews-crawler").call(actorInput);
            
            // Récupération des résultats
            const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
            reviewsData = items;

            // 🚨 AUTO-CORRECTION : Si c'était une recherche par nom, on récupère l'URL trouvée
            // pour la sauvegarder en BDD. Comme ça, le QR Code fonctionnera !
            if (!isUrl && items.length > 0) {
                // L'actor renvoie souvent l'URL dans les propriétés de l'avis ou via un champ 'googleUrl' / 'placeUrl'
                // Note: La structure dépend de l'actor exact, on prend ici 'url' ou 'googleUrl' si dispo
                const foundUrl = (items[0] as any).googleUrl || (items[0] as any).placeUrl || (items[0] as any).url;
                
                if (foundUrl && foundUrl.includes("google")) {
                    console.log("✅ URL trouvée via recherche :", foundUrl);
                    await prisma.business.update({ 
                        where: { id: business.id }, 
                        data: { googleUrl: foundUrl }
                    });
                }
            } else if (isUrl) {
                // Si c'était déjà une URL, on la sauvegarde simplement
                await prisma.business.update({ 
                    where: { id: business.id }, 
                    data: { googleUrl: input }
                });
            }
        }

        if (!reviewsData || reviewsData.length === 0) {
            return { success: false, error: "Aucun avis trouvé. Vérifiez le nom ou l'URL." };
        }

        // 3. TRANSFORMATION & SAUVEGARDE (Inchangé)
        let count = 0;
        
        for (const item of reviewsData) {
            // Mapping des champs (Gère les variations selon l'actor)
            const content = item.text || item.reviewBody || item.content || "";
            if (!content) continue; // On ignore les avis sans texte

            // Création d'un ID unique si l'actor n'en donne pas
            const externalId = item.id || item.reviewId || `auto-${source}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            const rating = item.stars || item.rating || 0;
            const authorName = item.name || item.reviewerName || item.authorTitle || "Anonyme";
            
            // Gestion de la date
            let dateStr = item.publishedAtDate || item.date;
            if (!dateStr) dateStr = new Date().toISOString();

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
        revalidatePath("/dashboard/reviews"); // Rafraîchit les deux pages
        
        return { success: true, message: `${count} avis importés et analysés !` };

    } catch (error: any) {
        console.error("Erreur Scraping:", error);
        return { success: false, error: "Erreur technique : " + (error.message || "Le robot n'a pas répondu.") };
    }
}
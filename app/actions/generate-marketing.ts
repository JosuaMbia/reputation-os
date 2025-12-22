'use server'

import OpenAI from 'openai';
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GenerateRequest {
    topic: string; // Ex: "Promo de Noël", "Nouveau Menu", "Fermeture exceptionnelle"
    platform: "INSTAGRAM" | "FACEBOOK" | "LINKEDIN";
    tone?: string; // "Fun", "Pro", "Urgent"
}

export async function generateMarketingPost(request: GenerateRequest) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Non autorisé" };

    // 1. Récupérer le contexte du Business (pour que l'IA connaisse l'entreprise)
    const business = await prisma.business.findFirst({
        where: { userId }
    });

    if (!business) return { success: false, error: "Aucun établissement configuré." };

    try {
        // 2. Construction du Prompt Intelligent
        const systemPrompt = `Tu es un expert en Social Media Marketing pour des commerces locaux.
        Ton client est : ${business.name} (${business.type || "Commerce"}).
        Ville : ${business.city || "Non spécifiée"}.
        Description : ${business.description || "Non spécifiée"}.
        
        Ta mission : Rédiger un post captivant pour ${request.platform}.
        Ton : ${request.tone || business.tone || "Professionnel et engageant"}.
        
        Règles :
        - Inclus des emojis pertinents.
        - Inclus 3 à 5 hashtags pertinents à la fin.
        - Structure le texte pour être lisible (sauts de ligne).
        - Si c'est Instagram, ne mets pas de liens dans le texte.
        - Si c'est LinkedIn, sois plus corporate mais humain.
        `;

        const userPrompt = `Sujet du post : "${request.topic}".
        Génère une légende (caption) prête à publier.`;

        // 3. Appel OpenAI
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            model: "gpt-4o-mini", // Modèle rapide et économique pour la prod
            temperature: 0.7,
        });

        const generatedText = completion.choices[0].message.content;

        if (!generatedText) throw new Error("L'IA n'a rien généré.");

        // 4. Sauvegarde en Base de Données (Brouillon)
        await prisma.socialPost.create({
            data: {
                businessId: business.id,
                platform: request.platform,
                caption: generatedText,
                status: "DRAFT",
                // On met une image par défaut ou vide pour l'instant
                imageUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=60", 
            }
        });

        revalidatePath("/dashboard/marketing");
        return { success: true };

    } catch (error: any) {
        console.error("Erreur IA:", error);
        return { success: false, error: "Erreur lors de la génération. Vérifiez votre clé API." };
    }
}
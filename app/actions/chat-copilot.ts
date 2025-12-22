'use server'

import OpenAI from 'openai';
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function chatWithCopilot(userMessage: string, history: any[]) {
    const { userId } = await auth();
    if (!userId) return { error: "Non connecté" };

    // 1. Récupération des DONNÉES CONTEXTUELLES (Le "Cerveau")
    const business = await prisma.business.findFirst({
        where: { userId },
        include: {
            reviews: {
                orderBy: { reviewDate: 'desc' },
                take: 30, // On analyse les 30 derniers avis pour ne pas exploser les tokens
                select: { rating: true, content: true, authorName: true, reviewDate: true }
            }
        }
    });

    if (!business) return { error: "Aucun business trouvé." };

    // 2. Calcul des Stats Rapides pour l'IA
    const totalReviews = await prisma.review.count({ where: { businessId: business.id } });
    const avgRating = business.reviews.reduce((acc, r) => acc + r.rating, 0) / (business.reviews.length || 1);
    
    // 3. Construction du Prompt Système (L'Expertise)
    const reviewsContext = business.reviews.map(r => 
        `[${r.rating}/5] ${r.content} (${new Date(r.reviewDate).toLocaleDateString()})`
    ).join("\n");

    const systemPrompt = `
    Tu es "Reputation Copilot", l'intelligence artificielle centrale de l'entreprise "${business.name}".
    
    CONTEXTE ENTREPRISE :
    - Activité : ${business.type || "Non spécifié"}
    - Ville : ${business.city || "Non spécifiée"}
    - Description : ${business.description || "Non spécifiée"}
    - Mots Clés Stratégiques (Settings) : ${business.seoKeywords || "Aucun"}
    - Ton de la marque : ${business.tone || "Professionnel"}

    DONNÉES AVIS (Echantillon des 30 derniers) :
    ${reviewsContext}

    STATS GLOBALES :
    - Note Moyenne (sur l'échantillon) : ${avgRating.toFixed(1)}/5
    - Volume Total (Base de données) : ${totalReviews} avis

    TES CAPACITÉS :
    1. ANALYSE : Tu dois identifier les forces et faiblesses récurrentes dans les avis.
    2. SYNTHÈSE : Si on te demande "Comment ça va ?", fais un résumé basé sur les avis récents.
    3. MARKETING : Si on parle de "Post", suggère une idée basée sur un avis positif récent.
    4. RÉPONSE : Si on parle d'un avis négatif, propose une réponse empathique.

    CONSIGNE :
    Sois concis, stratégique et actionnable. Utilise des emojis.
    Si tu détectes une faiblesse récurrente (ex: "service lent"), signale-la comme une priorité.
    Ne mentionne pas que tu es une IA, tu es le partenaire business.
    `;

    try {
        // 4. Appel OpenAI
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                ...history, // On garde l'historique de la conversation courte
                { role: "user", content: userMessage }
            ],
            model: "gpt-4o", // Utilisation du modèle le plus intelligent
            temperature: 0.7,
        });

        return { message: completion.choices[0].message.content };

    } catch (error) {
        console.error("Erreur Copilot:", error);
        return { error: "Désolé, je réfléchis trop fort. Réessayez." };
    }
}
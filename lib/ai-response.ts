import OpenAI from 'openai';
import { prisma } from "@/lib/prisma";

// 🗑️ ON SUPPRIME L'INITIALISATION GLOBALE ICI
// const openai = new OpenAI(...) <--- C'est ça qui fait planter le build !

interface GenerateParams {
  businessId: string;
  reviewText: string;
  reviewerName: string;
  starRating: number;
}

export async function generateReviewReply({
  businessId,
  reviewText,
  reviewerName,
  starRating
}: GenerateParams) {

  // 1. On initialise OpenAI UNIQUEMENT quand la fonction est appelée (Runtime)
  // Le build Vercel n'appellera jamais cette fonction, donc ça ne plantera plus jamais.
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error("⚠️ Clé OpenAI manquante (Runtime).");
    return "Merci beaucoup pour votre avis !";
  }

  const openai = new OpenAI({
    apiKey: apiKey, 
  });

  try {
    // 2. Récupérer les "Settings" du client depuis la DB
    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) throw new Error("Business introuvable");

    // Valeurs par défaut si le client n'a rien configuré
    const type = business.type || "Commerce";
    const city = business.city || "France";
    const keywords = business.seoKeywords || "";
    const tone = business.tone || "professional";
    const signature = business.signature || "";

    // 3. Construire l'instruction de Ton
    let toneInstruction = "";
    switch (tone) {
      case "friendly":
        toneInstruction = "Ton : Chaleureux, amical, utilise des emojis. Tu peux tutoyer si l'avis est très sympa.";
        break;
      case "empathetic":
        toneInstruction = "Ton : Très compréhensif, humble, centré sur l'humain. Excuse-toi sincèrement en cas de pépin.";
        break;
      default:
        toneInstruction = "Ton : Professionnel, courtois, vouvoiement obligatoire, concis.";
    }

    // 4. Instruction SEO
    let seoInstruction = "";
    if (starRating >= 4 && keywords) {
      seoInstruction = `
        OBJECTIF SEO : Essaie d'intégrer naturellement 1 ou 2 de ces mots-clés dans la réponse (sans forcer) : "${keywords}".
        Mentionne aussi la ville "${city}" si c'est pertinent pour le référencement local.
      `;
    } else if (starRating <= 3) {
      seoInstruction = "ATTENTION : Pas de mots-clés SEO sur un avis négatif. Reste sobre et orienté solution.";
    }

    // 5. Le Prompt Final
    const systemPrompt = `
      Tu es le gérant d'un établissement de type "${type}" situé à "${city}" appelé "${business.name}".
      
      TA MISSION :
      Répondre à un avis Google de manière ultra-personnalisée.
      
      RÈGLES :
      - ${toneInstruction}
      - ${seoInstruction}
      - Ne signe PAS la réponse (je l'ajouterai moi-même).
      - Langue : Français naturel (évite le style robotique).
      - Longueur : 3 phrases max.
    `;

    const userPrompt = `
      Avis de : ${reviewerName}
      Note : ${starRating}/5
      Message : "${reviewText}"
      
      Rédige la réponse maintenant.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", 
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
    });

    let finalReply = response.choices[0].message.content || "";

    if (signature) {
      finalReply += `\n\n${signature}`;
    }

    return finalReply;

  } catch (error) {
    console.error("Erreur OpenAI:", error);
    return "Merci pour votre avis !";
  }
}
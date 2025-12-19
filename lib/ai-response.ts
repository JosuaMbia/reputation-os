import OpenAI from 'openai';
import { prisma } from "@/lib/prisma";

// ⚠️ IMPORTANT : Pas de "const openai = new OpenAI(...)" ici !
// On laisse cet espace vide pour ne pas casser le build.

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

  // 1. Initialisation "Lazy" (Paresseuse) : On ne charge OpenAI que maintenant.
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error("❌ Erreur : Clé OpenAI manquante");
    return "Merci pour votre avis ! (Erreur configuration IA)";
  }

  const openai = new OpenAI({
    apiKey: apiKey, 
  });

  try {
    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) throw new Error("Business introuvable");

    const type = business.type || "Commerce";
    const city = business.city || "France";
    const keywords = business.seoKeywords || "";
    const tone = business.tone || "professional";
    const signature = business.signature || "";

    let toneInstruction = "";
    switch (tone) {
      case "friendly":
        toneInstruction = "Ton : Chaleureux, amical, utilise des emojis.";
        break;
      case "empathetic":
        toneInstruction = "Ton : Empathique, excusé, centré humain.";
        break;
      default:
        toneInstruction = "Ton : Professionnel, courtois, vouvoiement.";
    }

    let seoInstruction = "";
    if (starRating >= 4 && keywords) {
      seoInstruction = `SEO : Intègre naturellement "${keywords}" et la ville "${city}".`;
    }

    const systemPrompt = `
      Tu es le gérant de "${business.name}" (${type}) à ${city}.
      RÈGLES :
      - ${toneInstruction}
      - ${seoInstruction}
      - Pas de signature (ajoutée auto).
      - Français naturel. Max 3 phrases.
    `;

    const userPrompt = `Avis de ${reviewerName} (${starRating}/5) : "${reviewText}"`;

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
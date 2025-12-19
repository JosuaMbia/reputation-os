import OpenAI from 'openai';
import { prisma } from "@/lib/prisma";

// ⚠️ AUCUNE initialisation globale ici !

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
  // 🛡️ Initialisation UNIQUEMENT lors de l'appel (Runtime)
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return "Clé IA manquante.";

  const openai = new OpenAI({ apiKey });

  try {
    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) throw new Error("Business introuvable");

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Réponds à cet avis client poliment." },
        { role: "user", content: `Avis de ${reviewerName}: ${reviewText}` }
      ]
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Erreur IA:", error);
    return "Merci pour votre avis !";
  }
}

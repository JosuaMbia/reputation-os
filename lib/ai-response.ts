import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GenerateParams {
  businessName: string;
  reviewText: string;
  reviewerName: string;
  starRating: number;
  tone?: "professional" | "friendly" | "empathetic"; // On rendra ça dynamique plus tard
}

export async function generateReviewReply({
  businessName,
  reviewText,
  reviewerName,
  starRating,
  tone = "professional"
}: GenerateParams) {

  // 1. Définir la personnalité de l'IA (Le Prompt Système)
  // C'est ici qu'on rend l'IA "Intelligente"
  let toneInstruction = "";
  switch (tone) {
    case "friendly":
      toneInstruction = "Adopte un ton chaleureux, amical, tutoie si nécessaire et utilise un emoji si approprié.";
      break;
    case "empathetic":
      toneInstruction = "Sois très compréhensif, excuse-toi sincèrement si nécessaire, et montre que tu te soucies du client.";
      break;
    default:
      toneInstruction = "Reste professionnel, courtois, vouvoie le client et sois concis.";
  }

  const systemPrompt = `
    Tu es le propriétaire ou le manager de l'établissement nommé "${businessName}".
    Ta mission est de répondre à un avis client Google.
    
    CONSIGNES DE STYLE :
    - ${toneInstruction}
    - Ne signe pas la réponse (l'utilisateur le fera).
    - Sois naturel, évite le langage "ChatGPT" trop générique.
    - Réponds en Français.
    - Si l'avis est positif : Remercie chaleureusement et invite à revenir.
    - Si l'avis est négatif : Ne sois pas défensif. Remercie pour le feedback, excuse-toi pour l'expérience, et propose une solution ou invite à contacter le support.
  `;

  const userPrompt = `
    Voici l'avis reçu :
    Client : ${reviewerName}
    Note : ${starRating}/5 étoiles
    Message : "${reviewText}"
    
    Rédige une réponse adaptée.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Le meilleur modèle actuel
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7, // Créativité équilibrée
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Erreur OpenAI:", error);
    return "Merci beaucoup pour votre avis ! Nous sommes ravis de vous avoir accueilli."; // Fallback en cas d'erreur
  }
}
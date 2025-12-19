import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateReviewReply } from "@/lib/ai-response"; // ✅ Import sécurisé

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const formData = await request.formData();
    const reviewId = formData.get("reviewId") as string;

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { business: true }
    });

    if (!review) {
      return NextResponse.json({ error: "Avis non trouvé" }, { status: 404 });
    }

    // ✅ On utilise la fonction helper qui gère le "Lazy Loading" d'OpenAI
    // Cela évite le crash "apiKey missing" pendant le build Vercel
    const generatedResponse = await generateReviewReply({
        businessId: review.businessId,
        reviewText: review.content,
        reviewerName: review.authorName,
        starRating: review.rating
    });

    // Mise à jour de l'avis en base de données
    await prisma.review.update({
      where: { id: reviewId },
      data: { response: generatedResponse }
    });

    // Redirection vers la page de détail de l'avis
    return NextResponse.redirect(new URL(`/dashboard/reviews/${reviewId}`, request.url));

  } catch (error) {
    console.error("Erreur génération IA:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
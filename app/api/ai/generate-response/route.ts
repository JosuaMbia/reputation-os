import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateReviewReply } from "@/lib/ai-response";

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

    // On utilise la fonction helper sécurisée (Lazy Loading)
    const generatedResponse = await generateReviewReply({
        businessId: review.businessId,
        reviewText: review.content,
        reviewerName: review.authorName,
        starRating: review.rating
    });

    await prisma.review.update({
      where: { id: reviewId },
      data: { response: generatedResponse }
    });

    return NextResponse.redirect(new URL(`/dashboard/reviews/${reviewId}`, request.url));
  } catch (error) {
    console.error("Erreur génération IA:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

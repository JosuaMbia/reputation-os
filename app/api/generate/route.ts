import { NextResponse } from 'next/server';
import { generateReviewReply } from '@/lib/ai-response';
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const FREE_LIMIT = 3;

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();

  // 1. Récupérer le business et ses infos d'abonnement
  const business = await prisma.business.findFirst({
    where: { id: body.businessId, userId }
  });

  if (!business) return NextResponse.json({ error: "Business introuvable" }, { status: 404 });

  // 2. Vérifier si c'est un utilisateur PRO
  const isPro = business.stripeCurrentPeriodEnd && new Date(business.stripeCurrentPeriodEnd) > new Date();

  // 3. LOGIQUE DU COMPTEUR (Uniquement pour les non-pros)
  if (!isPro) {
    // A. Est-ce qu'on doit remettre le compteur à zéro ? (Nouveau mois ?)
    const now = new Date();
    const lastReset = new Date(business.aiUsageLimitDate);
    
    // Si nous sommes dans un mois différent de la dernière date limite
    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
       await prisma.business.update({
         where: { id: business.id },
         data: { aiUsageCount: 0, aiUsageLimitDate: now }
       });
       business.aiUsageCount = 0; // On met à jour la variable locale
    }

    // B. Vérification fatale : Est-ce qu'il a dépassé la limite ?
    if (business.aiUsageCount >= FREE_LIMIT) {
      return NextResponse.json({ 
        error: "Quota atteint", 
        limitReached: true,
        message: "Vous avez atteint votre limite de 3 réponses gratuites ce mois-ci. Passez Pro pour continuer." 
      }, { status: 403 });
    }
  }

  // 4. Si on arrive ici, c'est bon ! On génère la réponse.
  try {
    const reply = await generateReviewReply(body);

    // 5. On incrémente le compteur (si succès)
    await prisma.business.update({
      where: { id: business.id },
      data: { aiUsageCount: { increment: 1 } }
    });

    return NextResponse.json({ reply });
  } catch (e) {
    return NextResponse.json({ error: "Erreur IA" }, { status: 500 });
  }
}
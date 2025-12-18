import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

// URL de base de l'application (en local ou en prod)
// Assurez-vous d'avoir défini NEXT_PUBLIC_APP_URL dans votre .env
const settingsUrl = process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription`
  : "http://localhost:3000/dashboard/subscription";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    // 1. On récupère le business de l'utilisateur
    const business = await prisma.business.findFirst({
      where: { userId }
    });

    if (!business) {
      return new NextResponse("Business introuvable", { status: 404 });
    }

    // 2. On prépare la session Stripe
    // Si l'utilisateur a déjà un ID Stripe, on le réutilise pour ne pas créer de doublons
    let stripeCustomerId = business.stripeCustomerId;

    if (!stripeCustomerId) {
        // Création d'un nouveau client Stripe si pas encore existant
        const customer = await stripe.customers.create({
            email: await auth().then(a => a.sessionClaims?.email as string || undefined),
            metadata: {
                businessId: business.id,
                userId: userId
            }
        });
        stripeCustomerId = customer.id;

        // On sauvegarde l'ID dans notre base
        await prisma.business.update({
            where: { id: business.id },
            data: { stripeCustomerId }
        });
    }

    // 3. Création de la session de paiement (Checkout)
    const stripeSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          // ⚠️ IMPORTANT : Remplacez par VOTRE Price ID Stripe (copié depuis le dashboard Stripe)
          // Ex: price_1QxyZ...
          price: "prod_Td3E4VEtvCKiYQ", 
          quantity: 1,
        },
      ],
      success_url: `${settingsUrl}?success=true`,
      cancel_url: `${settingsUrl}?canceled=true`,
      metadata: {
        businessId: business.id,
        userId: userId,
      },
    });

    // 4. On redirige l'utilisateur vers la page de paiement Stripe
    if (!stripeSession.url) {
        return new NextResponse("Erreur création session Stripe", { status: 500 });
    }

    return NextResponse.redirect(stripeSession.url);

  } catch (error) {
    console.error("[STRIPE_ERROR]", error);
    return new NextResponse("Erreur Interne", { status: 500 });
  }
}
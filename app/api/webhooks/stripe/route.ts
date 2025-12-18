import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  
  // 1. Récupération des headers (Compatible Next.js 15+)
  const headerList = await headers();
  const signature = headerList.get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // 2. CAS A : Premier paiement réussi (Checkout)
  if (event.type === "checkout.session.completed") {
    // 🔥 CORRECTION ULTIME : on utilise "as any" pour forcer TypeScript à accepter
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    ) as any;

    if (!session?.metadata?.businessId) {
      return new NextResponse("Business ID manquant dans les métadonnées", { status: 400 });
    }

    await prisma.business.update({
      where: {
        id: session.metadata.businessId,
      },
      data: {
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0].price.id,
        // TypeScript ne bloquera plus ici grâce au "any"
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000
        ),
      },
    });
  }

  // 3. CAS B : Renouvellement mensuel réussi (Invoice)
  if (event.type === "invoice.payment_succeeded") {
    // 🔥 CORRECTION ULTIME ICI AUSSI
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    ) as any;

    await prisma.business.update({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      data: {
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000
        ),
      },
    });
  }

  return new NextResponse(null, { status: 200 });
}
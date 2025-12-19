import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

// 🚀 CRITIQUE : On force le mode dynamique
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Non autorisé", { status: 401 });

    const body = await req.json();
    const { businessId, priceId } = body;

    const business = await prisma.business.findUnique({
      where: { id: businessId, userId },
    });

    if (!business) return new NextResponse("Business introuvable", { status: 404 });

    const session = await stripe.checkout.sessions.create({
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer_email: "test@example.com", 
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { businessId: business.id, userId: userId },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[STRIPE_CHECKOUT]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}

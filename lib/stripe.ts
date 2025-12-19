import Stripe from "stripe";

// Si la clé est absente (build), on met une clé bidon pour éviter le crash
const stripeKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder_for_build_only";

export const stripe = new Stripe(stripeKey, {
  apiVersion: "2025-01-27.acacia" as any,
  typescript: true,
});
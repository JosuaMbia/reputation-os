import Stripe from "stripe";

// On initialise Stripe avec la clé secrète.
// Le "!" indique à TypeScript que la variable existe (ou plantera si absente, mais c'est normal pour Stripe).
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia" as any, // On utilise "as any" pour éviter les conflits de version TypeScript
  typescript: true,
});
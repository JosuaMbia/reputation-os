import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // On utilise 'as any' pour éviter que TypeScript ne bloque sur la version exacte
  apiVersion: '2025-12-15.clover' as any, 
  typescript: true,
});
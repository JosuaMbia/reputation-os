import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// 1. Définition des routes publiques
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/',                // Landing Page
  '/api/webhooks(.*)' // Webhooks (Stripe/Clerk)
]);

export default clerkMiddleware((auth, request) => {
  // 2. On récupère l'objet auth (SANS await)
  const { userId } = auth();

  // 3. Redirection intelligente : Si connecté et sur l'accueil -> Dashboard
  if (userId && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 4. Protection : Si la route n'est pas publique, on protège (SANS await)
  if (!isPublicRoute(request)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    // Regex pour ignorer les fichiers statiques
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Toujours exécuter sur les routes API
    '/(api|trpc)(.*)',
  ],
};
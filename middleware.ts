import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// On définit les routes publiques
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/', // La Landing Page est publique
  '/api/webhooks(.*)' // Important pour plus tard (Stripe)
]);

export default clerkMiddleware(async (auth, request) => {
  // 1. On récupère l'objet auth en appelant la fonction
  const authObject = await auth();
  const userId = authObject.userId;
  
  // 2. Si l'utilisateur est connecté et essaie d'aller sur l'accueil public, on l'envoie au Dashboard
  if (userId && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // 3. Si la route n'est PAS publique, on la protège
  if (!isPublicRoute(request)) {
    // CORRECTION ICI : on appelle protect() sur l'objet récupéré
    await authObject.protect();
  }
});

export const config = {
  matcher: [
    // Regex standard recommandée par Clerk pour ignorer les fichiers statiques
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
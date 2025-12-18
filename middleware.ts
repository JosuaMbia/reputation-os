import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// 1. Définition des routes publiques
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/',                // Landing Page
  '/api/webhooks(.*)' // Webhooks (Stripe/Clerk)
]);

export default clerkMiddleware(async (auth, request) => {
  // 2. On attend la promesse pour avoir l'objet (Fix de l'erreur "Promise")
  const { userId, redirectToSignIn } = await auth();

  // 3. Redirection Dashboard : Si connecté et sur la page d'accueil
  if (userId && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 4. Protection Manuelle (Fix de l'erreur "protect does not exist")
  // Si la route n'est pas publique et que l'utilisateur n'est pas connecté
  if (!isPublicRoute(request) && !userId) {
    // On le redirige vers le login
    return redirectToSignIn();
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
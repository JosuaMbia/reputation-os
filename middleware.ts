import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/',
  '/api/webhooks(.*)'
]);

export default clerkMiddleware(async (auth, request) => {
  // 1. On attend la promesse pour avoir l'objet (Fix de l'erreur "Promise")
  const { userId, redirectToSignIn } = await auth();

  // 2. Redirection Dashboard : Si connecté et sur la page d'accueil
  if (userId && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 3. Protection Manuelle (Fix de l'erreur "protect does not exist")
  // Si la route n'est pas publique et que l'utilisateur n'est pas connecté
  if (!isPublicRoute(request) && !userId) {
    // On le redirige vers le login
    return redirectToSignIn();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
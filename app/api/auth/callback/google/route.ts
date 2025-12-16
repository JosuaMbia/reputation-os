// app/api/auth/callback/google/route.ts
// Callback OAuth2 Google - Gère le retour après autorisation

import { NextRequest, NextResponse } from 'next/server';
import { getTokensFromCode } from '@/lib/google-oauth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // userId de Clerk
    const error = searchParams.get('error');

    // Gérer les erreurs d'autorisation
    if (error) {
      console.error('Google OAuth error:', error);
      return NextResponse.redirect(
        new URL(`/dashboard?error=${error}`, request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/dashboard?error=missing_parameters', request.url)
      );
    }

    // Échanger le code contre des tokens
    const tokens = await getTokensFromCode(code);

    if (!tokens.access_token) {
      throw new Error('No access token received');
    }

    // Sauvegarder les tokens dans la base de données
    // Tu peux créer une table GoogleTokens ou ajouter les champs au modèle User
    await prisma.user.upsert({
      where: { id: state },
      create: {
        id: state,
        email: '', // Tu peux récupérer l'email via l'API Google userinfo
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token || null,
        googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      },
      update: {
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token || null,
        googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      },
    });

    // Rediriger vers le dashboard avec succès
    return NextResponse.redirect(
      new URL('/dashboard?google_connected=true', request.url)
    );

  } catch (error) {
    console.error('Error in Google OAuth callback:', error);
    return NextResponse.redirect(
      new URL('/dashboard?error=callback_failed', request.url)
    );
  }
}

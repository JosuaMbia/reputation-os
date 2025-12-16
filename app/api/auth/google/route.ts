// app/api/auth/google/route.ts
// Endpoint pour initier la connexion Google OAuth2

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getAuthUrl } from '@/lib/google-oauth';

export async function GET(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est authentifié avec Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Générer l'URL d'autorisation Google
    const authUrl = getAuthUrl(userId);

    // Rediriger vers Google pour l'autorisation
    return NextResponse.redirect(authUrl);
    
  } catch (error) {
    console.error('Error initiating Google OAuth:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Google authentication' },
      { status: 500 }
    );
  }
}

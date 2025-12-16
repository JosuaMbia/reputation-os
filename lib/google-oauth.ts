// lib/google-oauth.ts
// Gestion de l'authentification OAuth2 pour Google Business Profile API

import { OAuth2Client } from 'google-auth-library';

// Configuration OAuth2
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/google';

// Scopes nécessaires pour Google Business Profile
const SCOPES = [
  'https://www.googleapis.com/auth/business.manage',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

// Créer le client OAuth2
export function createOAuth2Client() {
  return new OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );
}

// Générer l'URL d'autorisation Google
export function getAuthUrl(userId: string): string {
  const oauth2Client = createOAuth2Client();
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline', // Pour obtenir un refresh token
    scope: SCOPES,
    state: userId, // Pour identifier l'utilisateur après le callback
    prompt: 'consent', // Force l'affichage de l'écran de consentement
  });
}

// Échanger le code d'autorisation contre des tokens
export async function getTokensFromCode(code: string) {
  const oauth2Client = createOAuth2Client();
  
  try {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  } catch (error) {
    console.error('Error getting tokens:', error);
    throw new Error('Failed to exchange authorization code for tokens');
  }
}

// Créer un client OAuth2 avec des tokens existants
export function createAuthenticatedClient(accessToken: string, refreshToken?: string) {
  const oauth2Client = createOAuth2Client();
  
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  
  return oauth2Client;
}

// Rafraîchir le token d'accès
export async function refreshAccessToken(refreshToken: string) {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });
  
  try {
    const { credentials } = await oauth2Client.refreshAccessToken();
    return credentials;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw new Error('Failed to refresh access token');
  }
}

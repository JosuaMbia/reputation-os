import { google } from 'googleapis';

export const getOAuth2Client = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  // Utiliser l'URL configurée ou une valeur par défaut pour la prod/dev
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const redirectUri = `${appUrl}/api/auth/callback/google`;

  if (!clientId || !clientSecret) {
    console.error("❌ ERREUR CRITIQUE : Variables d'environnement Google manquantes !");
    console.error("GOOGLE_CLIENT_ID est défini ?", !!clientId);
    console.error("GOOGLE_CLIENT_SECRET est défini ?", !!clientSecret);
    throw new Error("Configuration Google OAuth incomplète sur le serveur.");
  }

  return new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );
};

export const createAuthenticatedClient = (accessToken: string, refreshToken?: string) => {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken
  });
  return oauth2Client;
};

export const refreshAccessToken = async (refreshToken: string) => {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    refresh_token: refreshToken
  });

  const { credentials } = await oauth2Client.refreshAccessToken();
  return credentials;
};
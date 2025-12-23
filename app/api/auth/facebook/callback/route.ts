import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL("/dashboard/settings?error=facebook_denied", req.url));
  }

  try {
    const APP_ID = process.env.FACEBOOK_APP_ID;
    const APP_SECRET = process.env.FACEBOOK_APP_SECRET;
    const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/facebook/callback`;

    // 1. Échanger le code contre un Short-Lived Token
    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${APP_ID}&redirect_uri=${REDIRECT_URI}&client_secret=${APP_SECRET}&code=${code}`;
    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (tokenData.error) throw new Error(tokenData.error.message);

    const shortLivedToken = tokenData.access_token;

    // 2. Échanger le Short-Lived contre un Long-Lived Token (60 jours)
    const longLivedUrl = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&fb_exchange_token=${shortLivedToken}`;
    const longLivedRes = await fetch(longLivedUrl);
    const longLivedData = await longLivedRes.json();
    
    const finalUserToken = longLivedData.access_token || shortLivedToken;

    // 3. Récupérer les Pages gérées par cet utilisateur
    // On a besoin du token de page pour publier, pas juste du token utilisateur
    const pagesUrl = `https://graph.facebook.com/v19.0/me/accounts?access_token=${finalUserToken}`;
    const pagesRes = await fetch(pagesUrl);
    const pagesData = await pagesRes.json();

    if (!pagesData.data || pagesData.data.length === 0) {
      return NextResponse.redirect(new URL("/dashboard/settings?error=no_pages_found", req.url));
    }

    // 👉 STRATÉGIE V1 : On prend la première page trouvée automatiquement
    // (En V2, on pourrait demander à l'utilisateur de choisir)
    const selectedPage = pagesData.data[0];
    const pageAccessToken = selectedPage.access_token; // C'est CE token qui permet de publier
    const pageId = selectedPage.id;

    // 4. Récupérer le compte Instagram Business lié (si existe)
    const instaUrl = `https://graph.facebook.com/v19.0/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`;
    const instaRes = await fetch(instaUrl);
    const instaData = await instaRes.json();
    const instagramId = instaData.instagram_business_account?.id || null;

    // 5. Sauvegarde en Base de Données
    await prisma.business.updateMany({
      where: { userId },
      data: {
        facebookAccessToken: pageAccessToken, // On stocke le token de la PAGE
        facebookPageId: pageId,
        instagramAccessToken: pageAccessToken, // Le même token sert souvent pour Insta via la page
        instagramAccountId: instagramId,
      },
    });

    // 6. Succès : Retour aux paramètres
    return NextResponse.redirect(new URL("/dashboard/settings?success=facebook_connected", req.url));

  } catch (err) {
    console.error("Erreur OAuth Facebook:", err);
    return NextResponse.redirect(new URL("/dashboard/settings?error=server_error", req.url));
  }
}
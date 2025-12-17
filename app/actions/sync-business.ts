'use server'

import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { syncGoogleReviews } from "@/lib/google-business";
import { revalidatePath } from "next/cache";

export async function syncBusinessData() {
  const { userId } = await auth();
  if (!userId) throw new Error("Non authentifié");

  try {
    console.log("🛠️ Vérification des tokens utilisateur...");

    // 1. AUTO-RÉPARATION : On récupère le Token Google frais depuis Clerk
    const client = await clerkClient();
    
    // On demande le token Google ('oauth_google')
    const tokenResponse = await client.users.getUserOauthAccessToken(userId, 'oauth_google');
    
    if (tokenResponse.data.length === 0) {
       throw new Error("Compte Google non connecté dans Clerk. Veuillez vous déconnecter et vous reconnecter au site.");
    }
    
    // We cast to 'any' to avoid the TypeScript error on providerRefreshToken
    // because the strict type definition might be missing it in this version
    const googleData = tokenResponse.data[0] as any;
    
    // On récupère aussi les infos de base (email, nom) pour remplir la base proprement
    const clerkUser = await client.users.getUser(userId);
    const email = clerkUser.emailAddresses[0]?.emailAddress || "no-email@error.com";
    const name = clerkUser.fullName || clerkUser.firstName || "Utilisateur";

    // 2. On force la sauvegarde de l'utilisateur et de son Token dans Neon
    await prisma.user.upsert({
      where: { id: userId },
      create: {
        id: userId,
        email: email,
        name: name,
        googleAccessToken: googleData.token,
        googleRefreshToken: googleData.providerRefreshToken || undefined,
      },
      update: {
        // On met à jour le token à chaque synchro pour être sûr qu'il est valide
        googleAccessToken: googleData.token,
        // On ne met à jour le refresh token que s'il est fourni (Google ne le renvoie pas toujours)
        ...(googleData.providerRefreshToken ? { googleRefreshToken: googleData.providerRefreshToken } : {}),
      }
    });
    
    console.log("✅ Utilisateur & Tokens synchronisés en BDD !");

    // 3. Gestion du Business (Création si inexistant)
    let business = await prisma.business.findFirst({
      where: { userId: userId }
    });

    if (!business) {
      console.log("🆕 Création du business initial...");
      business = await prisma.business.create({
        data: {
          userId: userId,
          name: "Mon Établissement (Synchro...)",
        }
      });
    }

    // 4. Lancement de la Synchro Google Business
    console.log(`🔄 Lancement de la synchro Google pour ${business.id}`);
    await syncGoogleReviews(business.id, userId);

    revalidatePath("/dashboard");
    
    return { success: true };

  } catch (error: any) {
    console.error("❌ Erreur Server Action:", error);
    throw new Error(error.message || "Erreur de synchronisation");
  }
}
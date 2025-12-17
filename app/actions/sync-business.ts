'use server'

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { syncGoogleReviews } from "@/lib/google-business";
import { revalidatePath } from "next/cache";

export async function syncBusinessData() {
  const { userId } = await auth();
  if (!userId) throw new Error("Non authentifié");

  try {
    // 1. On cherche si un business existe déjà
    let business = await prisma.business.findFirst({
      where: { userId: userId }
    });

    // 2. S'il n'existe pas, on le CRÉE
    if (!business) {
      console.log("🆕 Création du business initial pour l'utilisateur...");
      business = await prisma.business.create({
        data: {
          userId: userId,
          name: "Mon Établissement (Synchro...)",
        }
      });
    }

    // 3. On lance la synchro
    console.log(`🔄 Lancement de la synchro pour le business ${business.id}`);
    await syncGoogleReviews(business.id, userId);

    // 4. On rafraîchit la page pour que l'utilisateur voie le résultat
    revalidatePath("/dashboard");
    
    return { success: true };

  } catch (error: any) {
    console.error("❌ Erreur Server Action:", error);
    // On renvoie l'erreur pour que le client puisse l'afficher si besoin
    throw new Error(error.message || "Erreur de synchronisation");
  }
}
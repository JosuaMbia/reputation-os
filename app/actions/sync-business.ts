'use server'

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { syncGoogleReviews } from "@/lib/google-business";
import { revalidatePath } from "next/cache";

// ✅ Fix: On ajoute "formData" en argument et on retire le return pour satisfaire TypeScript
export async function syncBusinessData(formData?: FormData) {
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

    // 4. On rafraîchit la page
    revalidatePath("/dashboard");
    
    // Note: On ne retourne rien ici pour que la fonction soit compatible avec <form action={...}>

  } catch (error: any) {
    console.error("❌ Erreur Server Action:", error);
    // En cas d'erreur dans un Server Action de formulaire, on log juste côté serveur
    // L'UI ne sera pas mise à jour, ou vous pourriez utiliser useFormState pour gérer les erreurs plus tard.
  }
}
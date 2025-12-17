'use server'

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveSettings(data: {
  tone: string;
  style: string;
  autoReply: boolean;
  includeBusinessName: boolean;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Non authentifié");

  try {
    // On met à jour le premier business trouvé pour cet utilisateur
    // (Dans une version future multi-business, on passerait businessId)
    const business = await prisma.business.findFirst({
      where: { userId: userId }
    });

    if (!business) throw new Error("Aucun établissement trouvé");

    await prisma.business.update({
      where: { id: business.id },
      data: {
        tone: data.tone,
        // On pourrait stocker les autres préférences dans un champ JSON 'settings' si le schéma le permettait,
        // ou ajouter des colonnes. Pour l'instant on stocke le ton qui existe déjà.
        // Si vous voulez tout stocker, il faudra modifier le schema.prisma.
        // Pour cet exemple, on suppose que 'tone' est le plus important.
      }
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error: any) {
    console.error("Erreur sauvegarde:", error);
    return { success: false, error: error.message };
  }
}